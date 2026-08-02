export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      activities: {
        Row: {
          created_at: string
          external_id: string | null
          id: string
          is_public: boolean
          media_url: string | null
          metadata: Json
          occurred_on: string
          project: string | null
          source: Database["public"]["Enums"]["activity_source"]
          summary: string | null
          title: string
          type: Database["public"]["Enums"]["activity_type"]
          updated_at: string
          url: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          external_id?: string | null
          id?: string
          is_public?: boolean
          media_url?: string | null
          metadata?: Json
          occurred_on: string
          project?: string | null
          source?: Database["public"]["Enums"]["activity_source"]
          summary?: string | null
          title: string
          type?: Database["public"]["Enums"]["activity_type"]
          updated_at?: string
          url?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          external_id?: string | null
          id?: string
          is_public?: boolean
          media_url?: string | null
          metadata?: Json
          occurred_on?: string
          project?: string | null
          source?: Database["public"]["Enums"]["activity_source"]
          summary?: string | null
          title?: string
          type?: Database["public"]["Enums"]["activity_type"]
          updated_at?: string
          url?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activities_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      allowed_emails: {
        Row: {
          created_at: string
          email: string
        }
        Insert: {
          created_at?: string
          email: string
        }
        Update: {
          created_at?: string
          email?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string
          id: string
          slug: string
          title: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name: string
          id: string
          slug: string
          title?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string
          id?: string
          slug?: string
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_email_allowed: { Args: { check_email: string }; Returns: boolean }
    }
    Enums: {
      activity_source: "manual" | "github" | "figma"
      activity_type:
        | "design"
        | "code"
        | "pr"
        | "review"
        | "spec"
        | "meeting"
        | "research"
        | "ship"
        | "other"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Activity = Database["public"]["Tables"]["activities"]["Row"]
export type Profile = Database["public"]["Tables"]["profiles"]["Row"]
export type ActivityType = Database["public"]["Enums"]["activity_type"]
export type ActivitySource = Database["public"]["Enums"]["activity_source"]
