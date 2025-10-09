export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      admin_users: {
        Row: {
          active: boolean
          created_at: string
          email: string
          id: string
          name: string
          role: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          email: string
          id?: string
          name: string
          role?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          active?: boolean
          created_at?: string
          email?: string
          id?: string
          name?: string
          role?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      attendance: {
        Row: {
          attendance_type: string
          confirmed_at: string
          created_at: string
          enrollment_id: string
          id: string
          lesson_id: string
          turma_id: string
          typed_keyword: string | null
          user_id: string
        }
        Insert: {
          attendance_type?: string
          confirmed_at?: string
          created_at?: string
          enrollment_id: string
          id?: string
          lesson_id: string
          turma_id: string
          typed_keyword?: string | null
          user_id: string
        }
        Update: {
          attendance_type?: string
          confirmed_at?: string
          created_at?: string
          enrollment_id?: string
          id?: string
          lesson_id?: string
          turma_id?: string
          typed_keyword?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "enrollments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "turmas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      automated_lesson_dispatches: {
        Row: {
          created_at: string
          created_by: string | null
          dispatch_type: string
          id: string
          is_active: boolean
          lesson_id: string
          message_template: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          dispatch_type: string
          id?: string
          is_active?: boolean
          lesson_id: string
          message_template: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          dispatch_type?: string
          id?: string
          is_active?: boolean
          lesson_id?: string
          message_template?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "automated_lesson_dispatches_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      certificates: {
        Row: {
          certificate_url: string | null
          course_id: string
          enrollment_id: string
          generated_at: string
          id: string
          status: string
          turma_id: string
          user_id: string
          valid_until: string | null
        }
        Insert: {
          certificate_url?: string | null
          course_id: string
          enrollment_id: string
          generated_at?: string
          id?: string
          status?: string
          turma_id: string
          user_id: string
          valid_until?: string | null
        }
        Update: {
          certificate_url?: string | null
          course_id?: string
          enrollment_id?: string
          generated_at?: string
          id?: string
          status?: string
          turma_id?: string
          user_id?: string
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "certificates_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "certificates_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "enrollments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "certificates_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "turmas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "certificates_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      class_audit_logs: {
        Row: {
          action: string
          class_id: string
          created_at: string
          id: string
          new_data: Json | null
          old_data: Json | null
          performed_by: string
        }
        Insert: {
          action: string
          class_id: string
          created_at?: string
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          performed_by: string
        }
        Update: {
          action?: string
          class_id?: string
          created_at?: string
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          performed_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "class_audit_logs_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_audit_logs_performed_by_fkey"
            columns: ["performed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      classes: {
        Row: {
          course_id: string
          created_at: string
          created_by: string | null
          deadline: string
          description: string | null
          ended_at: string | null
          id: string
          max_students: number | null
          name: string
          responsible_id: string
          started_at: string | null
          status: Database["public"]["Enums"]["class_status"]
          updated_at: string
        }
        Insert: {
          course_id: string
          created_at?: string
          created_by?: string | null
          deadline: string
          description?: string | null
          ended_at?: string | null
          id?: string
          max_students?: number | null
          name: string
          responsible_id: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["class_status"]
          updated_at?: string
        }
        Update: {
          course_id?: string
          created_at?: string
          created_by?: string | null
          deadline?: string
          description?: string | null
          ended_at?: string | null
          id?: string
          max_students?: number | null
          name?: string
          responsible_id?: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["class_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "classes_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "classes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "classes_responsible_id_fkey"
            columns: ["responsible_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      collaboration_approvals: {
        Row: {
          approval_token: string | null
          collaborator_id: string
          created_at: string | null
          franchisee_id: string | null
          id: string
          notification_sent: boolean | null
          status: Database["public"]["Enums"]["approval_status"] | null
          unit_code: string
          updated_at: string | null
        }
        Insert: {
          approval_token?: string | null
          collaborator_id: string
          created_at?: string | null
          franchisee_id?: string | null
          id?: string
          notification_sent?: boolean | null
          status?: Database["public"]["Enums"]["approval_status"] | null
          unit_code: string
          updated_at?: string | null
        }
        Update: {
          approval_token?: string | null
          collaborator_id?: string
          created_at?: string | null
          franchisee_id?: string | null
          id?: string
          notification_sent?: boolean | null
          status?: Database["public"]["Enums"]["approval_status"] | null
          unit_code?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "collaboration_approvals_collaborator_id_fkey"
            columns: ["collaborator_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collaboration_approvals_franchisee_id_fkey"
            columns: ["franchisee_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      course_position_access: {
        Row: {
          active: boolean | null
          course_id: string | null
          created_at: string | null
          id: string
          position_code: string | null
        }
        Insert: {
          active?: boolean | null
          course_id?: string | null
          created_at?: string | null
          id?: string
          position_code?: string | null
        }
        Update: {
          active?: boolean | null
          course_id?: string | null
          created_at?: string | null
          id?: string
          position_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "course_position_access_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_position_access_position_code_fkey"
            columns: ["position_code"]
            isOneToOne: false
            referencedRelation: "job_positions"
            referencedColumns: ["code"]
          },
        ]
      }
      courses: {
        Row: {
          cover_image_url: string | null
          created_at: string
          created_by: string | null
          description: string | null
          generates_certificate: boolean
          has_quiz: boolean
          id: string
          instructor: string | null
          lessons_count: number
          mandatory: boolean
          name: string
          public_target: string
          status: string
          theme: string[]
          tipo: string
          updated_at: string
        }
        Insert: {
          cover_image_url?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          generates_certificate?: boolean
          has_quiz?: boolean
          id?: string
          instructor?: string | null
          lessons_count?: number
          mandatory?: boolean
          name: string
          public_target: string
          status?: string
          theme: string[]
          tipo?: string
          updated_at?: string
        }
        Update: {
          cover_image_url?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          generates_certificate?: boolean
          has_quiz?: boolean
          id?: string
          instructor?: string | null
          lessons_count?: number
          mandatory?: boolean
          name?: string
          public_target?: string
          status?: string
          theme?: string[]
          tipo?: string
          updated_at?: string
        }
        Relationships: []
      }
      enrollments: {
        Row: {
          completed_lessons: string[] | null
          course_id: string
          created_at: string
          created_by: string | null
          enrollment_date: string
          id: string
          progress_percentage: number
          status: string
          student_email: string
          student_name: string
          student_phone: string | null
          turma_id: string
          unit_code: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          completed_lessons?: string[] | null
          course_id: string
          created_at?: string
          created_by?: string | null
          enrollment_date?: string
          id?: string
          progress_percentage?: number
          status?: string
          student_email: string
          student_name: string
          student_phone?: string | null
          turma_id: string
          unit_code?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          completed_lessons?: string[] | null
          course_id?: string
          created_at?: string
          created_by?: string | null
          enrollment_date?: string
          id?: string
          progress_percentage?: number
          status?: string
          student_email?: string
          student_name?: string
          student_phone?: string | null
          turma_id?: string
          unit_code?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollments_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "turmas"
            referencedColumns: ["id"]
          },
        ]
      }
      job_positions: {
        Row: {
          active: boolean | null
          category: string
          code: string
          created_at: string | null
          description: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          category: string
          code: string
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          category?: string
          code?: string
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      kanban_columns: {
        Row: {
          color: string
          created_at: string | null
          header_color: string
          id: string
          is_default: boolean | null
          order: number
          status: string
          title: string
          updated_at: string | null
        }
        Insert: {
          color: string
          created_at?: string | null
          header_color: string
          id: string
          is_default?: boolean | null
          order: number
          status: string
          title: string
          updated_at?: string | null
        }
        Update: {
          color?: string
          created_at?: string | null
          header_color?: string
          id?: string
          is_default?: boolean | null
          order?: number
          status?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      lesson_sessions: {
        Row: {
          created_at: string | null
          id: string
          join_url: string | null
          lesson_id: string
          scheduled_at: string | null
          start_url: string | null
          status: string
          turma_id: string
          updated_at: string | null
          zoom_meeting_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          join_url?: string | null
          lesson_id: string
          scheduled_at?: string | null
          start_url?: string | null
          status?: string
          turma_id: string
          updated_at?: string | null
          zoom_meeting_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          join_url?: string | null
          lesson_id?: string
          scheduled_at?: string | null
          start_url?: string | null
          status?: string
          turma_id?: string
          updated_at?: string | null
          zoom_meeting_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lesson_sessions_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_sessions_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "turmas"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons: {
        Row: {
          attendance_keyword: string | null
          content: string | null
          course_id: string | null
          created_at: string
          created_by: string | null
          description: string | null
          duration_minutes: number | null
          id: string
          live_stream_room_id: string | null
          live_stream_settings: Json | null
          live_stream_status: string | null
          order_index: number
          status: string
          title: string
          updated_at: string
          video_url: string | null
          zoom_join_url: string | null
          zoom_meeting_id: string | null
          zoom_start_time: string | null
          zoom_start_url: string | null
        }
        Insert: {
          attendance_keyword?: string | null
          content?: string | null
          course_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          live_stream_room_id?: string | null
          live_stream_settings?: Json | null
          live_stream_status?: string | null
          order_index?: number
          status?: string
          title: string
          updated_at?: string
          video_url?: string | null
          zoom_join_url?: string | null
          zoom_meeting_id?: string | null
          zoom_start_time?: string | null
          zoom_start_url?: string | null
        }
        Update: {
          attendance_keyword?: string | null
          content?: string | null
          course_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          live_stream_room_id?: string | null
          live_stream_settings?: Json | null
          live_stream_status?: string | null
          order_index?: number
          status?: string
          title?: string
          updated_at?: string
          video_url?: string | null
          zoom_join_url?: string | null
          zoom_meeting_id?: string | null
          zoom_start_time?: string | null
          zoom_start_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lessons_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      live_participants: {
        Row: {
          audio_enabled: boolean
          created_at: string
          id: string
          is_instructor: boolean
          joined_at: string
          left_at: string | null
          lesson_id: string
          screen_sharing: boolean
          status: string
          updated_at: string
          user_id: string
          user_name: string
          video_enabled: boolean
        }
        Insert: {
          audio_enabled?: boolean
          created_at?: string
          id?: string
          is_instructor?: boolean
          joined_at?: string
          left_at?: string | null
          lesson_id: string
          screen_sharing?: boolean
          status?: string
          updated_at?: string
          user_id: string
          user_name: string
          video_enabled?: boolean
        }
        Update: {
          audio_enabled?: boolean
          created_at?: string
          id?: string
          is_instructor?: boolean
          joined_at?: string
          left_at?: string | null
          lesson_id?: string
          screen_sharing?: boolean
          status?: string
          updated_at?: string
          user_id?: string
          user_name?: string
          video_enabled?: boolean
        }
        Relationships: []
      }
      modules: {
        Row: {
          course_id: string
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          name: string
          order_index: number
          status: string
          updated_at: string
        }
        Insert: {
          course_id: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name: string
          order_index?: number
          status?: string
          updated_at?: string
        }
        Update: {
          course_id?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name?: string
          order_index?: number
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "modules_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      password_sync_queue: {
        Row: {
          created_at: string
          error_message: string | null
          new_password: string
          processed_at: string | null
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          new_password: string
          processed_at?: string | null
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          new_password?: string
          processed_at?: string | null
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      professor_permissions: {
        Row: {
          can_edit: boolean
          can_view: boolean
          created_at: string
          enabled_fields: Json | null
          id: string
          module_name: string
          professor_id: string
          updated_at: string
        }
        Insert: {
          can_edit?: boolean
          can_view?: boolean
          created_at?: string
          enabled_fields?: Json | null
          id?: string
          module_name: string
          professor_id: string
          updated_at?: string
        }
        Update: {
          can_edit?: boolean
          can_view?: boolean
          created_at?: string
          enabled_fields?: Json | null
          id?: string
          module_name?: string
          professor_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "professor_permissions_professor_id_fkey"
            columns: ["professor_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      professor_turma_permissions: {
        Row: {
          can_edit: boolean | null
          can_manage_students: boolean | null
          can_view: boolean | null
          created_at: string | null
          id: string
          professor_id: string
          turma_id: string
          updated_at: string | null
        }
        Insert: {
          can_edit?: boolean | null
          can_manage_students?: boolean | null
          can_view?: boolean | null
          created_at?: string | null
          id?: string
          professor_id: string
          turma_id: string
          updated_at?: string | null
        }
        Update: {
          can_edit?: boolean | null
          can_manage_students?: boolean | null
          can_view?: boolean | null
          created_at?: string | null
          id?: string
          professor_id?: string
          turma_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "professor_turma_permissions_professor_id_fkey"
            columns: ["professor_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "professor_turma_permissions_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "turmas"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz: {
        Row: {
          correct_answer: string | null
          course_id: string
          created_at: string
          id: string
          lesson_id: string | null
          option_a: string | null
          option_b: string | null
          option_c: string | null
          option_d: string | null
          order_index: number
          question: string
          question_type: string
          quiz_name: string | null
          status: string
          turma_id: string | null
        }
        Insert: {
          correct_answer?: string | null
          course_id: string
          created_at?: string
          id?: string
          lesson_id?: string | null
          option_a?: string | null
          option_b?: string | null
          option_c?: string | null
          option_d?: string | null
          order_index?: number
          question: string
          question_type?: string
          quiz_name?: string | null
          status?: string
          turma_id?: string | null
        }
        Update: {
          correct_answer?: string | null
          course_id?: string
          created_at?: string
          id?: string
          lesson_id?: string | null
          option_a?: string | null
          option_b?: string | null
          option_c?: string | null
          option_d?: string | null
          order_index?: number
          question?: string
          question_type?: string
          quiz_name?: string | null
          status?: string
          turma_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quiz_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "turmas"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_responses: {
        Row: {
          answered_at: string
          course_id: string
          id: string
          is_correct: boolean | null
          quiz_id: string
          selected_answer: string
          user_id: string
        }
        Insert: {
          answered_at?: string
          course_id: string
          id?: string
          is_correct?: boolean | null
          quiz_id: string
          selected_answer: string
          user_id: string
        }
        Update: {
          answered_at?: string
          course_id?: string
          id?: string
          is_correct?: boolean | null
          quiz_id?: string
          selected_answer?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_responses_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_responses_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quiz"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_responses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      recorded_lessons: {
        Row: {
          course_id: string
          created_at: string
          created_by: string | null
          description: string | null
          duration_minutes: number | null
          id: string
          module_id: string
          order_index: number
          status: string
          title: string
          updated_at: string
          video_file_path: string | null
          video_url: string | null
        }
        Insert: {
          course_id: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          module_id: string
          order_index?: number
          status?: string
          title: string
          updated_at?: string
          video_file_path?: string | null
          video_url?: string | null
        }
        Update: {
          course_id?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          module_id?: string
          order_index?: number
          status?: string
          title?: string
          updated_at?: string
          video_file_path?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recorded_lessons_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recorded_lessons_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
        ]
      }
      student_classes: {
        Row: {
          class_id: string
          completion_date: string | null
          created_at: string
          enrolled_at: string
          id: string
          status: Database["public"]["Enums"]["student_class_status"]
          student_id: string
          updated_at: string
        }
        Insert: {
          class_id: string
          completion_date?: string | null
          created_at?: string
          enrolled_at?: string
          id?: string
          status?: Database["public"]["Enums"]["student_class_status"]
          student_id: string
          updated_at?: string
        }
        Update: {
          class_id?: string
          completion_date?: string | null
          created_at?: string
          enrolled_at?: string
          id?: string
          status?: Database["public"]["Enums"]["student_class_status"]
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_classes_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_classes_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      student_progress: {
        Row: {
          completed_at: string | null
          created_at: string
          enrollment_id: string
          id: string
          lesson_id: string
          status: string
          updated_at: string
          watch_time_minutes: number | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          enrollment_id: string
          id?: string
          lesson_id: string
          status?: string
          updated_at?: string
          watch_time_minutes?: number | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          enrollment_id?: string
          id?: string
          lesson_id?: string
          status?: string
          updated_at?: string
          watch_time_minutes?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "student_progress_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "enrollments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "recorded_lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      system_settings: {
        Row: {
          auto_certificate_generation: boolean
          certificate_template: string
          course_approval_required: boolean
          created_at: string
          email_notifications: boolean
          id: string
          max_enrollment_per_course: number | null
          system_description: string
          system_name: string
          timezone: string
          updated_at: string
          whatsapp_notifications: boolean
        }
        Insert: {
          auto_certificate_generation?: boolean
          certificate_template?: string
          course_approval_required?: boolean
          created_at?: string
          email_notifications?: boolean
          id?: string
          max_enrollment_per_course?: number | null
          system_description?: string
          system_name?: string
          timezone?: string
          updated_at?: string
          whatsapp_notifications?: boolean
        }
        Update: {
          auto_certificate_generation?: boolean
          certificate_template?: string
          course_approval_required?: boolean
          created_at?: string
          email_notifications?: boolean
          id?: string
          max_enrollment_per_course?: number | null
          system_description?: string
          system_name?: string
          timezone?: string
          updated_at?: string
          whatsapp_notifications?: boolean
        }
        Relationships: []
      }
      test_question_options: {
        Row: {
          created_at: string
          id: string
          option_order: number
          option_text: string
          question_id: string
          score_value: number
        }
        Insert: {
          created_at?: string
          id?: string
          option_order?: number
          option_text: string
          question_id: string
          score_value: number
        }
        Update: {
          created_at?: string
          id?: string
          option_order?: number
          option_text?: string
          question_id?: string
          score_value?: number
        }
        Relationships: [
          {
            foreignKeyName: "test_question_options_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "test_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      test_questions: {
        Row: {
          created_at: string
          id: string
          image_urls: string[] | null
          max_score: number | null
          question_order: number
          question_text: string
          question_type: string
          test_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_urls?: string[] | null
          max_score?: number | null
          question_order?: number
          question_text: string
          question_type?: string
          test_id: string
        }
        Update: {
          created_at?: string
          id?: string
          image_urls?: string[] | null
          max_score?: number | null
          question_order?: number
          question_text?: string
          question_type?: string
          test_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "test_questions_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "tests"
            referencedColumns: ["id"]
          },
        ]
      }
      test_responses: {
        Row: {
          answered_at: string
          id: string
          question_id: string
          score_obtained: number
          selected_option_id: string | null
          test_id: string
          user_id: string
        }
        Insert: {
          answered_at?: string
          id?: string
          question_id: string
          score_obtained?: number
          selected_option_id?: string | null
          test_id: string
          user_id: string
        }
        Update: {
          answered_at?: string
          id?: string
          question_id?: string
          score_obtained?: number
          selected_option_id?: string | null
          test_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "test_responses_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "test_questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "test_responses_selected_option_id_fkey"
            columns: ["selected_option_id"]
            isOneToOne: false
            referencedRelation: "test_question_options"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "test_responses_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "tests"
            referencedColumns: ["id"]
          },
        ]
      }
      test_submissions: {
        Row: {
          attempt_number: number
          id: string
          max_possible_score: number
          passed: boolean
          percentage: number
          started_at: string
          status: Database["public"]["Enums"]["submission_status"]
          submitted_at: string | null
          test_id: string
          time_taken_minutes: number | null
          total_score: number
          user_id: string
        }
        Insert: {
          attempt_number?: number
          id?: string
          max_possible_score?: number
          passed?: boolean
          percentage?: number
          started_at?: string
          status?: Database["public"]["Enums"]["submission_status"]
          submitted_at?: string | null
          test_id: string
          time_taken_minutes?: number | null
          total_score?: number
          user_id: string
        }
        Update: {
          attempt_number?: number
          id?: string
          max_possible_score?: number
          passed?: boolean
          percentage?: number
          started_at?: string
          status?: Database["public"]["Enums"]["submission_status"]
          submitted_at?: string | null
          test_id?: string
          time_taken_minutes?: number | null
          total_score?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "test_submissions_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "tests"
            referencedColumns: ["id"]
          },
        ]
      }
      tests: {
        Row: {
          course_id: string | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          max_attempts: number | null
          name: string
          passing_percentage: number
          status: Database["public"]["Enums"]["test_status"]
          time_limit_minutes: number | null
          turma_id: string | null
          updated_at: string
        }
        Insert: {
          course_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          max_attempts?: number | null
          name: string
          passing_percentage?: number
          status?: Database["public"]["Enums"]["test_status"]
          time_limit_minutes?: number | null
          turma_id?: string | null
          updated_at?: string
        }
        Update: {
          course_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          max_attempts?: number | null
          name?: string
          passing_percentage?: number
          status?: Database["public"]["Enums"]["test_status"]
          time_limit_minutes?: number | null
          turma_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tests_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tests_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "turmas"
            referencedColumns: ["id"]
          },
        ]
      }
      transformation_kanban: {
        Row: {
          course_id: string
          created_at: string | null
          created_by: string | null
          id: string
          notes: string | null
          status: string
          turma_id: string | null
          updated_at: string | null
        }
        Insert: {
          course_id: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          notes?: string | null
          status: string
          turma_id?: string | null
          updated_at?: string | null
        }
        Update: {
          course_id?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          notes?: string | null
          status?: string
          turma_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transformation_kanban_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transformation_kanban_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transformation_kanban_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "turmas"
            referencedColumns: ["id"]
          },
        ]
      }
      turmas: {
        Row: {
          capacity: number | null
          code: string | null
          completion_deadline: string
          course_id: string
          created_at: string | null
          created_by: string | null
          end_at: string | null
          enrollment_close_at: string | null
          enrollment_open_at: string | null
          id: string
          name: string | null
          responsavel_name: string | null
          responsavel_user_id: string | null
          start_at: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          capacity?: number | null
          code?: string | null
          completion_deadline: string
          course_id: string
          created_at?: string | null
          created_by?: string | null
          end_at?: string | null
          enrollment_close_at?: string | null
          enrollment_open_at?: string | null
          id?: string
          name?: string | null
          responsavel_name?: string | null
          responsavel_user_id?: string | null
          start_at?: string | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          capacity?: number | null
          code?: string | null
          completion_deadline?: string
          course_id?: string
          created_at?: string | null
          created_by?: string | null
          end_at?: string | null
          enrollment_close_at?: string | null
          enrollment_open_at?: string | null
          id?: string
          name?: string | null
          responsavel_name?: string | null
          responsavel_user_id?: string | null
          start_at?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "turmas_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "turmas_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "turmas_responsavel_user_id_fkey"
            columns: ["responsavel_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      unidades: {
        Row: {
          bairro: string | null
          cep: string | null
          cidade: string | null
          codigo_grupo: number | null
          complemento: string | null
          contrato: string | null
          created_at: string | null
          email: string | null
          endereco: string | null
          estado: string | null
          etapa_loja: string | null
          fase_loja: string | null
          func_dom: string | null
          func_sab: string | null
          func_seg_sex: string | null
          grupo: string | null
          grupo_colaborador: string | null
          has_parking: string | null
          has_partner_parking: string | null
          id: string | null
          id_agente_ia: string | null
          id_grupo_amarelo: string | null
          id_grupo_azul: string | null
          id_grupo_branco: string | null
          id_grupo_colab: string | null
          id_grupo_compras: string | null
          id_grupo_notificacoes: string | null
          id_grupo_reclame_aqui: string | null
          id_grupo_vermelho: string | null
          id_page_notion: string | null
          id_pasta_documentos: string | null
          id_pasta_unidade: string | null
          instagram: string | null
          link_pasta_documentos: string | null
          link_pasta_unidade: string | null
          modelo_loja: string | null
          numero: string | null
          parking_spots: string | null
          partner_parking_address: string | null
          purchases_active: Json | null
          sales_active: Json | null
          telefone: number | null
          uf: string | null
          updated_at: string | null
        }
        Insert: {
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          codigo_grupo?: number | null
          complemento?: string | null
          contrato?: string | null
          created_at?: string | null
          email?: string | null
          endereco?: string | null
          estado?: string | null
          etapa_loja?: string | null
          fase_loja?: string | null
          func_dom?: string | null
          func_sab?: string | null
          func_seg_sex?: string | null
          grupo?: string | null
          grupo_colaborador?: string | null
          has_parking?: string | null
          has_partner_parking?: string | null
          id?: string | null
          id_agente_ia?: string | null
          id_grupo_amarelo?: string | null
          id_grupo_azul?: string | null
          id_grupo_branco?: string | null
          id_grupo_colab?: string | null
          id_grupo_compras?: string | null
          id_grupo_notificacoes?: string | null
          id_grupo_reclame_aqui?: string | null
          id_grupo_vermelho?: string | null
          id_page_notion?: string | null
          id_pasta_documentos?: string | null
          id_pasta_unidade?: string | null
          instagram?: string | null
          link_pasta_documentos?: string | null
          link_pasta_unidade?: string | null
          modelo_loja?: string | null
          numero?: string | null
          parking_spots?: string | null
          partner_parking_address?: string | null
          purchases_active?: Json | null
          sales_active?: Json | null
          telefone?: number | null
          uf?: string | null
          updated_at?: string | null
        }
        Update: {
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          codigo_grupo?: number | null
          complemento?: string | null
          contrato?: string | null
          created_at?: string | null
          email?: string | null
          endereco?: string | null
          estado?: string | null
          etapa_loja?: string | null
          fase_loja?: string | null
          func_dom?: string | null
          func_sab?: string | null
          func_seg_sex?: string | null
          grupo?: string | null
          grupo_colaborador?: string | null
          has_parking?: string | null
          has_partner_parking?: string | null
          id?: string | null
          id_agente_ia?: string | null
          id_grupo_amarelo?: string | null
          id_grupo_azul?: string | null
          id_grupo_branco?: string | null
          id_grupo_colab?: string | null
          id_grupo_compras?: string | null
          id_grupo_notificacoes?: string | null
          id_grupo_reclame_aqui?: string | null
          id_grupo_vermelho?: string | null
          id_page_notion?: string | null
          id_pasta_documentos?: string | null
          id_pasta_unidade?: string | null
          instagram?: string | null
          link_pasta_documentos?: string | null
          link_pasta_unidade?: string | null
          modelo_loja?: string | null
          numero?: string | null
          parking_spots?: string | null
          partner_parking_address?: string | null
          purchases_active?: Json | null
          sales_active?: Json | null
          telefone?: number | null
          uf?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      units: {
        Row: {
          active: boolean
          address: string | null
          code: string
          created_at: string
          id: string
          manager_name: string | null
          name: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          address?: string | null
          code: string
          created_at?: string
          id?: string
          manager_name?: string | null
          name: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          address?: string | null
          code?: string
          created_at?: string
          id?: string
          manager_name?: string | null
          name?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          active: boolean
          approval_status: Database["public"]["Enums"]["approval_status"] | null
          approved_at: string | null
          approved_by: string | null
          cpf: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          nomes_unidades: string | null
          phone: string | null
          position: string | null
          role: Database["public"]["Enums"]["user_role_type"] | null
          unit_code: string | null
          unit_codes: string[] | null
          unit_id: string | null
          updated_at: string
          user_type: string
          visible_password: string | null
        }
        Insert: {
          active?: boolean
          approval_status?:
            | Database["public"]["Enums"]["approval_status"]
            | null
          approved_at?: string | null
          approved_by?: string | null
          cpf?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          nomes_unidades?: string | null
          phone?: string | null
          position?: string | null
          role?: Database["public"]["Enums"]["user_role_type"] | null
          unit_code?: string | null
          unit_codes?: string[] | null
          unit_id?: string | null
          updated_at?: string
          user_type: string
          visible_password?: string | null
        }
        Update: {
          active?: boolean
          approval_status?:
            | Database["public"]["Enums"]["approval_status"]
            | null
          approved_at?: string | null
          approved_by?: string | null
          cpf?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          nomes_unidades?: string | null
          phone?: string | null
          position?: string | null
          role?: Database["public"]["Enums"]["user_role_type"] | null
          unit_code?: string | null
          unit_codes?: string[] | null
          unit_id?: string | null
          updated_at?: string
          user_type?: string
          visible_password?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "users_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_dispatches: {
        Row: {
          created_at: string
          created_by: string | null
          delivered_count: number
          failed_count: number
          id: string
          is_scheduled: boolean
          item_id: string | null
          item_name: string | null
          message: string
          processed: boolean
          recipients_count: number
          scheduled_at: string | null
          sent_date: string
          status: string
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          delivered_count?: number
          failed_count?: number
          id?: string
          is_scheduled?: boolean
          item_id?: string | null
          item_name?: string | null
          message: string
          processed?: boolean
          recipients_count?: number
          scheduled_at?: string | null
          sent_date?: string
          status?: string
          type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          delivered_count?: number
          failed_count?: number
          id?: string
          is_scheduled?: boolean
          item_id?: string | null
          item_name?: string | null
          message?: string
          processed?: boolean
          recipients_count?: number
          scheduled_at?: string | null
          sent_date?: string
          status?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      advance_turmas_close: {
        Args: { p_now: string }
        Returns: undefined
      }
      advance_turmas_open: {
        Args: { p_now: string }
        Returns: undefined
      }
      approve_admin_user: {
        Args: { admin_user_id: string }
        Returns: undefined
      }
      approve_collaborator: {
        Args: { _approval_id: string; _approve: boolean }
        Returns: undefined
      }
      authenticate_with_role: {
        Args: { p_email: string; p_password: string; p_role: string }
        Returns: Json
      }
      backfill_users_unit_code: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      can_enroll_in_turma: {
        Args: { p_turma: string; p_user: string }
        Returns: boolean
      }
      can_user_access_course: {
        Args: { p_course_id: string; p_user_id: string }
        Returns: boolean
      }
      conclude_turma: {
        Args: { p_turma_id: string; p_user_id: string }
        Returns: undefined
      }
      enroll_student_in_class: {
        Args: { _class_id: string; _student_id: string }
        Returns: undefined
      }
      ensure_admin_bootstrap: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      find_franchisee_by_unit_code: {
        Args: { _unit_code: string }
        Returns: string
      }
      force_close_turma_enrollments: {
        Args: { p_turma_id: string; p_user_id: string }
        Returns: undefined
      }
      get_email_by_phone: {
        Args: { p_phone: string }
        Returns: string
      }
      get_franchisee_position: {
        Args: { p_unit_code: string }
        Returns: string
      }
      get_franchisee_unit_codes: {
        Args: { _franchisee_id: string }
        Returns: string[]
      }
      get_pending_admin_approvals: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_at: string
          email: string
          id: string
          name: string
          role: string
          user_id: string
        }[]
      }
      get_professor_accessible_turmas: {
        Args: { _professor_id: string }
        Returns: {
          can_edit: boolean
          can_manage_students: boolean
          can_view: boolean
          turma_id: string
          turma_name: string
        }[]
      }
      get_professor_enabled_fields: {
        Args: { _module_name: string; _professor_id: string }
        Returns: Json
      }
      get_system_settings: {
        Args: Record<PropertyKey, never>
        Returns: {
          auto_certificate_generation: boolean
          certificate_template: string
          course_approval_required: boolean
          created_at: string
          email_notifications: boolean
          id: string
          max_enrollment_per_course: number
          system_description: string
          system_name: string
          timezone: string
          updated_at: string
          whatsapp_notifications: boolean
        }[]
      }
      has_professor_permission: {
        Args: {
          _module_name: string
          _permission_type?: string
          _professor_id: string
        }
        Returns: boolean
      }
      has_professor_turma_access: {
        Args: {
          _permission_type?: string
          _professor_id: string
          _turma_id: string
        }
        Returns: boolean
      }
      is_admin: {
        Args: { _user: string }
        Returns: boolean
      }
      is_professor: {
        Args: { _user: string }
        Returns: boolean
      }
      manage_class_status: {
        Args: {
          _class_id: string
          _new_status: Database["public"]["Enums"]["class_status"]
        }
        Returns: undefined
      }
      recalc_enrollment_progress: {
        Args: { p_enrollment_id: string }
        Returns: undefined
      }
      reject_admin_user: {
        Args: { admin_user_id: string }
        Returns: undefined
      }
      start_turma: {
        Args: { p_turma_id: string; p_user_id: string }
        Returns: undefined
      }
      update_system_settings: {
        Args: { settings_data: Json }
        Returns: {
          auto_certificate_generation: boolean
          certificate_template: string
          course_approval_required: boolean
          created_at: string
          email_notifications: boolean
          id: string
          max_enrollment_per_course: number
          system_description: string
          system_name: string
          timezone: string
          updated_at: string
          whatsapp_notifications: boolean
        }[]
      }
      user_can_access_turma: {
        Args: { _turma_id: string; _user_id: string }
        Returns: boolean
      }
      user_can_access_turma_enrollments: {
        Args: { _turma_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      approval_status: "pendente" | "aprovado" | "rejeitado"
      class_status: "criada" | "iniciada" | "encerrada"
      student_class_status: "inscrito" | "concluido" | "cancelado"
      submission_status: "in_progress" | "completed" | "expired"
      system_module:
        | "dashboard"
        | "courses"
        | "lessons"
        | "turmas"
        | "enrollments"
        | "attendance"
        | "progress"
        | "quiz"
        | "certificates"
        | "communication"
        | "settings"
      test_status: "draft" | "active" | "archived"
      user_role_type: "Franqueado" | "Colaborador" | "Professor"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      approval_status: ["pendente", "aprovado", "rejeitado"],
      class_status: ["criada", "iniciada", "encerrada"],
      student_class_status: ["inscrito", "concluido", "cancelado"],
      submission_status: ["in_progress", "completed", "expired"],
      system_module: [
        "dashboard",
        "courses",
        "lessons",
        "turmas",
        "enrollments",
        "attendance",
        "progress",
        "quiz",
        "certificates",
        "communication",
        "settings",
      ],
      test_status: ["draft", "active", "archived"],
      user_role_type: ["Franqueado", "Colaborador", "Professor"],
    },
  },
} as const
