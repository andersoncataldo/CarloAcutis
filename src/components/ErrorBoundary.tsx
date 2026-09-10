import React from 'react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
}

// Error boundary simples: evita tela branca total se um componente quebrar
// em produção, e é o ponto único onde plugar um serviço de monitoramento
// de erros (ex: Sentry.captureException) — ver Fase 8 do plano de auditoria.
class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // TODO: encaminhar para um serviço de observabilidade (Sentry, etc.)
    // em vez de apenas console.error, quando a Fase 8 for implementada.
    console.error('Erro não tratado capturado pelo ErrorBoundary:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 px-6">
          <div className="text-center space-y-4 max-w-md">
            <div className="text-5xl">🙏</div>
            <h1 className="text-2xl font-black uppercase italic text-blue-950">Algo deu errado</h1>
            <p className="text-slate-500 font-medium text-sm">
              Encontramos um problema inesperado. Tente recarregar a página; se persistir, avise a equipe.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-blue-900 text-white rounded-xl font-black uppercase tracking-widest text-xs"
            >
              Recarregar
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
