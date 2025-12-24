// Database types for Supabase
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      rooms: {
        Row: {
          id: string
          code: string
          host_id: string
          phase: "waiting" | "drawing" | "roundEnd" | "gameEnd"
          current_drawer: string | null
          current_word: string
          masked_word: string
          round: number
          max_rounds: number
          draw_time: number
          time_left: number
          theme: string
          is_private: boolean
          max_players: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          code: string
          host_id: string
          phase?: "waiting" | "drawing" | "roundEnd" | "gameEnd"
          current_drawer?: string | null
          current_word?: string
          masked_word?: string
          round?: number
          max_rounds?: number
          draw_time?: number
          time_left?: number
          theme?: string
          is_private?: boolean
          max_players?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          code?: string
          host_id?: string
          phase?: "waiting" | "drawing" | "roundEnd" | "gameEnd"
          current_drawer?: string | null
          current_word?: string
          masked_word?: string
          round?: number
          max_rounds?: number
          draw_time?: number
          time_left?: number
          theme?: string
          is_private?: boolean
          max_players?: number
          created_at?: string
          updated_at?: string
        }
      }
      players: {
        Row: {
          id: string
          player_id: string
          room_id: string
          name: string
          score: number
          avatar: string
          is_drawing: boolean
          has_guessed: boolean
          is_host: boolean
          is_banned: boolean
          strikes: number
          joined_at: string
          last_seen: string
        }
        Insert: {
          id?: string
          player_id: string
          room_id: string
          name: string
          score?: number
          avatar?: string
          is_drawing?: boolean
          has_guessed?: boolean
          is_host?: boolean
          is_banned?: boolean
          strikes?: number
          joined_at?: string
          last_seen?: string
        }
        Update: {
          id?: string
          player_id?: string
          room_id?: string
          name?: string
          score?: number
          avatar?: string
          is_drawing?: boolean
          has_guessed?: boolean
          is_host?: boolean
          is_banned?: boolean
          strikes?: number
          joined_at?: string
          last_seen?: string
        }
      }
      messages: {
        Row: {
          id: string
          room_id: string
          player_id: string
          player_name: string
          message: string
          is_correct: boolean
          is_close: boolean
          is_system: boolean
          created_at: string
        }
        Insert: {
          id?: string
          room_id: string
          player_id: string
          player_name: string
          message: string
          is_correct?: boolean
          is_close?: boolean
          is_system?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          room_id?: string
          player_id?: string
          player_name?: string
          message?: string
          is_correct?: boolean
          is_close?: boolean
          is_system?: boolean
          created_at?: string
        }
      }
      canvas_strokes: {
        Row: {
          id: string
          room_id: string
          stroke_data: Json
          stroke_order: number
          created_at: string
        }
        Insert: {
          id?: string
          room_id: string
          stroke_data: Json
          stroke_order: number
          created_at?: string
        }
        Update: {
          id?: string
          room_id?: string
          stroke_data?: Json
          stroke_order?: number
          created_at?: string
        }
      }
      game_events: {
        Row: {
          id: string
          room_id: string
          event_type: string
          payload: Json
          created_at: string
        }
        Insert: {
          id?: string
          room_id: string
          event_type: string
          payload: Json
          created_at?: string
        }
        Update: {
          id?: string
          room_id?: string
          event_type?: string
          payload?: Json
          created_at?: string
        }
      }
      banned_users: {
        Row: {
          id: string
          player_id: string
          room_code: string
          banned_at: string
        }
        Insert: {
          id?: string
          player_id: string
          room_code: string
          banned_at?: string
        }
        Update: {
          id?: string
          player_id?: string
          room_code?: string
          banned_at?: string
        }
      }
      game_logs: {
        Row: {
          id: string
          room_code: string | null
          log_type: string
          player_id: string | null
          player_name: string | null
          message: string
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          room_code?: string | null
          log_type: string
          player_id?: string | null
          player_name?: string | null
          message: string
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          room_code?: string | null
          log_type?: string
          player_id?: string | null
          player_name?: string | null
          message?: string
          metadata?: Json | null
          created_at?: string
        }
      }
    }
  }
}
