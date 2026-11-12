import React, { useState } from 'react';
import { 
  History, 
  Search, 
  Filter, 
  Copy, 
  Check, 
  ExternalLink, 
  ShieldCheck, 
  FileText, 
  X,
  Layers,
  Database
} from 'lucide-react';

export const BlockchainHistory = ({ transactions, products, selectedProductFilter, onFilterChange }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const [selectedTx, setSelectedTx] = useState(null);

  const handleCopy = (txId) => {
    navigator.clipboard.writeText(txId);
    setCopiedId(txId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredTransactions = transactions.filter((tx) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = 
      (tx.txId && tx.txId.toLowerCase().includes(term)) ||
      (tx.productId && tx.productId.toLowerCase().includes(term)) ||
      (tx.productName && tx.productName.toLowerCase().includes(term)) ||
      (tx.initiatingOrg && tx.initiatingOrg.toLowerCase().includes(term)) ||
      (tx.type && tx.type.toLowerCase().includes(term));

    const matchesProductFilter = selectedProductFilter
      ? tx.productId === selectedProductFilter
      : true;

    return matchesSearch && matchesProductFilter;
  });

  return (
    <div className="space-y-6">
      {/* Search and Filter Controls */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Transaction ID, Product ID, or Organization..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={selectedProductFilter || ''}
              onChange={(e) => onFilterChange(e.target.value)}
              className="px-3 py-2 text-xs rounded-lg border border-slate-200 bg-slate-50 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            >
              <option value="">All Products History</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.id} ({p.name})
                </option>
              ))}
            </select>
          </div>

          <div className="text-xs text-slate-500 font-mono pl-3 border-l border-slate-200">
            Total Txs: <strong className="text-navy-900">{filteredTransactions.length}</strong>
          </div>
        </div>
      </div>

      {/* Real Blockchain Transactions Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-teal-600" />
            <h3 className="font-bold text-sm text-navy-900">Cryptographic Fabric Ledger Record</h3>
          </div>
          <span className="text-[11px] font-mono text-slate-500">Channel: supplychannel</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
              <tr>
                <th className="py-3 px-4 font-semibold">Transaction ID</th>
                <th className="py-3 px-4 font-semibold">Product ID</th>
                <th className="py-3 px-4 font-semibold">Type</th>
                <th className="py-3 px-4 font-semibold">Initiating Org</th>
                <th className="py-3 px-4 font-semibold">Timestamp (UTC)</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-400">
                    No blockchain transactions found. Perform an operation to commit a new block.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => (
                  <tr key={tx.txId} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-medium text-teal-700">
                      <div className="flex items-center gap-2">
                        <span>{tx.txId.substring(0, 12)}...{tx.txId.substring(tx.txId.length - 8)}</span>
                        <button
                          onClick={() => handleCopy(tx.txId)}
                          className="text-slate-400 hover:text-navy-900 p-0.5 rounded transition-colors"
                          title="Copy Full Transaction ID"
                        >
                          {copiedId === tx.txId ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-navy-900 block">{tx.productId}</span>
                      <span className="text-[11px] text-slate-500 truncate max-w-[140px] block">{tx.productName}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                        {tx.type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-mono text-slate-800 font-semibold">{tx.initiatingOrg}</span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600 text-[11px]">
                      {new Date(tx.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        <span>VALID (Committed)</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedTx(tx)}
                        className="px-2.5 py-1 rounded-lg border border-slate-200 text-[11px] font-medium text-slate-600 hover:text-navy-900 hover:bg-slate-100 transition-colors inline-flex items-center gap-1"
                      >
                        <FileText className="w-3 h-3" />
                        <span>Payload</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Raw Payload Modal */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-navy-900 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-mono text-teal-400 font-semibold">Ledger Commit Record</span>
                <h3 className="font-bold text-base">Transaction Details</h3>
              </div>
              <button 
                onClick={() => setSelectedTx(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="space-y-2">
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase block">Full Transaction Hash</span>
                  <p className="font-mono text-teal-800 bg-slate-50 p-2 rounded-lg border border-slate-200 break-all select-all">
                    {selectedTx.txId}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Product ID</span>
                    <span className="font-bold text-navy-900">{selectedTx.productId}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Initiator</span>
                    <span className="font-bold text-navy-900">{selectedTx.initiatingOrg}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Type</span>
                    <span className="font-medium text-slate-800">{selectedTx.type}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Committed Timestamp</span>
                    <span className="font-mono text-slate-800 text-[11px]">{new Date(selectedTx.timestamp).toLocaleString()}</span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase block mb-1">
                    State Payload Recorded in Ledger
                  </span>
                  <pre className="p-3.5 bg-navy-950 text-teal-300 rounded-lg overflow-x-auto font-mono text-[11px] max-h-56 leading-relaxed">
                    {JSON.stringify(selectedTx.details, null, 2)}
                  </pre>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedTx(null)}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-200/60 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
