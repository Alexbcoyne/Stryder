/**
 * Database types.
 *
 * Hand-written to match `supabase/migrations`, in exactly the shape
 * `supabase gen types typescript` produces. Regenerate rather than edit once
 * you have a local Supabase running:
 *
 *   pnpm db:start && pnpm db:types
 *
 * Keep it in sync with the migrations in the same commit as any schema change.
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          role: string;
          tier: string;
          trial_ends_at: string | null;
          stripe_customer_id: string | null;
          ical_feed_urls: string[];
          timezone: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: string;
          tier?: string;
          trial_ends_at?: string | null;
          stripe_customer_id?: string | null;
          ical_feed_urls?: string[];
          timezone?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: string;
          tier?: string;
          trial_ends_at?: string | null;
          stripe_customer_id?: string | null;
          ical_feed_urls?: string[];
          timezone?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      training_blocks: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          sport: string;
          goal_event: string | null;
          goal_date: string | null;
          start_date: string;
          end_date: string;
          status: string;
          source: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          sport?: string;
          goal_event?: string | null;
          goal_date?: string | null;
          start_date: string;
          end_date: string;
          status?: string;
          source?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          sport?: string;
          goal_event?: string | null;
          goal_date?: string | null;
          start_date?: string;
          end_date?: string;
          status?: string;
          source?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'training_blocks_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      weeks: {
        Row: {
          id: string;
          user_id: string;
          block_id: string;
          week_number: number;
          start_date: string;
          phase: string | null;
          focus: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          block_id: string;
          week_number: number;
          start_date: string;
          phase?: string | null;
          focus?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          block_id?: string;
          week_number?: number;
          start_date?: string;
          phase?: string | null;
          focus?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'weeks_block_id_fkey';
            columns: ['block_id'];
            isOneToOne: false;
            referencedRelation: 'training_blocks';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'weeks_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      sessions: {
        Row: {
          id: string;
          user_id: string;
          block_id: string;
          week_id: string | null;
          scheduled_date: string;
          session_type: string;
          title: string | null;
          description: string | null;
          intensity: string | null;
          planned_duration_min: number | null;
          planned_distance_m: number | null;
          status: string;
          position: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          block_id: string;
          week_id?: string | null;
          scheduled_date: string;
          session_type: string;
          title?: string | null;
          description?: string | null;
          intensity?: string | null;
          planned_duration_min?: number | null;
          planned_distance_m?: number | null;
          status?: string;
          position?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          block_id?: string;
          week_id?: string | null;
          scheduled_date?: string;
          session_type?: string;
          title?: string | null;
          description?: string | null;
          intensity?: string | null;
          planned_duration_min?: number | null;
          planned_distance_m?: number | null;
          status?: string;
          position?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'sessions_block_id_fkey';
            columns: ['block_id'];
            isOneToOne: false;
            referencedRelation: 'training_blocks';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'sessions_week_id_fkey';
            columns: ['week_id'];
            isOneToOne: false;
            referencedRelation: 'weeks';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'sessions_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      session_logs: {
        Row: {
          id: string;
          user_id: string;
          session_id: string | null;
          completed_at: string;
          actual_duration_min: number | null;
          actual_distance_m: number | null;
          rpe: number | null;
          notes: string | null;
          source: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          session_id?: string | null;
          completed_at?: string;
          actual_duration_min?: number | null;
          actual_distance_m?: number | null;
          rpe?: number | null;
          notes?: string | null;
          source?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          session_id?: string | null;
          completed_at?: string;
          actual_duration_min?: number | null;
          actual_distance_m?: number | null;
          rpe?: number | null;
          notes?: string | null;
          source?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'session_logs_session_id_fkey';
            columns: ['session_id'];
            isOneToOne: false;
            referencedRelation: 'sessions';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'session_logs_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      weekly_summaries: {
        Row: {
          id: string;
          user_id: string;
          block_id: string | null;
          week_id: string | null;
          week_start: string;
          stryder_score: number | null;
          sessions_planned: number;
          sessions_completed: number;
          summary_text: string | null;
          sent_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          block_id?: string | null;
          week_id?: string | null;
          week_start: string;
          stryder_score?: number | null;
          sessions_planned?: number;
          sessions_completed?: number;
          summary_text?: string | null;
          sent_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          block_id?: string | null;
          week_id?: string | null;
          week_start?: string;
          stryder_score?: number | null;
          sessions_planned?: number;
          sessions_completed?: number;
          summary_text?: string | null;
          sent_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'weekly_summaries_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      streaks: {
        Row: {
          id: string;
          user_id: string;
          current_streak: number;
          longest_streak: number;
          last_active_week: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          current_streak?: number;
          longest_streak?: number;
          last_active_week?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          current_streak?: number;
          longest_streak?: number;
          last_active_week?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'streaks_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: true;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      badges: {
        Row: {
          id: string;
          user_id: string;
          badge_key: string;
          awarded_at: string;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          badge_key: string;
          awarded_at?: string;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          badge_key?: string;
          awarded_at?: string;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'badges_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: Record<never, never>;
    Functions: {
      effective_tier: {
        Args: { p_user_id: string };
        Returns: string;
      };
    };
    Enums: Record<never, never>;
    CompositeTypes: Record<never, never>;
  };
};

type PublicSchema = Database['public'];

export type Tables<T extends keyof PublicSchema['Tables']> = PublicSchema['Tables'][T]['Row'];
export type TablesInsert<T extends keyof PublicSchema['Tables']> =
  PublicSchema['Tables'][T]['Insert'];
export type TablesUpdate<T extends keyof PublicSchema['Tables']> =
  PublicSchema['Tables'][T]['Update'];
