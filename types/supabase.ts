export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

type GenericRelationship = {
  foreignKeyName: string;
  columns: string[];
  isOneToOne?: boolean;
  referencedRelation: string;
  referencedColumns: string[];
};

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string;
          grade: number;
          birth_year: number;
          parent_email: string | null;
          consent_given_at: string | null;
          avatar_config: Json | null;
          subscription_status: "free" | "premium";
          subscription_expires_at: string | null;
          stripe_customer_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name: string;
          grade: number;
          birth_year: number;
          parent_email?: string | null;
          consent_given_at?: string | null;
          avatar_config?: Json | null;
          subscription_status?: "free" | "premium";
          subscription_expires_at?: string | null;
          stripe_customer_id?: string | null;
        };
        Update: {
          id?: string;
          display_name?: string;
          grade?: number;
          birth_year?: number;
          parent_email?: string | null;
          consent_given_at?: string | null;
          avatar_config?: Json | null;
          subscription_status?: "free" | "premium";
          subscription_expires_at?: string | null;
          stripe_customer_id?: string | null;
        };
        Relationships: GenericRelationship[];
      };
      skills: {
        Row: {
          id: string;
          name: string;
          name_hu: string;
          grade: number;
          topic_area: string;
          prerequisites: string[];
          difficulty_params: {
            p_l0: number;
            p_t: number;
            p_g: number;
            p_s: number;
          } | null;
          description_hu: string | null;
          sort_order: number;
        };
        Insert: {
          id?: string;
          name: string;
          name_hu: string;
          grade: number;
          topic_area: string;
          prerequisites?: string[];
          difficulty_params?: Json | null;
          description_hu?: string | null;
          sort_order?: number;
        };
        Update: {
          name?: string;
          name_hu?: string;
          grade?: number;
          topic_area?: string;
          prerequisites?: string[];
          difficulty_params?: Json | null;
          description_hu?: string | null;
          sort_order?: number;
        };
        Relationships: GenericRelationship[];
      };
      problems: {
        Row: {
          id: string;
          skill_id: string;
          type: "fill_number" | "equation_input" | "multiple_choice" | "guided_steps";
          content_latex: string;
          solution_latex: string | null;
          solution_numeric: number | null;
          hints: Json;
          difficulty: number;
          matura_relevant: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          skill_id: string;
          type: "fill_number" | "equation_input" | "multiple_choice" | "guided_steps";
          content_latex: string;
          solution_latex?: string | null;
          solution_numeric?: number | null;
          hints?: Json;
          difficulty: number;
          matura_relevant?: boolean;
        };
        Update: {
          skill_id?: string;
          type?: "fill_number" | "equation_input" | "multiple_choice" | "guided_steps";
          content_latex?: string;
          solution_latex?: string | null;
          solution_numeric?: number | null;
          hints?: Json;
          difficulty?: number;
          matura_relevant?: boolean;
        };
        Relationships: GenericRelationship[];
      };
      user_skills: {
        Row: {
          user_id: string;
          skill_id: string;
          p_know: number;
          attempts_total: number;
          attempts_correct: number;
          next_review_at: string | null;
          mastered_at: string | null;
        };
        Insert: {
          user_id: string;
          skill_id: string;
          p_know?: number;
          attempts_total?: number;
          attempts_correct?: number;
          next_review_at?: string | null;
          mastered_at?: string | null;
        };
        Update: {
          p_know?: number;
          attempts_total?: number;
          attempts_correct?: number;
          next_review_at?: string | null;
          mastered_at?: string | null;
        };
        Relationships: GenericRelationship[];
      };
      problem_attempts: {
        Row: {
          id: string;
          user_id: string;
          problem_id: string;
          correct: boolean;
          time_ms: number;
          hint_count: number;
          ai_hint_used: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          problem_id: string;
          correct: boolean;
          time_ms?: number;
          hint_count?: number;
          ai_hint_used?: boolean;
        };
        Update: {
          correct?: boolean;
          time_ms?: number;
          hint_count?: number;
          ai_hint_used?: boolean;
        };
        Relationships: GenericRelationship[];
      };
      xp_events: {
        Row: {
          id: string;
          user_id: string;
          amount: number;
          reason: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          amount: number;
          reason: string;
        };
        Update: {
          amount?: number;
          reason?: string;
        };
        Relationships: GenericRelationship[];
      };
      streaks: {
        Row: {
          user_id: string;
          current: number;
          longest: number;
          last_active_date: string | null;
          shields_available: number;
        };
        Insert: {
          user_id: string;
          current?: number;
          longest?: number;
          last_active_date?: string | null;
          shields_available?: number;
        };
        Update: {
          current?: number;
          longest?: number;
          last_active_date?: string | null;
          shields_available?: number;
        };
        Relationships: GenericRelationship[];
      };
      squads: {
        Row: {
          id: string;
          name: string;
          invite_code: string;
          season_xp: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          invite_code: string;
          season_xp?: number;
        };
        Update: {
          name?: string;
          invite_code?: string;
          season_xp?: number;
        };
        Relationships: GenericRelationship[];
      };
      squad_members: {
        Row: {
          squad_id: string;
          user_id: string;
          joined_at: string;
        };
        Insert: {
          squad_id: string;
          user_id: string;
          joined_at?: string;
        };
        Update: {
          joined_at?: string;
        };
        Relationships: GenericRelationship[];
      };
      seasons: {
        Row: {
          id: string;
          name: string;
          start_date: string;
          end_date: string;
          theme: Json;
          milestones: Json;
        };
        Insert: {
          id?: string;
          name: string;
          start_date: string;
          end_date: string;
          theme?: Json;
          milestones?: Json;
        };
        Update: {
          name?: string;
          start_date?: string;
          end_date?: string;
          theme?: Json;
          milestones?: Json;
        };
        Relationships: GenericRelationship[];
      };
      badges: {
        Row: {
          id: string;
          user_id: string;
          badge_type: string;
          earned_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          badge_type: string;
          earned_at?: string;
        };
        Update: {
          badge_type?: string;
          earned_at?: string;
        };
        Relationships: GenericRelationship[];
      };
      ai_hint_log: {
        Row: {
          id: string;
          user_id: string;
          problem_id: string;
          hint_text: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          problem_id: string;
          hint_text: string;
        };
        Update: {
          hint_text?: string;
        };
        Relationships: GenericRelationship[];
      };
      curriculum_embeddings: {
        Row: {
          id: string;
          skill_id: string | null;
          content: string;
          embedding: number[] | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          skill_id?: string | null;
          content: string;
          embedding?: number[] | null;
        };
        Update: {
          content?: string;
          embedding?: number[] | null;
        };
        Relationships: GenericRelationship[];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

// Convenience type aliases
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Skill = Database["public"]["Tables"]["skills"]["Row"];
export type Problem = Database["public"]["Tables"]["problems"]["Row"];
export type UserSkill = Database["public"]["Tables"]["user_skills"]["Row"];
export type ProblemAttempt = Database["public"]["Tables"]["problem_attempts"]["Row"];
export type XpEvent = Database["public"]["Tables"]["xp_events"]["Row"];
export type Streak = Database["public"]["Tables"]["streaks"]["Row"];
export type Squad = Database["public"]["Tables"]["squads"]["Row"];
export type Badge = Database["public"]["Tables"]["badges"]["Row"];
