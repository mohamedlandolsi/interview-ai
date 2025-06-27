import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
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

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') || ''
    const difficulty = searchParams.get('difficulty') || ''
    const type = searchParams.get('type') || 'all' // all, custom, library

    // Build where conditions
    const whereConditions: any = {}

    // Filter by user's own templates or include built-in templates
    if (type === 'custom') {
      whereConditions.created_by = user.id
    } else if (type === 'library') {
      // Built-in templates or templates created by the system user
      whereConditions.OR = [
        { is_built_in: true },
        { created_by: '00000000-0000-0000-0000-000000000001' }
      ]
    } else {
      // For 'all' type, only show templates the user has access to
      whereConditions.OR = [
        { created_by: user.id }, // User's own templates
        { is_built_in: true },   // Built-in templates
        { created_by: '00000000-0000-0000-0000-000000000001' } // System templates
      ]
    }

    // Search filter
    if (search) {
      whereConditions.OR = [
        {
          title: {
            contains: search,
            mode: 'insensitive'
          }
        },
        {
          description: {
            contains: search,
            mode: 'insensitive'
          }
        }
      ]
    }

    // Get templates with creator information
    const templates = await prisma.interviewTemplate.findMany({
      where: whereConditions,
      include: {
        creator: {
          select: {
            id: true,
            full_name: true,
            role: true
          }
        },
        _count: {
          select: {
            sessions: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    })    // Transform the data to match the frontend expectations
    const transformedTemplates = templates.map(template => {
      // Use rawQuestions if available, fallback to questions
      const questions = Array.isArray(template.rawQuestions) 
        ? template.rawQuestions 
        : Array.isArray(template.questions) 
        ? template.questions 
        : []
      
      // Extract categories and difficulties from questions
      const categories = [...new Set(questions.map((q: any) => q.category).filter(Boolean))]
      const questionTypes = [...new Set(questions.map((q: any) => q.type).filter(Boolean))]
      
      // Use template-level fields first, then calculate from questions
      const estimatedDuration = template.duration || Math.max(questions.length * 2, 15)
      const templateDifficulty = template.difficulty || 
        (questions.some((q: any) => q.difficulty === 'Advanced' || q.weight > 1.5) ? 'Advanced' :
         questions.every((q: any) => q.difficulty === 'Beginner' || q.weight <= 1.0) ? 'Beginner' : 'Intermediate')
      const primaryCategory = template.category || (categories.length > 0 ? categories[0] : 'General')

      return {
        id: template.id,
        name: template.name || template.title,
        title: template.title,
        description: template.description || 'No description provided',
        category: primaryCategory,
        questions: questions.length,
        duration: estimatedDuration,
        difficulty: templateDifficulty,
        usageCount: template.usage_count || template._count.sessions,
        lastUsed: template.last_used?.toISOString() || template.updated_at.toISOString().split('T')[0],
        isBuiltIn: template.is_built_in || template.created_by === '00000000-0000-0000-0000-000000000001',
        tags: template.tags || [...categories, ...questionTypes].slice(0, 4), // Use stored tags or derive from questions
        creator: template.creator,
        created_at: template.created_at,
        updated_at: template.updated_at,
        rawQuestions: questions
      }
    })

    // Apply frontend filters (category and difficulty)
    let filteredTemplates = transformedTemplates

    if (category && category !== 'All Categories') {
      filteredTemplates = filteredTemplates.filter(template => 
        template.category === category || template.tags.includes(category)
      )
    }

    if (difficulty && difficulty !== 'All Levels') {
      filteredTemplates = filteredTemplates.filter(template => 
        template.difficulty === difficulty
      )
    }

    return NextResponse.json({
      success: true,
      templates: filteredTemplates,
      total: filteredTemplates.length,
      filters: {
        search,
        category,
        difficulty,
        type
      }
    })

  } catch (error) {
    console.error('Error fetching templates:', error)
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }    const body = await request.json()
    const { 
      name, 
      title, 
      description, 
      instruction,
      category, 
      difficulty, 
      duration, 
      tags, 
      questions, 
      rawQuestions 
    } = body

    const templateName = name || title
    if (!templateName) {
      return NextResponse.json(
        { error: 'Template name is required' },
        { status: 400 }
      )
    }    // Create the template
    const template = await prisma.interviewTemplate.create({
      data: {
        title: templateName,
        name: templateName,
        description: description || null,
        instruction: instruction || null,
        category: category || null,
        difficulty: difficulty || null,
        duration: duration || null,
        tags: tags || [],
        questions: questions || rawQuestions || [],
        rawQuestions: rawQuestions || questions || [],
        company_id: user.id, // Using user ID as company ID for now
        created_by: user.id
      },
      include: {
        creator: {
          select: {
            id: true,
            full_name: true,
            role: true
          }
        }
      }
    })

    // Transform the response to match expected format
    const transformedTemplate = {
      id: template.id,
      name: template.name || template.title,
      title: template.title,
      description: template.description,
      category: template.category,
      difficulty: template.difficulty,
      duration: template.duration,
      tags: template.tags || [],
      questions: Array.isArray(template.questions) ? template.questions.length : 0,
      rawQuestions: template.rawQuestions || template.questions,
      usageCount: template.usage_count,
      lastUsed: template.last_used?.toISOString(),
      isBuiltIn: template.is_built_in,
      creator: template.creator,
      created_at: template.created_at.toISOString(),
      updated_at: template.updated_at.toISOString()
    }

    return NextResponse.json({
      success: true,
      template: transformedTemplate,
      message: 'Template created successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating template:', error)
    return NextResponse.json(
      { error: 'Failed to create template' },
      { status: 500 }
    )
  }
}
