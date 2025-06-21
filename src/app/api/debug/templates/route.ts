import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Get all templates
    const templates = await prisma.interviewTemplate.findMany({
      select: {
        id: true,
        title: true,
        name: true,
        description: true,
        category: true,
        created_at: true,
      },
      orderBy: {
        created_at: 'desc'
      }
    })

    const templateCount = await prisma.interviewTemplate.count()

    return NextResponse.json({
      success: true,
      totalTemplates: templateCount,
      templates: templates,
      message: `Found ${templateCount} templates in the database`
    })

  } catch (error) {
    console.error('Error fetching templates:', error)
    return NextResponse.json(
      { error: 'Failed to fetch templates', details: error },
      { status: 500 }
    )
  }
}
