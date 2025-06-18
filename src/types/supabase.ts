import type { User as SupabaseUser } from '@supabase/supabase-js'

// Extend the base Supabase User type with additional fields
export interface User extends SupabaseUser {
  // Add custom user fields here if you have them in your database
  full_name?: string
  avatar_url?: string
  company_id?: string
  role?: 'admin' | 'interviewer' | 'user'
}

// Database types - Update these based on your actual database schema
export interface Database {
  public: {
    Tables: {      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          company_id: string | null
          company_name: string | null
          role: string | null
          department: string | null
          phone: string | null
          timezone: string | null
          notification_preferences: any | null // JSON field
          onboarding_completed: boolean
          email_verified: boolean
          last_login_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          company_id?: string | null
          company_name?: string | null
          role?: string | null
          department?: string | null
          phone?: string | null
          timezone?: string | null
          notification_preferences?: any | null
          onboarding_completed?: boolean
          email_verified?: boolean
          last_login_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          company_id?: string | null
          company_name?: string | null
          role?: string | null
          department?: string | null
          phone?: string | null
          timezone?: string | null
          notification_preferences?: any | null
          onboarding_completed?: boolean
          email_verified?: boolean
          last_login_at?: string | null
          updated_at?: string
        }
      }
      companies: {
        Row: {
          id: string
          name: string
          logo_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          logo_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          logo_url?: string | null
          updated_at?: string
        }
      }
      interview_templates: {
        Row: {
          id: string
          title: string
          description: string | null
          questions: any // JSON field
          company_id: string
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          questions: any
          company_id: string
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          questions?: any
          updated_at?: string
        }
      }
      interview_sessions: {
        Row: {
          id: string
          candidate_name: string
          candidate_email: string
          position: string
          template_id: string
          status: string
          overall_score: number | null
          metrics: any // JSON field
          transcript: string | null
          ai_insights: string[] | null
          duration: number | null
          started_at: string | null
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          candidate_name: string
          candidate_email: string
          position: string
          template_id: string
          status?: string
          overall_score?: number | null
          metrics?: any
          transcript?: string | null
          ai_insights?: string[] | null
          duration?: number | null
          started_at?: string | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          candidate_name?: string
          candidate_email?: string
          position?: string
          template_id?: string
          status?: string
          overall_score?: number | null
          metrics?: any
          transcript?: string | null
          ai_insights?: string[] | null
          duration?: number | null
          started_at?: string | null
          completed_at?: string | null
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Helper types for working with database tables
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Company = Database['public']['Tables']['companies']['Row']
export type InterviewTemplate = Database['public']['Tables']['interview_templates']['Row']
export type InterviewSession = Database['public']['Tables']['interview_sessions']['Row']

// Insert and Update types
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']
export type CompanyInsert = Database['public']['Tables']['companies']['Insert']
export type CompanyUpdate = Database['public']['Tables']['companies']['Update']
export type InterviewTemplateInsert = Database['public']['Tables']['interview_templates']['Insert']
export type InterviewTemplateUpdate = Database['public']['Tables']['interview_templates']['Update']
export type InterviewSessionInsert = Database['public']['Tables']['interview_sessions']['Insert']
export type InterviewSessionUpdate = Database['public']['Tables']['interview_sessions']['Update']
