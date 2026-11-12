import React from 'react';
import { 
  LayoutDashboard, 
  Package, 
  GitFork, 
  History, 
  ShieldCheck,
  Layers
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Sidebar = ({ activeTab, setActiveTab, networkConnected }) => {
  const { user } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'tracking', label: 'Supply Chain Tracking', icon: GitFork },
    { id: 'history', label: 'Blockchain History', icon: History },
  ];

  return (
    <aside className="w-64 bg-navy-900 text-slate-200 flex flex-col border-r border-navy-800 shrink-0">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-navy-800 gap-3">
        <div className="w-9 h-9 rounded-lg bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400">
          <Layers className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-bold text-lg tracking-tight text-white flex items-center gap-1.5">
            ChainTrace
          </h1>
          <p className="text-[10px] text-teal-400 font-medium uppercase tracking-wider">
            Fabric Supply Chain
          </p>
        </div>
      </div>

      {/* Navigation Links - ONLY the 4 required */}
      <nav className="flex-1 py-6 px-3 space-y-1.5">
        <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
          Core Modules
        </p>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-teal-500 text-white shadow-sm'
                  : 'text-slate-300 hover:bg-navy-800 hover:text-white'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Fabric Network Live Status in Sidebar */}
      <div className="p-4 border-t border-navy-800 bg-navy-950/50">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="text-slate-400 font-medium">Hyperledger Fabric</span>
          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium ${
            networkConnected ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${networkConnected ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
            {networkConnected ? 'Live' : 'Offline'}
          </span>
        </div>
        <div className="text-[11px] text-slate-400 space-y-0.5">
          <div className="flex justify-between">
            <span>Channel:</span>
            <span className="text-slate-200 font-mono">supplychannel</span>
          </div>
          <div className="flex justify-between">
            <span>Contract:</span>
            <span className="text-slate-200 font-mono">supplychain</span>
          </div>
        </div>
      </div>

      {/* Active Role Card */}
      <div className="p-4 border-t border-navy-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-navy-700 flex items-center justify-center text-teal-300 font-bold text-xs border border-navy-600">
            {user.id[0]}
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-semibold text-white truncate">{user.name}</p>
            <p className="text-[11px] text-teal-400 font-medium truncate flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 shrink-0" />
              {user.id} ({user.msp})
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};
