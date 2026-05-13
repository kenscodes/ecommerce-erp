import { useState } from 'react';
import Dashboard from './components/Dashboard';
import InventoryManager from './components/InventoryManager';
import UserManager from './components/UserManager';
import OrderManager from './components/OrderManager';
import './App.css';

type Tab = 'dashboard' | 'inventory' | 'users' | 'orders';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');

  return (
    <div className="app">
      <header className="app-header">
        <h1>🏢 ERP System</h1>
        <nav className="nav-tabs">
          <button
            className={activeTab === 'dashboard' ? 'active' : ''}
            onClick={() => setActiveTab('dashboard')}
          >
            📊 Dashboard
          </button>
          <button
            className={activeTab === 'inventory' ? 'active' : ''}
            onClick={() => setActiveTab('inventory')}
          >
            📦 Inventory
          </button>
          <button
            className={activeTab === 'users' ? 'active' : ''}
            onClick={() => setActiveTab('users')}
          >
            👥 Users
          </button>
          <button
            className={activeTab === 'orders' ? 'active' : ''}
            onClick={() => setActiveTab('orders')}
          >
            🛒 Orders
          </button>
        </nav>
      </header>

      <main className="app-main">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'inventory' && <InventoryManager />}
        {activeTab === 'users' && <UserManager />}
        {activeTab === 'orders' && <OrderManager />}
      </main>
    </div>
  );
}

export default App;
