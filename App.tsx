import React, { useState, useEffect } from 'react';
import { Sidebar, MobileNav } from './components/Navigation';
import { Dashboard } from './pages/Dashboard';
import { Orders } from './pages/Orders';
import { ScreenHub } from './pages/ScreenHub';
import { Inventory } from './pages/Inventory';
import { Rebate } from './pages/Rebate';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoaded, setIsLoaded] = useState(false);

  // Simple entry animation effect
  useEffect(() => {
    setTimeout(() => setIsLoaded(true), 100);
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'orders': return <Orders />;
      case 'screen': return <ScreenHub />;
      case 'inventory': return <Inventory />;
      case 'rebates': return <Rebate />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className={`bg-zinc-950 min-h-screen text-zinc-100 transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="md:ml-64 min-h-screen p-4 md:p-8 max-w-7xl mx-auto">
        {renderContent()}
      </main>

      <MobileNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};

export default App;