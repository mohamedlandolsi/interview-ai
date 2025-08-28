import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse the request body for confirmation
    const body = await request.json()
    const { confirmation } = body

    // Require explicit confirmation
    if (confirmation !== 'DELETE') {
      return NextResponse.json(
        { error: 'Invalid confirmation. Type "DELETE" to confirm account deletion.' },
        { status: 400 }
      )
    }

    // Clean up user's avatar files from storage
    try {
      const { data: files } = await supabase.storage
        .from('avatars')
        .list(user.id)

      if (files && files.length > 0) {
        const filePaths = files.map(file => `${user.id}/${file.name}`)
        await supabase.storage
          .from('avatars')
          .remove(filePaths)
      }
    } catch (storageError) {
      console.warn('Error cleaning up avatar files:', storageError)
      // Continue with account deletion even if storage cleanup fails
    }

    // Call the secure database function to delete the user account
    const { error: deleteError } = await supabase.rpc('delete_user_account', {
      user_id: user.id
    })

    if (deleteError) {
      console.error('Account deletion error:', deleteError)
      
      if (deleteError.message.includes('User not found')) {
        return NextResponse.json(
          { error: 'User account not found' },
          { status: 404 }
        )
      }
      
      return NextResponse.json(
        { error: 'Failed to delete account. Please try again or contact support.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Account deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting account:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
