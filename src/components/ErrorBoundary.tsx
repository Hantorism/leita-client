import { Component, type ErrorInfo, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('[ErrorBoundary] Uncaught error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-[var(--color-bg-main)] flex flex-col items-center justify-center text-white font-Pretendard px-6">
          <div className="bg-[var(--color-bg-card)] border border-gray-800 rounded-2xl p-10 max-w-md w-full text-center shadow-2xl">
            <div className="text-5xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-[var(--color-brand)] mb-3">오류가 발생했습니다</h1>
            <p className="text-gray-400 text-sm mb-6 leading-relaxed">
              예기치 않은 문제가 발생했습니다.
              <br />
              아래 버튼을 눌러 홈으로 돌아가 주세요.
            </p>
            {this.state.error && (
              <details className="mb-6 text-left">
                <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-300 transition-colors">
                  오류 상세 정보
                </summary>
                <pre className="mt-2 p-3 bg-black/40 rounded-lg text-sm text-red-400 overflow-x-auto whitespace-pre-wrap break-words border border-gray-800">
                  {this.state.error.message}
                </pre>
              </details>
            )}
            <button
              onClick={this.handleReset}
              className="bg-[var(--color-brand)] text-black font-bold py-3 px-8 rounded-lg hover:bg-[#b8e62e] transition-colors text-sm shadow-[0_0_15px_rgba(202,255,51,0.2)]"
            >
              홈으로 돌아가기
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
