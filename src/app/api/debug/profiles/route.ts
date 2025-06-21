import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Get all profiles
    const profiles = await prisma.profile.findMany({
      select: {
        id: true,
        full_name: true,
        role: true,
        created_at: true,
      },
      orderBy: {
        created_at: 'desc'
      }
    })

    const profileCount = await prisma.profile.count()

    return NextResponse.json({
      success: true,
      totalProfiles: profileCount,
      profiles: profiles,
      message: `Found ${profileCount} profiles in the database`
    })

  } catch (error) {
    console.error('Error fetching profiles:', error)
    return NextResponse.json(
      { error: 'Failed to fetch profiles', details: error },
      { status: 500 }
    )
  }
}
