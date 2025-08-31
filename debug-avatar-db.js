#!/usr/bin/env node

/**
 * Debug script to check avatar upload issues
 */

const { PrismaClient } = require('@prisma/client')

async function debugAvatarIssue() {
  const prisma = new PrismaClient()
  
  try {
    console.log('🔍 Debugging Avatar Upload Issue')
    console.log('================================\n')
    
    // Check the current user's profile in the database
    const profiles = await prisma.profile.findMany({
      select: {
        id: true,
        full_name: true,
        avatar_url: true,
        updated_at: true
      },
      orderBy: {
        updated_at: 'desc'
      },
      take: 5
    })
    
    console.log('📋 Recent Profiles with Avatar URLs:')
    profiles.forEach((profile, index) => {
      console.log(`   ${index + 1}. ${profile.full_name || 'No name'}`)
      console.log(`      ID: ${profile.id}`)
      console.log(`      Avatar URL: ${profile.avatar_url || 'NULL'}`)
      console.log(`      Updated: ${profile.updated_at}`)
      console.log('')
    })
    
    // Check for any profiles with avatar URLs
    const profilesWithAvatars = await prisma.profile.findMany({
      where: {
        avatar_url: {
          not: null
        }
      },
      select: {
        id: true,
        full_name: true,
        avatar_url: true,
        updated_at: true
      }
    })
    
    console.log(`📊 Total profiles with avatars: ${profilesWithAvatars.length}`)
    
    if (profilesWithAvatars.length > 0) {
      console.log('\n✅ Profiles with Avatar URLs:')
      profilesWithAvatars.forEach((profile, index) => {
        console.log(`   ${index + 1}. ${profile.full_name || 'No name'}`)
        console.log(`      Avatar URL: ${profile.avatar_url}`)
        console.log(`      Has cache-busting: ${profile.avatar_url?.includes('?t=') ? 'YES' : 'NO'}`)
        console.log('')
      })
    } else {
      console.log('\n❌ No profiles found with avatar URLs')
      console.log('   This might be the issue - avatar_url is not being saved to database')
    }
    
  } catch (error) {
    console.error('❌ Database error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

debugAvatarIssue()
