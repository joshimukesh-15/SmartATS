import { Component } from 'react';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback({
          error: this.state.error,
          reset: this.handleReset,
        });
      }

      return (
        <div className="min-h-[360px] flex items-center justify-center p-8 bg-canvas text-ink">
          <div className="max-w-md w-full p-8 border border-line rounded-[14px] bg-surface text-center space-y-4">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-[10px] bg-surface-alt border border-line text-ink font-medium">
              !
            </div>
            <div className="space-y-1">
              <h2 className="text-[18px] font-medium text-ink">Something went wrong</h2>
              <p className="text-[14px] text-ink-muted leading-relaxed">
                {this.state.error?.message ||
                  'An unexpected error occurred while rendering this view.'}
              </p>
            </div>
            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={this.handleReset}
                className="px-4 py-2 text-[13px] font-medium rounded-[10px] border border-line bg-surface hover:bg-surface-alt text-ink transition-colors cursor-pointer"
              >
                Try again
              </button>
              <button
                type="button"
                onClick={this.handleReload}
                className="px-4 py-2 text-[13px] font-medium rounded-[10px] bg-primary text-on-primary transition-opacity hover:opacity-90 cursor-pointer"
              >
                Reload application
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
