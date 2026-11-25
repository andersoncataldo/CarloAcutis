import React from 'react';
import { Link } from 'react-router-dom';
import { m } from 'framer-motion';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen pt-32 pb-20 px-6 bg-slate-50">
      <m.article
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto bg-white p-8 md:p-14 rounded-[2.5rem] shadow-xl border border-slate-100 space-y-10 text-slate-700 leading-relaxed"
      >
        <header className="space-y-4 border-b border-slate-100 pb-8">
          <span className="inline-block text-[10px] font-black uppercase tracking-[0.3em] text-red-600 bg-red-50 px-3 py-1.5 rounded-full">
            Transparência &amp; LGPD
          </span>
          <h1 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter text-blue-950">
            Política de Privacidade<span className="text-red-600">.</span>
          </h1>
          <p className="text-sm text-slate-500 font-medium">
            Última atualização: novembro de 2026 • Plataforma Educativa e Devocional São Carlo Acutis
          </p>
        </header>

        <section className="space-y-3">
          <h2 className="text-lg font-black uppercase italic text-blue-950">
            1. Nosso compromisso com a privacidade
          </h2>
          <p>
            Esta plataforma é um projeto educativo e devocional sem fins lucrativos dedicado à vida e
            ao legado de São Carlo Acutis. Seguimos o princípio da <strong>minimização de dados</strong>{' '}
            previsto na Lei Geral de Proteção de Dados (Lei nº 13.709/2018 — LGPD): coletamos apenas
            o estritamente necessário para o funcionamento do quiz, do progresso em XP e das ligas paroquiais.
          </p>
          <p>
            Você pode ler toda a biografia e jogar o quiz no <strong>modo visitante</strong> sem
            criar conta e sem informar nenhum dado pessoal.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-black uppercase italic text-blue-950">
            2. Quais dados coletamos quando você cria uma conta
          </h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Nome de exibição:</strong> usado para identificar você no seu perfil e no
              ranking da liga paroquial que escolher participar.
            </li>
            <li>
              <strong>E-mail:</strong> usado exclusivamente para login. <strong>Nunca</strong> é
              exibido publicamente, nem mesmo para outros membros da sua liga.
            </li>
            <li>
              <strong>Senha:</strong> nunca é armazenada em texto puro; é protegida no servidor por
              hash criptográfico forte (<code>scrypt</code> com salt aleatório).
            </li>
            <li>
              <strong>Progresso no quiz:</strong> respostas, pontos de XP, sequência diária (streak),
              conquistas e vínculo opcional a uma liga paroquial.
            </li>
            <li>
              <strong>Proteção contra abuso:</strong> para prevenir tentativas automatizadas de
              invasão (rate limiting), utilizamos apenas um código criptográfico irreversível
              (hash SHA-256), sem gravar seu endereço IP em texto puro.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-black uppercase italic text-blue-950">
            3. Atenção especial a crianças e adolescentes (Art. 14 da LGPD)
          </h2>
          <p>
            Como esta plataforma também é utilizada em encontros de catequese, grupos de jovens e
            escolas, não exibimos anúncios, não vendemos dados a terceiros, não utilizamos rastreadores
            publicitários e não possuímos chat aberto entre usuários.
          </p>
          <p>
            Se você for menor de idade, recomendamos criar sua conta com o conhecimento e a
            orientação de seus pais, responsáveis legais ou catequista — ou utilizar livremente o
            modo visitante sem cadastro.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-black uppercase italic text-blue-950">
            4. Cookies e armazenamento local
          </h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Cookie essencial de sessão (<code>carlo_session</code>):</strong> cookie
              estritamente necessário, protegido com <code>HttpOnly</code>, <code>SameSite=Lax</code>{' '}
              e <code>Secure</code>, utilizado apenas para manter você autenticado.
            </li>
            <li>
              <strong>Armazenamento local (<code>localStorage</code>):</strong> usado no seu próprio
              dispositivo para salvar preferência de som e o progresso temporário do modo visitante.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-black uppercase italic text-blue-950">
            5. Seus direitos (acesso, retificação e exclusão)
          </h2>
          <p>
            A qualquer momento, se você possuir uma conta, pode acessar a página{' '}
            <Link to="/perfil" className="text-blue-800 font-bold underline hover:text-red-600">
              Meu Perfil
            </Link>{' '}
            para:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Editar seu nome de exibição</strong> diretamente na seção{' '}
              <em>Privacidade e Conta</em>.
            </li>
            <li>
              <strong>Excluir definitivamente sua conta e todos os seus dados</strong> (perfil,
              sessões, respostas, streaks e conquistas) em um clique, mediante confirmação de senha.
            </li>
          </ul>
          <p>
            Para dúvidas ou solicitações adicionais de privacidade (incluindo pedidos de pais ou
            responsáveis legais), entre em contato pelo e-mail{' '}
            <a
              href="mailto:andersonvcataldo@gmail.com"
              className="text-blue-800 font-bold underline hover:text-red-600"
            >
              andersonvcataldo@gmail.com
            </a>
            .
          </p>
        </section>

        <div className="pt-6 border-t border-slate-100 flex flex-wrap gap-4">
          <Link
            to="/"
            className="px-6 py-3 bg-blue-900 text-white rounded-full text-xs font-black uppercase tracking-widest hover:bg-red-600 transition-colors"
          >
            Voltar ao Início
          </Link>
          <Link
            to="/quiz"
            className="px-6 py-3 bg-slate-100 text-blue-950 rounded-full text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-colors"
          >
            Ir para o Quiz
          </Link>
        </div>
      </m.article>
    </div>
  );
};

export default PrivacyPolicy;
