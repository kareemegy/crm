import { Component } from 'react';

// Top-level safety net for uncaught React render errors. Instead of the page
// going blank / showing a minified stack, we show a recovery screen and let
// the user reload.
export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) { return { error }; }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="min-h-screen flex items-center justify-center p-8
                      bg-ink-bg dark:bg-night-bg text-ink-text dark:text-night-text">
        <div className="max-w-md text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-rose-500/10 text-rose-500
                          flex items-center justify-center text-2xl font-semibold">!</div>
          <h1 className="text-xl font-semibold mb-2">Something went wrong</h1>
          <p className="text-[13px] text-ink-muted dark:text-night-muted mb-5">
            The page hit an unexpected error. Reloading usually fixes it —
            your data is safe.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="px-4 py-2 rounded-md bg-sky-600 hover:bg-sky-500 text-white text-sm font-medium transition-colors"
          >
            Reload page
          </button>
        </div>
      </div>
    );
  }
}
