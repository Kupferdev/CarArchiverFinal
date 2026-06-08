import { useState, useEffect } from 'react';

export function useDashboardStats() {
  const [stats, setStats] = useState({
    services: 0,
    customers: 0,
    cars: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Arka taraftaki (Electron) IPC kanalından verileri istiyoruz
        const data = await (window as any).electron.ipcRenderer.invoke('get-dashboard-stats');
        if (data) {
          setStats(data);
        }
      } catch (error) {
        console.error('İstatistikler çekilirken hata:', error);
      }
    };

    fetchStats();
  }, []);

  return { stats };
}