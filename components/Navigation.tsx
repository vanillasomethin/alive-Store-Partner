import React from 'react';
import { LayoutDashboard, ShoppingBag, Package, MonitorPlay, Receipt, LogOut } from 'lucide-react';

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const NavItem = ({ id, icon: Icon, label, active, onClick, mobile = false }: any) => {
  const baseClasses = "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium cursor-pointer";
  const activeClasses = "bg-red-600 text-white shadow-lg shadow-red-900/20";
  const inactiveClasses = "text-zinc-400 hover:bg-zinc-800 hover:text-red-400";
  
  if (mobile) {
      return (
          <button 
            onClick={() => onClick(id)}
            className={`flex flex-col items-center justify-center p-2 w-full ${active ? 'text-red-500' : 'text-zinc-500'}`}
          >
              <Icon size={20} />
              <span className="text-[10px] mt-1 font-medium">{label}</span>
          </button>
      )
  }

  return (
    <button
      onClick={() => onClick(id)}
      className={`${baseClasses} ${active ? activeClasses : inactiveClasses} w-full`}
    >
      <Icon size={20} />
      <span>{label}</span>
    </button>
  );
};

export const Sidebar: React.FC<NavigationProps> = ({ activeTab, setActiveTab }) => {
  return (
    <div className="hidden md:flex flex-col w-64 h-screen bg-zinc-950 border-r border-zinc-800 p-4 fixed left-0 top-0 z-50">
      <div className="flex items-center gap-2 px-4 mb-10 mt-2">
        <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center font-bold text-white">A</div>
        <h1 className="text-2xl font-bold tracking-tighter text-white">ALIVE<span className="text-red-600">.</span></h1>
      </div>

      <div className="space-y-2 flex-1">
        <NavItem id="dashboard" icon={LayoutDashboard} label="Overview" active={activeTab === 'dashboard'} onClick={setActiveTab} />
        <NavItem id="orders" icon={ShoppingBag} label="Orders" active={activeTab === 'orders'} onClick={setActiveTab} />
        <NavItem id="inventory" icon={Package} label="Inventory" active={activeTab === 'inventory'} onClick={setActiveTab} />
        <NavItem id="screen" icon={MonitorPlay} label="Ad Screen" active={activeTab === 'screen'} onClick={setActiveTab} />
        <NavItem id="rebates" icon={Receipt} label="Rebates" active={activeTab === 'rebates'} onClick={setActiveTab} />
      </div>

      <div className="mt-auto border-t border-zinc-800 pt-4">
        <NavItem id="logout" icon={LogOut} label="Sign Out" active={false} onClick={() => {}} />
      </div>
    </div>
  );
};

export const MobileNav: React.FC<NavigationProps> = ({ activeTab, setActiveTab }) => {
    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-zinc-950 border-t border-zinc-800 pb-safe pt-2 px-2 flex justify-between z-50">
             <NavItem mobile id="dashboard" icon={LayoutDashboard} label="Home" active={activeTab === 'dashboard'} onClick={setActiveTab} />
             <NavItem mobile id="orders" icon={ShoppingBag} label="Orders" active={activeTab === 'orders'} onClick={setActiveTab} />
             <NavItem mobile id="screen" icon={MonitorPlay} label="Screen" active={activeTab === 'screen'} onClick={setActiveTab} />
             <NavItem mobile id="rebates" icon={Receipt} label="Rebates" active={activeTab === 'rebates'} onClick={setActiveTab} />
        </div>
    )
}