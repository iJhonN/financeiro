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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      assinaturas: {
        Row: {
          created_at: string
          expira_em: string
          gateway: string | null
          gateway_ref: string | null
          id: string
          inicio: string
          plano: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expira_em: string
          gateway?: string | null
          gateway_ref?: string | null
          id?: string
          inicio?: string
          plano: string
          status: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expira_em?: string
          gateway?: string | null
          gateway_ref?: string | null
          id?: string
          inicio?: string
          plano?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      audit_log: {
        Row: {
          acao: string
          antes: Json | null
          ator_id: string
          created_at: string
          depois: Json | null
          id: number
          ip: unknown
          motivo: string | null
          registro_id: string | null
          tabela: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          acao: string
          antes?: Json | null
          ator_id: string
          created_at?: string
          depois?: Json | null
          id?: never
          ip?: unknown
          motivo?: string | null
          registro_id?: string | null
          tabela: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          acao?: string
          antes?: Json | null
          ator_id?: string
          created_at?: string
          depois?: Json | null
          id?: never
          ip?: unknown
          motivo?: string | null
          registro_id?: string | null
          tabela?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      cartoes: {
        Row: {
          apelido: string
          arquivado: boolean
          banco_slug: string
          created_at: string
          dia_fechamento: number
          dia_vencimento: number
          id: string
          limite_centavos: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          apelido: string
          arquivado?: boolean
          banco_slug: string
          created_at?: string
          dia_fechamento: number
          dia_vencimento: number
          id?: string
          limite_centavos?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          apelido?: string
          arquivado?: boolean
          banco_slug?: string
          created_at?: string
          dia_fechamento?: number
          dia_vencimento?: number
          id?: string
          limite_centavos?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      categorias: {
        Row: {
          cor: string
          created_at: string
          icone: string
          id: string
          nome: string
          tipo: string
          user_id: string | null
        }
        Insert: {
          cor?: string
          created_at?: string
          icone?: string
          id?: string
          nome: string
          tipo: string
          user_id?: string | null
        }
        Update: {
          cor?: string
          created_at?: string
          icone?: string
          id?: string
          nome?: string
          tipo?: string
          user_id?: string | null
        }
        Relationships: []
      }
      contas: {
        Row: {
          arquivada: boolean
          cor: string | null
          created_at: string
          id: string
          nome: string
          saldo_inicial_centavos: number
          tipo: string
          updated_at: string
          user_id: string
        }
        Insert: {
          arquivada?: boolean
          cor?: string | null
          created_at?: string
          id?: string
          nome: string
          saldo_inicial_centavos?: number
          tipo: string
          updated_at?: string
          user_id: string
        }
        Update: {
          arquivada?: boolean
          cor?: string | null
          created_at?: string
          id?: string
          nome?: string
          saldo_inicial_centavos?: number
          tipo?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      driver_despesas: {
        Row: {
          categoria_id: string
          created_at: string
          data_despesa: string
          descricao: string
          id: string
          km_no_registro: number | null
          litros: number | null
          user_id: string
          valor_centavos: number
          veiculo_id: string | null
        }
        Insert: {
          categoria_id: string
          created_at?: string
          data_despesa: string
          descricao: string
          id?: string
          km_no_registro?: number | null
          litros?: number | null
          user_id: string
          valor_centavos: number
          veiculo_id?: string | null
        }
        Update: {
          categoria_id?: string
          created_at?: string
          data_despesa?: string
          descricao?: string
          id?: string
          km_no_registro?: number | null
          litros?: number | null
          user_id?: string
          valor_centavos?: number
          veiculo_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "driver_despesas_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "categorias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "driver_despesas_veiculo_id_user_id_fkey"
            columns: ["veiculo_id", "user_id"]
            isOneToOne: false
            referencedRelation: "veiculos"
            referencedColumns: ["id", "user_id"]
          },
        ]
      }
      driver_ganhos: {
        Row: {
          app_centavos: number
          corridas: number | null
          created_at: string
          data_trabalho: string
          especie_centavos: number
          horas_trabalhadas: number | null
          id: string
          km_final: number | null
          km_inicial: number | null
          plataforma_slug: string
          user_id: string
          veiculo_id: string
        }
        Insert: {
          app_centavos?: number
          corridas?: number | null
          created_at?: string
          data_trabalho: string
          especie_centavos?: number
          horas_trabalhadas?: number | null
          id?: string
          km_final?: number | null
          km_inicial?: number | null
          plataforma_slug: string
          user_id: string
          veiculo_id: string
        }
        Update: {
          app_centavos?: number
          corridas?: number | null
          created_at?: string
          data_trabalho?: string
          especie_centavos?: number
          horas_trabalhadas?: number | null
          id?: string
          km_final?: number | null
          km_inicial?: number | null
          plataforma_slug?: string
          user_id?: string
          veiculo_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "driver_ganhos_plataforma_slug_fkey"
            columns: ["plataforma_slug"]
            isOneToOne: false
            referencedRelation: "plataformas"
            referencedColumns: ["slug"]
          },
          {
            foreignKeyName: "driver_ganhos_veiculo_id_user_id_fkey"
            columns: ["veiculo_id", "user_id"]
            isOneToOne: false
            referencedRelation: "veiculos"
            referencedColumns: ["id", "user_id"]
          },
        ]
      }
      driver_manutencoes: {
        Row: {
          created_at: string
          id: string
          intervalo_dias: number | null
          intervalo_km: number | null
          item: string
          ultima_data: string | null
          ultimo_km: number | null
          user_id: string
          veiculo_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          intervalo_dias?: number | null
          intervalo_km?: number | null
          item: string
          ultima_data?: string | null
          ultimo_km?: number | null
          user_id: string
          veiculo_id: string
        }
        Update: {
          created_at?: string
          id?: string
          intervalo_dias?: number | null
          intervalo_km?: number | null
          item?: string
          ultima_data?: string | null
          ultimo_km?: number | null
          user_id?: string
          veiculo_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "driver_manutencoes_veiculo_id_user_id_fkey"
            columns: ["veiculo_id", "user_id"]
            isOneToOne: false
            referencedRelation: "veiculos"
            referencedColumns: ["id", "user_id"]
          },
        ]
      }
      faturas: {
        Row: {
          cartao_id: string
          created_at: string
          data_fechamento: string
          data_vencimento: string
          id: string
          paga_em: string | null
          referencia: string
          status: string
          user_id: string
        }
        Insert: {
          cartao_id: string
          created_at?: string
          data_fechamento: string
          data_vencimento: string
          id?: string
          paga_em?: string | null
          referencia: string
          status?: string
          user_id: string
        }
        Update: {
          cartao_id?: string
          created_at?: string
          data_fechamento?: string
          data_vencimento?: string
          id?: string
          paga_em?: string | null
          referencia?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "faturas_cartao_id_user_id_fkey"
            columns: ["cartao_id", "user_id"]
            isOneToOne: false
            referencedRelation: "cartoes"
            referencedColumns: ["id", "user_id"]
          },
        ]
      }
      grupos_lancamento: {
        Row: {
          ativo: boolean
          created_at: string
          descricao_base: string
          dia_recorrencia: number | null
          id: string
          tipo: string
          total_parcelas: number | null
          user_id: string
          valor_total_centavos: number | null
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          descricao_base: string
          dia_recorrencia?: number | null
          id?: string
          tipo: string
          total_parcelas?: number | null
          user_id: string
          valor_total_centavos?: number | null
        }
        Update: {
          ativo?: boolean
          created_at?: string
          descricao_base?: string
          dia_recorrencia?: number | null
          id?: string
          tipo?: string
          total_parcelas?: number | null
          user_id?: string
          valor_total_centavos?: number | null
        }
        Relationships: []
      }
      metas: {
        Row: {
          alvo_centavos: number
          atual_centavos: number
          concluida: boolean
          created_at: string
          id: string
          nome: string
          prazo: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          alvo_centavos: number
          atual_centavos?: number
          concluida?: boolean
          created_at?: string
          id?: string
          nome: string
          prazo?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          alvo_centavos?: number
          atual_centavos?: number
          concluida?: boolean
          created_at?: string
          id?: string
          nome?: string
          prazo?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      orcamentos: {
        Row: {
          categoria_id: string
          created_at: string
          id: string
          limite_centavos: number
          mes: string
          user_id: string
        }
        Insert: {
          categoria_id: string
          created_at?: string
          id?: string
          limite_centavos: number
          mes: string
          user_id: string
        }
        Update: {
          categoria_id?: string
          created_at?: string
          id?: string
          limite_centavos?: number
          mes?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orcamentos_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "categorias"
            referencedColumns: ["id"]
          },
        ]
      }
      plataformas: {
        Row: {
          nome: string
          pasta: string
          slug: string
          tipo: string
        }
        Insert: {
          nome: string
          pasta: string
          slug: string
          tipo: string
        }
        Update: {
          nome?: string
          pasta?: string
          slug?: string
          tipo?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          driver_ativo: boolean
          driver_integrado: boolean
          email: string
          fuso: string
          id: string
          moeda: string
          nome: string
          onboarding_done: boolean
          tema: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          driver_ativo?: boolean
          driver_integrado?: boolean
          email: string
          fuso?: string
          id: string
          moeda?: string
          nome: string
          onboarding_done?: boolean
          tema?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          driver_ativo?: boolean
          driver_integrado?: boolean
          email?: string
          fuso?: string
          id?: string
          moeda?: string
          nome?: string
          onboarding_done?: boolean
          tema?: string
          updated_at?: string
        }
        Relationships: []
      }
      transacoes: {
        Row: {
          cartao_id: string | null
          categoria_id: string | null
          conta_id: string | null
          created_at: string
          data_competencia: string
          data_pagamento: string | null
          deleted_at: string | null
          descricao: string
          fatura_id: string | null
          forma: string
          grupo_id: string | null
          id: string
          observacao: string | null
          origem_id: string | null
          origem_tipo: string | null
          parcela_num: number | null
          parcela_total: number | null
          status: string
          tipo: string
          updated_at: string
          user_id: string
          valor_centavos: number
        }
        Insert: {
          cartao_id?: string | null
          categoria_id?: string | null
          conta_id?: string | null
          created_at?: string
          data_competencia: string
          data_pagamento?: string | null
          deleted_at?: string | null
          descricao: string
          fatura_id?: string | null
          forma: string
          grupo_id?: string | null
          id?: string
          observacao?: string | null
          origem_id?: string | null
          origem_tipo?: string | null
          parcela_num?: number | null
          parcela_total?: number | null
          status?: string
          tipo: string
          updated_at?: string
          user_id: string
          valor_centavos: number
        }
        Update: {
          cartao_id?: string | null
          categoria_id?: string | null
          conta_id?: string | null
          created_at?: string
          data_competencia?: string
          data_pagamento?: string | null
          deleted_at?: string | null
          descricao?: string
          fatura_id?: string | null
          forma?: string
          grupo_id?: string | null
          id?: string
          observacao?: string | null
          origem_id?: string | null
          origem_tipo?: string | null
          parcela_num?: number | null
          parcela_total?: number | null
          status?: string
          tipo?: string
          updated_at?: string
          user_id?: string
          valor_centavos?: number
        }
        Relationships: [
          {
            foreignKeyName: "transacoes_cartao_id_user_id_fkey"
            columns: ["cartao_id", "user_id"]
            isOneToOne: false
            referencedRelation: "cartoes"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "transacoes_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "categorias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transacoes_conta_id_user_id_fkey"
            columns: ["conta_id", "user_id"]
            isOneToOne: false
            referencedRelation: "contas"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "transacoes_fatura_id_user_id_fkey"
            columns: ["fatura_id", "user_id"]
            isOneToOne: false
            referencedRelation: "faturas"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "transacoes_fatura_id_user_id_fkey"
            columns: ["fatura_id", "user_id"]
            isOneToOne: false
            referencedRelation: "v_faturas_resumo"
            referencedColumns: ["fatura_id", "user_id"]
          },
          {
            foreignKeyName: "transacoes_grupo_id_fkey"
            columns: ["grupo_id"]
            isOneToOne: false
            referencedRelation: "grupos_lancamento"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          role?: string
          user_id: string
        }
        Update: {
          created_at?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      veiculos: {
        Row: {
          ano: number | null
          ativo: boolean
          combustivel: string | null
          created_at: string
          id: string
          km_atual: number
          marca: string
          modelo: string
          placa: string | null
          tipo: string
          updated_at: string
          user_id: string
        }
        Insert: {
          ano?: number | null
          ativo?: boolean
          combustivel?: string | null
          created_at?: string
          id?: string
          km_atual?: number
          marca: string
          modelo: string
          placa?: string | null
          tipo: string
          updated_at?: string
          user_id: string
        }
        Update: {
          ano?: number | null
          ativo?: boolean
          combustivel?: string | null
          created_at?: string
          id?: string
          km_atual?: number
          marca?: string
          modelo?: string
          placa?: string | null
          tipo?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      v_faturas_resumo: {
        Row: {
          cartao_id: string | null
          data_vencimento: string | null
          fatura_id: string | null
          referencia: string | null
          status: string | null
          total_fatura_centavos: number | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "faturas_cartao_id_user_id_fkey"
            columns: ["cartao_id", "user_id"]
            isOneToOne: false
            referencedRelation: "cartoes"
            referencedColumns: ["id", "user_id"]
          },
        ]
      }
      v_resumo_mensal: {
        Row: {
          despesas_pagas: number | null
          despesas_pendentes: number | null
          mes: string | null
          total_despesas: number | null
          total_receitas: number | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      fn_saldo_atual: { Args: { p_user_id: string }; Returns: number }
      fn_tem_assinatura_ativa: { Args: { p_user_id: string }; Returns: boolean }
      rpc_liquidar_fatura: {
        Args: {
          p_conta_id: string
          p_data_pagamento: string
          p_fatura_id: string
        }
        Returns: undefined
      }
      rpc_registrar_despesa_driver: {
        Args: {
          p_categoria_id: string
          p_data: string
          p_descricao: string
          p_km_no_registro: number
          p_litros: number
          p_valor_centavos: number
          p_veiculo_id: string
        }
        Returns: string
      }
      rpc_registrar_ganho_driver: {
        Args: {
          p_app_centavos: number
          p_corridas: number
          p_data: string
          p_especie_centavos: number
          p_horas: number
          p_km_final: number
          p_km_inicial: number
          p_plataforma_slug: string
          p_veiculo_id: string
        }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
