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
          user_id: string
        }
        Insert: {
          attendance_type?: string
          confirmed_at?: string
          created_at?: string
          enrollment_id: string
          id?: string
          lesson_id: string
          user_id: string
        }
        Update: {
          attendance_type?: string
          confirmed_at?: string
          created_at?: string
          enrollment_id?: string
          id?: string
          lesson_id?: string
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
            foreignKeyName: "attendance_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
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
      courses: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          generates_certificate: boolean
          has_quiz: boolean
          id: string
          lessons_count: number
          mandatory: boolean
          name: string
          public_target: string
          status: string
          theme: string
          tipo: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          generates_certificate?: boolean
          has_quiz?: boolean
          id?: string
          lessons_count?: number
          mandatory?: boolean
          name: string
          public_target: string
          status?: string
          theme: string
          tipo?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          generates_certificate?: boolean
          has_quiz?: boolean
          id?: string
          lessons_count?: number
          mandatory?: boolean
          name?: string
          public_target?: string
          status?: string
          theme?: string
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
        ]
      }
      lessons: {
        Row: {
          content: string | null
          course_id: string | null
          created_at: string
          created_by: string | null
          description: string | null
          duration_minutes: number | null
          id: string
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
          content?: string | null
          course_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
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
          content?: string | null
          course_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
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
      quiz: {
        Row: {
          correct_answer: string
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
        }
        Insert: {
          correct_answer: string
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
        }
        Update: {
          correct_answer?: string
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
        ]
      }
      quiz_responses: {
        Row: {
          answered_at: string
          course_id: string
          id: string
          is_correct: boolean
          quiz_id: string
          selected_answer: string
          user_id: string
        }
        Insert: {
          answered_at?: string
          course_id: string
          id?: string
          is_correct: boolean
          quiz_id: string
          selected_answer: string
          user_id: string
        }
        Update: {
          answered_at?: string
          course_id?: string
          id?: string
          is_correct?: boolean
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
          phone: string | null
          position: string | null
          role: Database["public"]["Enums"]["user_role_type"] | null
          unit_code: string | null
          unit_id: string | null
          updated_at: string
          user_type: string
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
          phone?: string | null
          position?: string | null
          role?: Database["public"]["Enums"]["user_role_type"] | null
          unit_code?: string | null
          unit_id?: string | null
          updated_at?: string
          user_type: string
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
          phone?: string | null
          position?: string | null
          role?: Database["public"]["Enums"]["user_role_type"] | null
          unit_code?: string | null
          unit_id?: string | null
          updated_at?: string
          user_type?: string
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
          item_id: string | null
          item_name: string | null
          message: string
          recipients_count: number
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
          item_id?: string | null
          item_name?: string | null
          message: string
          recipients_count?: number
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
          item_id?: string | null
          item_name?: string | null
          message?: string
          recipients_count?: number
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
      approve_admin_user: {
        Args: { admin_user_id: string }
        Returns: undefined
      }
      approve_collaborator: {
        Args: { _approval_id: string; _approve: boolean }
        Returns: undefined
      }
      backfill_users_unit_code: {
        Args: Record<PropertyKey, never>
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
    }
    Enums: {
      approval_status: "pendente" | "aprovado" | "rejeitado"
      class_status: "criada" | "iniciada" | "encerrada"
      student_class_status: "inscrito" | "concluido" | "cancelado"
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
      user_role_type: ["Franqueado", "Colaborador", "Professor"],
    },
  },
} as const
