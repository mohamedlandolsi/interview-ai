import type { User as SupabaseUser } from '@supabase/supabase-js'

// User role enum to match database schema
export type UserRole = 'admin' | 'hr_manager' | 'interviewer'

// Notification preferences interface
export interface NotificationPreferences {
  email: boolean
  push: boolean
  sms: boolean
}

// Extend the base Supabase User type with additional fields
export interface User extends SupabaseUser {
  full_name?: string
  avatar_url?: string
  company_name?: string
  role?: UserRole
}

// Database types - Updated to match the new schema
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          company_name: string | null
          department: string | null
          phone: string | null
          role: UserRole
          avatar_url: string | null
          timezone: string
          notification_preferences: NotificationPreferences
          onboarding_completed: boolean
          email_verified: boolean
          interview_count: number
          average_score: number
          last_login: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          company_name?: string | null
          department?: string | null
          phone?: string | null
          role?: UserRole
          avatar_url?: string | null
          timezone?: string
          notification_preferences?: NotificationPreferences
          onboarding_completed?: boolean
          email_verified?: boolean
          interview_count?: number
          average_score?: number
          last_login?: string | null
          created_at?: string
          updated_at?: string        }
        Update: {
          id?: string
          full_name?: string | null
          company_name?: string | null
          department?: string | null
          phone?: string | null
          role?: UserRole
          avatar_url?: string | null
          timezone?: string
          notification_preferences?: NotificationPreferences
          onboarding_completed?: boolean
          email_verified?: boolean
          interview_count?: number
          average_score?: number
          last_login?: string | null
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
export type InterviewTemplate = Database['public']['Tables']['interview_templates']['Row']
export type InterviewSession = Database['public']['Tables']['interview_sessions']['Row']

// Insert and Update types
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']
export type InterviewTemplateInsert = Database['public']['Tables']['interview_templates']['Insert']
export type InterviewTemplateUpdate = Database['public']['Tables']['interview_templates']['Update']
export type InterviewSessionInsert = Database['public']['Tables']['interview_sessions']['Insert']
export type InterviewSessionUpdate = Database['public']['Tables']['interview_sessions']['Update']

// Profile with computed fields (matches the database view)
export interface ProfileView extends Profile {
  email: string
  activity_status: 'active' | 'inactive' | 'dormant'
  days_since_signup: number
}
