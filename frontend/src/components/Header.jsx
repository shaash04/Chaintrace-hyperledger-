import React from 'react';
import { 
  Shield, 
  Server, 
  UserCheck, 
  ChevronDown,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Header = ({ title, onOpenRoleModal, networkStatus, onRefresh, isRefreshing }) => {
  const { user } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0">
      <div>
        <h2 className="text-xl font-bold text-navy-900 tracking-tight">{title}</h2>
      </div>

      <div className="flex items-center gap-4">
        {/* Refresh Data Button */}
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          title="Refresh Fabric Ledger Data"
          className="p-2 rounded-lg text-slate-500 hover:text-navy-900 hover:bg-slate-100 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-teal-600' : ''}`} />
        </button>

        {/* Network Connection Badge */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200">
          <Server className="w-3.5 h-3.5 text-slate-500" />
          <span>Peer0.Org1</span>
          <span className={`w-2 h-2 rounded-full ${networkStatus?.connected ? 'bg-emerald-500' : 'bg-rose-500'}`} />
          <span className="text-[11px] text-slate-500 font-mono">localhost:7051</span>
        </div>

        {/* Role Selector Button */}
        <button
          onClick={onOpenRoleModal}
          className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-lg bg-navy-900 text-white text-xs font-semibold hover:bg-navy-800 transition-colors shadow-sm"
        >
          <div className="w-2 h-2 rounded-full bg-teal-400" />
          <span>Role: <strong className="text-teal-300">{user.id}</strong></span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        </button>
      </div>
    </header>
  );
};
