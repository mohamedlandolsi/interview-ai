#!/usr/bin/env node

/**
 * Update the existing avatar URL in the database to remove cache-busting
 * so the current avatar displays, and cache-busting will work for new uploads
 */

const { PrismaClient } = require('@prisma/client')

async function fixExistingAvatarUrl() {
  const prisma = new PrismaClient()
  
  try {
    console.log('🔧 Fixing Existing Avatar URL')
    console.log('============================\n')
    
    // Get the current profile
    const profile = await prisma.profile.findUnique({
      where: {
        id: '4e638dca-7b20-4a2c-9393-a66c45ae2586'
      },
      select: {
        id: true,
        full_name: true,
        avatar_url: true
      }
    })
    
    if (!profile) {
      console.log('❌ Profile not found')
      return
    }
    
    console.log('📋 Current Profile:')
    console.log('   Name:', profile.full_name)
    console.log('   Avatar URL:', profile.avatar_url)
    
    if (profile.avatar_url) {
      // Remove any existing cache-busting parameters
      const cleanUrl = profile.avatar_url.split('?')[0]
      console.log('   Clean URL:', cleanUrl)
      
      if (cleanUrl !== profile.avatar_url) {
        console.log('\n🔄 Updating to clean URL...')
        
        const updatedProfile = await prisma.profile.update({
          where: { id: profile.id },
          data: {
            avatar_url: cleanUrl,
            updated_at: new Date()
          }
        })
        
        console.log('✅ Avatar URL updated successfully!')
        console.log('   New URL:', updatedProfile.avatar_url)
        console.log('   Updated at:', updatedProfile.updated_at)
        
        console.log('\n🎯 What this fixes:')
        console.log('   • Current avatar will now display immediately')
        console.log('   • New uploads will still use cache-busting')
        console.log('   • Frontend cache-busting logic remains active')
        
      } else {
        console.log('✅ Avatar URL is already clean (no cache-busting parameters)')
      }
    } else {
      console.log('❌ No avatar URL found in profile')
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

fixExistingAvatarUrl()
