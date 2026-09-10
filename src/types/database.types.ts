// Tipos do banco de dados.
//
// Em produção, o ideal é gerar este arquivo automaticamente com:
//   npx supabase gen types typescript --project-id <ref> > src/types/database.types.ts
// Ele foi escrito manualmente aqui para refletir o schema.sql atual e
// destravar a Fase 3 do plano (remover `as X` do código). Assim que o CLI
// do Supabase estiver disponível no pipeline, troque por geração automática.

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          nome: string;
          email: string;
          xp: number;
          nivel: string;
          role: 'user' | 'admin';
          liga_id: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          nome?: string;
          email: string;
          xp?: number;
        };
        Update: {
          nome?: string;
        };
      };
      ligas: {
        Row: {
          id: number;
          nome: string;
          codigo_acesso: string;
          criado_por: string | null;
          created_at: string;
        };
        Insert: {
          nome: string;
        };
        Update: {
          nome?: string;
        };
      };
      temporadas: {
        Row: {
          id: number;
          titulo: string;
          descricao: string;
          ordem: number | null;
          ativa: boolean;
          created_at: string;
        };
        Insert: {
          titulo: string;
          descricao?: string;
          ordem?: number | null;
          ativa?: boolean;
        };
        Update: {
          titulo?: string;
          descricao?: string;
          ordem?: number | null;
          ativa?: boolean;
        };
      };
      perguntas: {
        Row: {
          id: number;
          temporada_id: number;
          texto_pergunta: string;
          opcao_a: string;
          opcao_b: string;
          opcao_c: string;
          opcao_d: string;
          resposta_correta: 'A' | 'B' | 'C' | 'D';
          ordem: number | null;
          ativa: boolean;
          created_at: string;
        };
        Insert: {
          temporada_id: number;
          texto_pergunta: string;
          opcao_a: string;
          opcao_b: string;
          opcao_c: string;
          opcao_d: string;
          resposta_correta: 'A' | 'B' | 'C' | 'D';
          ordem?: number | null;
          ativa?: boolean;
        };
        Update: {
          texto_pergunta?: string;
          opcao_a?: string;
          opcao_b?: string;
          opcao_c?: string;
          opcao_d?: string;
          resposta_correta?: 'A' | 'B' | 'C' | 'D';
          ordem?: number | null;
          ativa?: boolean;
        };
      };
      respostas_usuario: {
        Row: {
          id: number;
          user_id: string;
          pergunta_id: number;
          acertou: boolean;
          created_at: string;
        };
        Insert: {
          user_id: string;
          pergunta_id: number;
          acertou: boolean;
        };
        Update: never;
      };
      streaks: {
        Row: {
          user_id: string;
          streak_atual: number;
          maior_streak: number;
          ultimo_acesso: string | null;
          updated_at: string;
        };
        Insert: never;
        Update: never;
      };
      conquistas: {
        Row: {
          id: number;
          codigo: string;
          nome: string;
          descricao: string | null;
          icone: string;
          created_at: string;
        };
        Insert: never;
        Update: never;
      };
      usuario_conquistas: {
        Row: {
          id: number;
          user_id: string;
          conquista_id: number;
          created_at: string;
        };
        Insert: never;
        Update: never;
      };
      auditoria_admin: {
        Row: {
          id: number;
          admin_id: string | null;
          acao: string;
          entidade: string;
          entidade_id: string | null;
          valores_antigos: Record<string, unknown> | null;
          valores_novos: Record<string, unknown> | null;
          created_at: string;
        };
        Insert: never;
        Update: never;
      };
    };
    Views: {
      ranking_publico: {
        Row: {
          id: string;
          nome: string;
          xp: number;
          nivel: string;
          liga_id: number | null;
        };
      };
    };
    Functions: {
      responder_pergunta: {
        Args: { p_pergunta_id: number; p_resposta_selecionada: string };
        Returns: {
          correct: boolean;
          xp: number;
          nivel: string;
          first_attempt: boolean;
        };
      };
      criar_liga: {
        Args: { p_nome: string };
        Returns: { liga_id: number; nome: string; codigo_acesso: string };
      };
      entrar_liga: {
        Args: { p_codigo: string };
        Returns: { liga_id: number; nome: string; codigo_acesso: string };
      };
      sair_liga: {
        Args: Record<string, never>;
        Returns: { success: boolean };
      };
      registrar_acesso: {
        Args: Record<string, never>;
        Returns: { streak_atual: number; maior_streak: number };
      };
      obter_minha_liga_codigo: {
        Args: Record<string, never>;
        Returns: { codigo_acesso: string } | null;
      };
    };
  };
}

// Aliases convenientes usados pelas telas.
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Liga = Database['public']['Tables']['ligas']['Row'];
export type Temporada = Database['public']['Tables']['temporadas']['Row'];
export type Pergunta = Database['public']['Tables']['perguntas']['Row'];
export type RankingEntry = Database['public']['Views']['ranking_publico']['Row'];
export type ResponderPerguntaResult = Database['public']['Functions']['responder_pergunta']['Returns'];
export type RegistrarAcessoResult = Database['public']['Functions']['registrar_acesso']['Returns'];
