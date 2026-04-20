import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

/**
 * Returns a handler that navigates to the previous page if the user got here
 * via in-app navigation, otherwise falls back to a given path. Use this
 * instead of hardcoded Links/paths on detail pages so "Back" actually means
 * "where I was a moment ago".
 *
 * React Router v6 stamps every navigated location with a random `key`. The
 * very first entry — i.e. a direct URL or a hard refresh — uses the sentinel
 * 'default'. That's our signal that `navigate(-1)` would leave the app, and
 * that we should fall back to `fallback` instead.
 */
export function useSmartBack(fallback = '/') {
  const location = useLocation();
  const navigate = useNavigate();

  return useCallback(() => {
    if (location.key && location.key !== 'default') {
      navigate(-1);
    } else {
      navigate(fallback);
    }
  }, [location.key, navigate, fallback]);
}
