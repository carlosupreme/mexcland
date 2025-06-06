export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      ciclos_completados: {
        Row: {
          created_at: string
          fecha_fin: string
          fecha_inicio: string
          id: string
          lote_id: string | null
          tina_id: string
          tipo_agave: string
        }
        Insert: {
          created_at?: string
          fecha_fin?: string
          fecha_inicio: string
          id?: string
          lote_id?: string | null
          tina_id: string
          tipo_agave: string
        }
        Update: {
          created_at?: string
          fecha_fin?: string
          fecha_inicio?: string
          id?: string
          lote_id?: string | null
          tina_id?: string
          tipo_agave?: string
        }
        Relationships: [
          {
            foreignKeyName: "ciclos_completados_lote_id_fkey"
            columns: ["lote_id"]
            isOneToOne: false
            referencedRelation: "lotes"
            referencedColumns: ["id"]
          },
        ]
      }
      configuraciones: {
        Row: {
          created_at: string
          created_by: string | null
          device_id: string | null
          frecuencia_actualizacion: number | null
          id: string
          sensor_id: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          device_id?: string | null
          frecuencia_actualizacion?: number | null
          id?: string
          sensor_id?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          device_id?: string | null
          frecuencia_actualizacion?: number | null
          id?: string
          sensor_id?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "configuraciones_sensor_id_fkey"
            columns: ["sensor_id"]
            isOneToOne: false
            referencedRelation: "sensores"
            referencedColumns: ["id"]
          },
        ]
      }
      lectura: {
        Row: {
          created_at: string
          humedad: number | null
          id: string
          nivel_liquido: number | null
          pH: number | null
          sensor_id: string | null
          temperatura: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          humedad?: number | null
          id?: string
          nivel_liquido?: number | null
          pH?: number | null
          sensor_id?: string | null
          temperatura?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          humedad?: number | null
          id?: string
          nivel_liquido?: number | null
          pH?: number | null
          sensor_id?: string | null
          temperatura?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lectura_sensor_id_fkey"
            columns: ["sensor_id"]
            isOneToOne: false
            referencedRelation: "sensores"
            referencedColumns: ["id"]
          },
        ]
      }
      lotes: {
        Row: {
          created_at: string
          created_by: string | null
          estado: string
          fecha_fin: string | null
          fecha_inicio: string
          id: string
          notas: string | null
          numero_lote: string
          tina_id: string
          tipo_agave: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          estado?: string
          fecha_fin?: string | null
          fecha_inicio?: string
          id?: string
          notas?: string | null
          numero_lote: string
          tina_id: string
          tipo_agave: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          estado?: string
          fecha_fin?: string | null
          fecha_inicio?: string
          id?: string
          notas?: string | null
          numero_lote?: string
          tina_id?: string
          tipo_agave?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
          username: string
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id: string
          updated_at?: string
          username: string
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
      sensores: {
        Row: {
          created_at: string
          created_by: string | null
          device_id: string | null
          estado: string | null
          id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          device_id?: string | null
          estado?: string | null
          id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          device_id?: string | null
          estado?: string | null
          id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      tinas: {
        Row: {
          capacidad: number
          created_by: string | null
          estado: string
          fecha_actualizacion: string
          fecha_creacion: string
          id: string
          nombre: string
          sensor_id: string | null
          tipo_agave: string | null
          ultima_actualizacion: string | null
          updated_by: string | null
        }
        Insert: {
          capacidad: number
          created_by?: string | null
          estado?: string
          fecha_actualizacion?: string
          fecha_creacion?: string
          id?: string
          nombre: string
          sensor_id?: string | null
          tipo_agave?: string | null
          ultima_actualizacion?: string | null
          updated_by?: string | null
        }
        Update: {
          capacidad?: number
          created_by?: string | null
          estado?: string
          fecha_actualizacion?: string
          fecha_creacion?: string
          id?: string
          nombre?: string
          sensor_id?: string | null
          tipo_agave?: string | null
          ultima_actualizacion?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tinas_sensor_id_fkey"
            columns: ["sensor_id"]
            isOneToOne: false
            referencedRelation: "sensores"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          assigned_by: string | null
          created_at: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Insert: {
          assigned_by?: string | null
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Update: {
          assigned_by?: string | null
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string
        }
        Relationships: []
      }
      valvulas: {
        Row: {
          controlado_por: string | null
          created_at: string
          estado: string
          id: string
          nombre: string
          porcentaje_liquido: number | null
          tina_id: string
          tipo: string
          ultima_accion: string | null
          updated_at: string
        }
        Insert: {
          controlado_por?: string | null
          created_at?: string
          estado?: string
          id?: string
          nombre: string
          porcentaje_liquido?: number | null
          tina_id: string
          tipo: string
          ultima_accion?: string | null
          updated_at?: string
        }
        Update: {
          controlado_por?: string | null
          created_at?: string
          estado?: string
          id?: string
          nombre?: string
          porcentaje_liquido?: number | null
          tina_id?: string
          tipo?: string
          ultima_accion?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_sensores_disponibles: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          tipo: string
          estado: string
          created_at: string
        }[]
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["user_role"]
        }
        Returns: boolean
      }
      is_admin: {
        Args: { _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      user_role: "admin" | "empleado"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      user_role: ["admin", "empleado"],
    },
  },
} as const
