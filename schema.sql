-- =================================================================
-- SCRIPT DE MIGRACAO DO PROJETO CARLO ACUTIS PARA SUPABASE
-- Cole este script no SQL Editor do seu Dashboard Supabase.
-- =================================================================

-- Enable UUID Extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABELA DE LIGAS PAROQUIAIS
CREATE TABLE IF NOT EXISTS public.ligas (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    codigo_acesso VARCHAR(20) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. TABELA DE PROFILES (ESTENDE AUTH.USERS)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    xp INT NOT NULL DEFAULT 0,
    nivel VARCHAR(100) NOT NULL DEFAULT 'Peregrino',
    liga_id BIGINT REFERENCES public.ligas(id) ON DELETE SET NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. TABELA DE TEMPORADAS DO QUIZ
CREATE TABLE IF NOT EXISTS public.temporadas (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. TABELA DE PERGUNTAS DO QUIZ
CREATE TABLE IF NOT EXISTS public.perguntas (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    temporada_id BIGINT NOT NULL REFERENCES public.temporadas(id) ON DELETE CASCADE,
    texto_pergunta TEXT NOT NULL,
    opcao_a TEXT NOT NULL,
    opcao_b TEXT NOT NULL,
    opcao_c TEXT NOT NULL,
    opcao_d TEXT NOT NULL,
    resposta_correta VARCHAR(5) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =================================================================
-- TRIGGER PARA CRIAR PROFILE AUTOMATICAMENTE QUANDO UM USUARIO SE REGISTRA
-- =================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, nome, email, xp, nivel)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'nome', 'Peregrino'),
        NEW.email,
        0,
        'Peregrino'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists to prevent duplication
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =================================================================
-- FUNCTION RPC PARA CALCULAR TITULO / NIVEL BASEADO NO XP
-- =================================================================
CREATE OR REPLACE FUNCTION public.calcular_titulo(xp_total INT)
RETURNS VARCHAR AS $$
DECLARE
    nivel_num INT;
BEGIN
    nivel_num := (xp_total / 1000) + 1;
    IF nivel_num < 5 THEN RETURN 'Peregrino';
    ELSIF nivel_num < 10 THEN RETURN 'Discípulo';
    ELSIF nivel_num < 20 THEN RETURN 'Missionário';
    ELSIF nivel_num < 50 THEN RETURN 'Apóstolo Digital';
    ELSE RETURN 'Ciberapóstolo da Eucaristia';
    END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- =================================================================
-- FUNCTION RPC PARA RESPONDER PERGUNTA COM SEGURANCA NO BANCO
-- =================================================================
CREATE OR REPLACE FUNCTION public.responder_pergunta(
    p_pergunta_id BIGINT,
    p_resposta_selecionada VARCHAR
)
RETURNS JSONB AS $$
DECLARE
    v_user_id UUID;
    v_resposta_correta VARCHAR;
    v_is_correct BOOLEAN := FALSE;
    v_new_xp INT;
    v_new_nivel VARCHAR;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Usuário não autenticado.';
    END IF;

    SELECT resposta_correta INTO v_resposta_correta
    FROM public.perguntas
    WHERE id = p_pergunta_id;

    IF v_resposta_correta IS NULL THEN
        RAISE EXCEPTION 'Pergunta não encontrada.';
    END IF;

    IF UPPER(v_resposta_correta) = UPPER(p_resposta_selecionada) THEN
        v_is_correct := TRUE;
        
        UPDATE public.profiles
        SET xp = xp + 100,
            nivel = public.calcular_titulo(xp + 100),
            updated_at = NOW()
        WHERE id = v_user_id
        RETURNING xp, nivel INTO v_new_xp, v_new_nivel;
    ELSE
        SELECT xp, nivel INTO v_new_xp, v_new_nivel
        FROM public.profiles
        WHERE id = v_user_id;
    END IF;

    RETURN jsonb_build_object(
        'correct', v_is_correct,
        'xp', v_new_xp,
        'nivel', v_new_nivel
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =================================================================
-- CONFIGURACAO DE ROW LEVEL SECURITY (RLS)
-- =================================================================
ALTER TABLE public.ligas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.temporadas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.perguntas ENABLE ROW LEVEL SECURITY;

-- Policies para Ligas
CREATE POLICY "Leitura de Ligas permitida para autenticados"
ON public.ligas FOR SELECT TO authenticated USING (true);

CREATE POLICY "Criação de Ligas permitida para autenticados"
ON public.ligas FOR INSERT TO authenticated WITH CHECK (true);

-- Policies para Profiles
CREATE POLICY "Leitura de Profiles permitida para autenticados"
ON public.profiles FOR SELECT TO authenticated USING (true);

CREATE POLICY "Atualização de Profile pelo próprio usuário"
ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Policies para Temporadas
CREATE POLICY "Leitura de Temporadas pública"
ON public.temporadas FOR SELECT TO anon, authenticated USING (true);

-- Policies para Perguntas
CREATE POLICY "Leitura de Perguntas pública"
ON public.perguntas FOR SELECT TO anon, authenticated USING (true);

-- =================================================================
-- SEED DATA (DADOS INICIAIS DE TESTE)
-- =================================================================
INSERT INTO public.temporadas (titulo, descricao)
VALUES 
('Temporada 1: Vida e Eucaristia', 'Conheça os primeiros anos e a profunda devoção eucarística de Carlo Acutis.'),
('Temporada 2: Milagres Eucarísticos e Tecnologia', 'Descubra como Carlo usou a computação para evangelizar o mundo.')
ON CONFLICT DO NOTHING;

INSERT INTO public.perguntas (temporada_id, texto_pergunta, opcao_a, opcao_b, opcao_c, opcao_d, resposta_correta)
VALUES
(1, 'Em qual cidade Carlo Acutis nasceu?', 'Milão', 'Londres', 'Roma', 'Assis', 'B'),
(1, 'Qual expressão famosa Carlo Acutis dizia sobre a Eucaristia?', 'Meu plano de vida', 'Minha autoestrada para o céu', 'Meu refúgio diário', 'Minha luz divina', 'B'),
(1, 'Em que ano Carlo Acutis foi beatificado?', '2018', '2019', '2020', '2021', 'C'),
(2, 'O que Carlo Acutis criou na internet para evangelizar?', 'Um jogo de RPG católico', 'Uma rede social para jovens', 'Uma exposição virtual dos Milagres Eucarísticos', 'Um aplicativo de orações diárias', 'C'),
(2, 'Qual animal de estimação Carlo gostava muito de cuidar?', 'Cães e gatos', 'Pássaros', 'Peixes', 'Coelhos', 'A')
ON CONFLICT DO NOTHING;
