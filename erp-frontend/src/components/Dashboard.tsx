import { useState, useEffect } from 'react';
import { erpApi } from '../api/erp';

interface DashboardStats {
  totalUsers: number;
  totalInventory: number;
  totalOrders: number;
  totalRevenue: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalInventory: 0,
    totalOrders: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [usersRes, inventoryRes, ordersRes] = await Promise.all([
        erpApi.getUsers(),
        erpApi.getInventory(),
        erpApi.getOrders(),
      ]);

      const totalRevenue = ordersRes.data?.reduce(
        (sum: number, order: any) => sum + (order.total_amount || 0),
        0
      ) || 0;

      setStats({
        totalUsers: usersRes.data?.length || 0,
        totalInventory: inventoryRes.data?.length || 0,
        totalOrders: ordersRes.data?.length || 0,
        totalRevenue,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  return (
    <div className="dashboard">
      <h2>📊 ERP Dashboard</h2>
      <div className="stats-grid">
        <div className="stat-card">
          <h3>👥 Total Users</h3>
          <p className="stat-number">{stats.totalUsers}</p>
        </div>
        <div className="stat-card">
          <h3>📦 Inventory Items</h3>
          <p className="stat-number">{stats.totalInventory}</p>
        </div>
        <div className="stat-card">
          <h3>🛒 Total Orders</h3>
          <p className="stat-number">{stats.totalOrders}</p>
        </div>
        <div className="stat-card">
          <h3>💰 Total Revenue</h3>
          <p className="stat-number">${stats.totalRevenue.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
}
