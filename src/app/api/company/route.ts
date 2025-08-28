import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Validation schema for company data
const companyUpdateSchema = z.object({
  name: z.string().min(1, 'Company name is required'),
  email: z.string().email('Invalid email format').optional().or(z.literal('')),
  website: z.string().url('Invalid website URL').optional().or(z.literal('')),
  industry: z.string().optional(),
  companySize: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  description: z.string().optional(),
})

export async function GET() {
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

    // Get user's profile to find their company
    const profile = await prisma.profile.findUnique({
      where: { id: user.id },
      include: {
        company: true
      }
    })

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    // Return company data (null if no company associated)
    return NextResponse.json({
      company: profile.company
    })

  } catch (error) {
    console.error('Error fetching company:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
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

    // Get user's profile and verify role
    const profile = await prisma.profile.findUnique({
      where: { id: user.id },
      include: {
        company: true
      }
    })

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    // Check if user has permission to modify company data
    if (!profile.role || !['admin', 'hr_manager'].includes(profile.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions. Only admins and HR managers can modify company information.' },
        { status: 403 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validatedData = companyUpdateSchema.parse(body)

    // Clean up empty string values and ensure proper typing
    const cleanedData = {
      name: validatedData.name,
      website: validatedData.website === '' ? null : validatedData.website,
      industry: validatedData.industry === '' ? null : validatedData.industry,
      companySize: validatedData.companySize === '' ? null : validatedData.companySize,
      description: validatedData.description === '' ? null : validatedData.description,
      address: validatedData.address === '' ? null : validatedData.address,
      phone: validatedData.phone === '' ? null : validatedData.phone,
      email: validatedData.email === '' ? null : validatedData.email,
    }

    let updatedCompany

    if (profile.companyId && profile.company) {
      // Update existing company
      updatedCompany = await prisma.company.update({
        where: { id: profile.companyId },
        data: {
          name: cleanedData.name,
          website: cleanedData.website,
          industry: cleanedData.industry,
          companySize: cleanedData.companySize,
          description: cleanedData.description,
          address: cleanedData.address,
          phone: cleanedData.phone,
          email: cleanedData.email,
          updatedAt: new Date()
        }
      })
    } else {
      // Create new company and associate with user
      updatedCompany = await prisma.company.create({
        data: {
          name: cleanedData.name,
          website: cleanedData.website,
          industry: cleanedData.industry,
          companySize: cleanedData.companySize,
          description: cleanedData.description,
          address: cleanedData.address,
          phone: cleanedData.phone,
          email: cleanedData.email,
        }
      })

      // Update user profile to link to the new company
      await prisma.profile.update({
        where: { id: user.id },
        data: {
          companyId: updatedCompany.id
        }
      })
    }

    return NextResponse.json({
      message: 'Company information updated successfully',
      company: updatedCompany
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error updating company:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
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
    }

    // Get user's profile and verify role
    const profile = await prisma.profile.findUnique({
      where: { id: user.id }
    })

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    // Check if user has permission to create company
    if (!profile.role || !['admin', 'hr_manager'].includes(profile.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions. Only admins and HR managers can create companies.' },
        { status: 403 }
      )
    }

    // Check if user already has a company
    if (profile.companyId) {
      return NextResponse.json(
        { error: 'User already belongs to a company' },
        { status: 400 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validatedData = companyUpdateSchema.parse(body)

    // Clean up empty string values and ensure proper typing
    const cleanedData = {
      name: validatedData.name,
      website: validatedData.website === '' ? null : validatedData.website,
      industry: validatedData.industry === '' ? null : validatedData.industry,
      companySize: validatedData.companySize === '' ? null : validatedData.companySize,
      description: validatedData.description === '' ? null : validatedData.description,
      address: validatedData.address === '' ? null : validatedData.address,
      phone: validatedData.phone === '' ? null : validatedData.phone,
      email: validatedData.email === '' ? null : validatedData.email,
    }

    // Create new company
    const newCompany = await prisma.company.create({
      data: {
        name: cleanedData.name,
        website: cleanedData.website,
        industry: cleanedData.industry,
        companySize: cleanedData.companySize,
        description: cleanedData.description,
        address: cleanedData.address,
        phone: cleanedData.phone,
        email: cleanedData.email,
      }
    })

    // Update user profile to link to the new company
    await prisma.profile.update({
      where: { id: user.id },
      data: {
        companyId: newCompany.id
      }
    })

    return NextResponse.json({
      message: 'Company created successfully',
      company: newCompany
    }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating company:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
