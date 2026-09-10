import { createClient } from '@supabase/supabase-js';

<<<<<<< HEAD
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

// Falha explícita em vez de cair silenciosamente para um projeto hardcoded.
// Nunca coloque a service_role key aqui — apenas a publishable/anon key,
// que é segura para expor no frontend (a segurança real vem do RLS).
if (!supabaseUrl || !supabasePublishableKey) {
  throw new Error(
    'Configuração do Supabase ausente. Defina VITE_SUPABASE_URL e ' +
    'VITE_SUPABASE_PUBLISHABLE_KEY no seu arquivo .env (veja .env.example).'
  );
}

// NOTA (Fase 3 do plano de auditoria): o ideal é tipar o client como
// createClient<Database>(...) usando src/types/database.types.ts. Isso foi
// tentado e revertido aqui porque o arquivo é escrito à mão (não gerado
// pelo CLI oficial) e não bate 100% com o contrato interno que o
// supabase-js exige para o generic — gerava falsos erros de compilação.
// Assim que rodar `npx supabase gen types typescript --project-id <ref>`
// contra o projeto real, troque a linha abaixo por createClient<Database>.
export const supabase = createClient(supabaseUrl, supabasePublishableKey);
=======
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://cagywhslrofuwlmpzbfy.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_mmxRQpS9zKRRmndSiE8i6g_qVvdTSsa';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
>>>>>>> 1c9dddf3020316eaaa9e1fdf62452ec18491ea3a
