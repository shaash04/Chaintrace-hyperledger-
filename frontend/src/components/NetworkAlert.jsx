import React from 'react';
import { AlertTriangle, ServerOff, Terminal } from 'lucide-react';

export const NetworkAlert = ({ networkStatus }) => {
  if (networkStatus?.connected) return null;

  return (
    <div className="bg-rose-50 border-b border-rose-200 px-6 py-3 flex items-center justify-between text-rose-900 text-xs">
      <div className="flex items-center gap-3">
        <div className="p-1 rounded bg-rose-200/60 text-rose-700">
          <ServerOff className="w-4 h-4" />
        </div>
        <div>
          <span className="font-bold">Hyperledger Fabric Network Offline:</span>{' '}
          Cannot connect to peer on <code className="font-mono bg-rose-100 px-1 py-0.5 rounded">localhost:7051</code>.
          {networkStatus?.error && (
            <span className="text-rose-700 ml-1">({networkStatus.error})</span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 text-[11px] font-medium text-rose-700">
        <Terminal className="w-3.5 h-3.5" />
        <span>Run <code>./blockchain/scripts/startNetwork.sh</code> in WSL</span>
      </div>
    </div>
  );
};
