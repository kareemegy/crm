import { useCallback, useEffect, useState } from 'react';

// Minimal data-fetching hook. Returns { data, loading, error, refetch }.
// `data` starts as undefined (not null) so `const { data = [] } = useAsync(...)`
// works — destructuring defaults only kick in for undefined.
export function useAsync(fn, deps = []) {
  const [state, setState] = useState({ data: undefined, loading: true, error: null });

  const run = useCallback(async () => {
    setState(s => ({ ...s, loading: true, error: null }));
    try {
      const data = await fn();
      setState({ data, loading: false, error: null });
    } catch (error) {
      setState({ data: undefined, loading: false, error });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => { run(); }, [run]);

  return { ...state, refetch: run };
}
