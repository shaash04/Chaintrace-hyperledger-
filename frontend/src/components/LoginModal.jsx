import React from 'react';
import { Shield, Building2, Truck, Store, CheckCircle, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginModal = ({ isOpen, onClose }) => {
  const { currentRole, selectRole, allRoles } = useAuth();

  if (!isOpen) return null;

  const roles = [
    {
      id: 'Manufacturer',
      title: 'Manufacturer',
      org: 'Org1MSP',
      icon: Building2,
      badge: 'Org1 (Production)',
      canDo: 'Register products on blockchain, initial transfer to distributor',
      restrictions: 'Initial supply chain node'
    },
    {
      id: 'Distributor',
      title: 'Distributor',
      org: 'Org1MSP / Org2MSP',
      icon: Truck,
      badge: 'Logistics Partner',
      canDo: 'Mark receipt at warehouse, update locations, transfer to retailer',
      restrictions: 'Cannot create new products'
    },
    {
      id: 'Retailer',
      title: 'Retailer',
      org: 'Org2MSP',
      icon: Store,
      badge: 'Org2 (Retail Outlet)',
      canDo: 'Confirm final delivery and customer receipt',
      restrictions: 'Cannot create products or transfer backwards'
    }
  ];

  const handleSelect = (roleId) => {
    selectRole(roleId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-5 bg-navy-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-teal-500/20 text-teal-400 border border-teal-500/30">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">Select Participant Role</h3>
              <p className="text-xs text-slate-300">Hyperledger Fabric Role-Based Access Control (RBAC)</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-3">
          <p className="text-xs text-slate-600 mb-2">
            Choose an authorized organization identity to simulate transactions with cryptographically verified permissions:
          </p>

          {roles.map((r) => {
            const Icon = r.icon;
            const isSelected = currentRole === r.id;
            return (
              <div
                key={r.id}
                onClick={() => handleSelect(r.id)}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-4 ${
                  isSelected
                    ? 'border-teal-500 bg-teal-50/50 ring-2 ring-teal-500/20'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className={`p-2.5 rounded-lg shrink-0 ${
                  isSelected ? 'bg-teal-500 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sm text-navy-900">{r.title}</span>
                    <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                      {r.org}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mb-1">{r.canDo}</p>
                  <p className="text-[11px] text-slate-400 italic">Policy: {r.restrictions}</p>
                </div>
                {isSelected && (
                  <CheckCircle className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                )}
              </div>
            );
          })}
        </div>

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
