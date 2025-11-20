import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, DollarSign, Users, AlertTriangle } from 'lucide-react';
import { EarningsData } from '../types';

const data: EarningsData[] = [
  { date: 'Mon', adRevenue: 120, commission: 45 },
  { date: 'Tue', adRevenue: 132, commission: 55 },
  { date: 'Wed', adRevenue: 101, commission: 30 },
  { date: 'Thu', adRevenue: 154, commission: 80 },
  { date: 'Fri', adRevenue: 190, commission: 110 },
  { date: 'Sat', adRevenue: 230, commission: 150 },
  { date: 'Sun', adRevenue: 210, commission: 130 },
];

export const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6 pb-20 md:pb-0 animate-fade-in">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Dashboard</h2>
          <p className="text-zinc-400">Welcome back, Vijay General Store</p>
        </div>
        <div className="bg-zinc-900 px-4 py-2 rounded-full border border-zinc-800 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-sm font-medium text-zinc-300">System Online</span>
        </div>
      </header>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-zinc-900 p-5 rounded-xl border border-zinc-800">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-red-500/10 rounded-lg">
              <DollarSign className="text-red-500" size={24} />
            </div>
            <span className="text-xs text-green-400 font-medium flex items-center gap-1">
              <TrendingUp size={12} /> +12.5%
            </span>
          </div>
          <h3 className="text-zinc-400 text-sm font-medium">Total Earnings</h3>
          <p className="text-2xl font-bold text-white mt-1">₹14,250</p>
        </div>

        <div className="bg-zinc-900 p-5 rounded-xl border border-zinc-800">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Users className="text-blue-500" size={24} />
            </div>
          </div>
          <h3 className="text-zinc-400 text-sm font-medium">Footfall (Est.)</h3>
          <p className="text-2xl font-bold text-white mt-1">1,240</p>
        </div>

        <div className="bg-zinc-900 p-5 rounded-xl border border-zinc-800">
           <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <TrendingUp className="text-purple-500" size={24} />
            </div>
          </div>
          <h3 className="text-zinc-400 text-sm font-medium">Pending Orders</h3>
          <p className="text-2xl font-bold text-white mt-1">5</p>
        </div>

        <div className="bg-zinc-900 p-5 rounded-xl border border-zinc-800">
           <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-amber-500/10 rounded-lg">
              <AlertTriangle className="text-amber-500" size={24} />
            </div>
          </div>
          <h3 className="text-zinc-400 text-sm font-medium">Low Stock Alerts</h3>
          <p className="text-2xl font-bold text-white mt-1">3 Items</p>
        </div>
      </div>

      {/* Main Chart */}
      <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800">
        <h3 className="text-lg font-semibold text-white mb-6">Weekly Revenue</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
              <XAxis dataKey="date" stroke="#71717a" tick={{fill: '#71717a'}} axisLine={false} tickLine={false} />
              <YAxis stroke="#71717a" tick={{fill: '#71717a'}} axisLine={false} tickLine={false} tickFormatter={(value) => `₹${value}`} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#fff' }}
                cursor={{fill: '#27272a'}}
              />
              <Bar dataKey="adRevenue" name="Ad Revenue" fill="#dc2626" radius={[4, 4, 0, 0]} />
              <Bar dataKey="commission" name="Commissions" fill="#404040" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};