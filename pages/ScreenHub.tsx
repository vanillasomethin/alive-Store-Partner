import React from 'react';
import { ScreenStatus } from '../types';
import { Wifi, WifiOff, Activity, PlayCircle, SkipForward } from 'lucide-react';

export const ScreenHub: React.FC = () => {
  const status = ScreenStatus.ONLINE;
  const uptime = 98.5;

  return (
    <div className="pb-20 md:pb-0 space-y-6">
      <h2 className="text-2xl font-bold text-white">Screen Hub</h2>

      {/* Status Banner */}
      <div className={`p-6 rounded-2xl border flex items-center justify-between ${status === ScreenStatus.ONLINE ? 'bg-green-900/20 border-green-900' : 'bg-red-900/20 border-red-900'}`}>
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-full ${status === ScreenStatus.ONLINE ? 'bg-green-600' : 'bg-red-600'}`}>
            {status === ScreenStatus.ONLINE ? <Wifi className="text-white" /> : <WifiOff className="text-white" />}
          </div>
          <div>
            <h3 className="text-white font-bold text-lg">Device {status}</h3>
            <p className="text-zinc-400 text-sm">Device ID: ALIVE-K-4829</p>
          </div>
        </div>
        <div className="text-right hidden md:block">
           <p className="text-sm text-zinc-500 uppercase tracking-wide">Uptime this month</p>
           <p className="text-2xl font-mono text-white">{uptime}%</p>
        </div>
      </div>

      {/* Live Preview Mockup */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <div className="flex justify-between items-end">
             <h3 className="text-white font-semibold flex items-center gap-2"><Activity size={18} className="text-red-500"/> Live Preview</h3>
             <span className="text-xs text-zinc-500">Updates every 30s</span>
          </div>
          
          <div className="aspect-video bg-zinc-800 rounded-xl overflow-hidden relative shadow-2xl shadow-black border border-zinc-700 group">
            {/* Simulated Screen Content */}
            <img 
              src="https://picsum.photos/800/450" 
              alt="Ad Content" 
              className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" 
            />
            <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-md px-3 py-1 rounded-full text-xs text-white font-mono border border-white/10">
              PLAYING
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-6">
                <h4 className="text-white font-bold text-xl">Coca-Cola Zero Sugar</h4>
                <p className="text-zinc-300 text-sm">Summer Campaign • 15s Spot</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
            <h3 className="text-white font-semibold">Up Next</h3>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-3 items-center p-2 hover:bg-zinc-800/50 rounded-lg transition-colors cursor-pointer">
                        <div className="w-16 h-10 bg-zinc-800 rounded overflow-hidden relative">
                             <img src={`https://picsum.photos/100/60?random=${i}`} alt="thumb" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">Brand Campaign {i}</p>
                            <p className="text-xs text-zinc-500">00:15 • Video</p>
                        </div>
                        <button className="text-zinc-600 hover:text-white"><SkipForward size={16}/></button>
                    </div>
                ))}
            </div>
            <button className="w-full py-3 rounded-xl border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 transition-all text-sm font-medium">
                View Full Schedule
            </button>
        </div>
      </div>
    </div>
  );
};