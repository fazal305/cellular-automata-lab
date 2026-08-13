import { useEffect, useState } from 'react';

/**
 * State that mirrors a localStorage key, JSON-serialized.
 *
 * Reads and writes are both wrapped in try/catch: localStorage can throw in
 * private browsing modes, when the quota is exceeded, or when it's simply
 * unavailable — none of which should ever break the app, so failures fall
 * back to the in-memory default and log a warning instead of throwing.
 */
export function useLocalStorage(key, defaultValue) {
  const [value, setValue] = useState(() => {
    try {
      const storedItem = window.localStorage.getItem(key);
      return storedItem !== null ? JSON.parse(storedItem) : defaultValue;
    } catch (error) {
      console.warn(`useLocalStorage: failed to read "${key}" from localStorage.`, error);
      return defaultValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn(`useLocalStorage: failed to write "${key}" to localStorage.`, error);
    }
  }, [key, value]);

  return [value, setValue];
}
