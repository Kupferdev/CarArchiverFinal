import { useState, useEffect } from 'react';

export function useInitialConfig() {
  const [isFirstRun, setIsFirstRun] = useState<boolean | null>(null);

  useEffect(() => {
    const check = async () => {
      const exists = await (window as any).electron.ipcRenderer.invoke('check-config');
      setIsFirstRun(!exists);
    };
    check();
  }, []);

  return { isFirstRun };
}