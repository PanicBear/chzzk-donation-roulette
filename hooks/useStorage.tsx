import { useCallback, useEffect, useRef } from "react";

export default function useStorage<T>() {
  const storage = useRef<Storage | null>(null);

  useEffect(() => {
    if (storage.current) return;

    storage.current = localStorage;
  }, []);

  const getItem: (key: string) => T | null = useCallback((key) => {
    let item: T | null = null;

    try {
      const origin = storage.current?.getItem(key);
      item = origin ? JSON.parse(origin) : null;
    } catch (error) {}

    return item;
  }, []);

  const setItem = useCallback((key: string, value: unknown) => {
    storage.current?.setItem(key, JSON.stringify(value));
  }, []);

  return {
    getItem,
    setItem,
  };
}
