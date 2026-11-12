import React from 'react';
import { 
  Package, 
  Truck, 
  CheckCircle2, 
  Layers, 
  ArrowUpRight, 
  Clock, 
  ShieldCheck, 
  ExternalLink,
  Activity
} from 'lucide-react';

export const Dashboard = ({ products, transactions, networkStatus, onNavigateToProduct, onNavigateToTracking }) => {
  const totalProducts = products.length;
  const inTransitProducts = products.filter(p => p.status && p.status.toLowerCase().includes('transit')).length;
  const deliveredProducts = products.filter(p => p.stage === 'Delivered' || (p.status && p.status.toLowerCase().includes('delivered'))).length;
  const manufacturedProducts = products.filter(p => p.status === 'Manufactured').length;

  const stats = [
    {
      label: 'Registered Products',
      value: totalProducts,
      sub: 'Stored on Fabric Ledger',
      icon: Package,
      color: 'bg-blue-50 text-blue-700 border-blue-200'
    },
    {
      label: 'Products in Transit',
      value: inTransitProducts,
      sub: 'Moving along Supply Chain',
      icon: Truck,
      color: 'bg-amber-50 text-amber-700 border-amber-200'
    },
    {
      label: 'Products Delivered',
      value: deliveredProducts,
      sub: 'Retail Verification Complete',
      icon: CheckCircle2,
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200'
    },
    {
      label: 'Blockchain Transactions',
      value: transactions.length,
      sub: 'Real Fabric Tx IDs',
      icon: Layers,
      color: 'bg-teal-50 text-teal-700 border-teal-200'
    }
  ];

  // Calculate percentage breakdown
  const transitPct = totalProducts ? Math.round((inTransitProducts / totalProducts) * 100) : 0;
  const deliveredPct = totalProducts ? Math.round((deliveredProducts / totalProducts) * 100) : 0;
  const manufacturedPct = totalProducts ? Math.round((manufacturedProducts / totalProducts) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Top Essential Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, idx) => {
          const Icon = s.icon;
          return (
            <div key={idx} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{s.label}</span>
                <div className={`p-2 rounded-lg border ${s.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl font-extrabold text-navy-900 tracking-tight mb-1">
                {s.value}
              </div>
              <p className="text-xs text-slate-500">{s.sub}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status Distribution Summary */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-sm text-navy-900 flex items-center gap-2">
                <Activity className="w-4 h-4 text-teal-600" />
                Product Status Distribution
              </h3>
              <span className="text-xs text-slate-400 font-medium">Supply Channel</span>
            </div>

            {/* Simple Visual Progress Bar Chart */}
            <div className="space-y-4 my-6">
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="font-medium text-slate-600">Manufactured (At Factory)</span>
                  <span className="font-bold text-slate-800">{manufacturedProducts} ({manufacturedPct}%)</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full transition-all duration-500" style={{ width: `${manufacturedPct}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="font-medium text-slate-600">In Transit (Distributor / Logistics)</span>
                  <span className="font-bold text-slate-800">{inTransitProducts} ({transitPct}%)</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full transition-all duration-500" style={{ width: `${transitPct}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="font-medium text-slate-600">Delivered (At Retailer)</span>
                  <span className="font-bold text-slate-800">{deliveredProducts} ({deliveredPct}%)</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-600 rounded-full transition-all duration-500" style={{ width: `${deliveredPct}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Network details card */}
          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600 space-y-1.5">
            <div className="flex justify-between font-medium">
              <span className="text-slate-500">Fabric Channel:</span>
              <span className="font-mono text-navy-900 font-semibold">{networkStatus?.channel || 'supplychannel'}</span>
            </div>
            <div className="flex justify-between font-medium">
              <span className="text-slate-500">Chaincode:</span>
              <span className="font-mono text-navy-900 font-semibold">{networkStatus?.chaincode || 'supplychain'}</span>
            </div>
            <div className="flex justify-between font-medium">
              <span className="text-slate-500">Endorsers:</span>
              <span className="text-teal-700 font-semibold">peer0.org1 + peer0.org2</span>
            </div>
          </div>
        </div>

        {/* Recent Supply Chain Activities Table */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm text-navy-900">Recent Supply Chain Activities</h3>
              <p className="text-xs text-slate-500">Actual ledger transaction commits returned from Fabric peers</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-y border-slate-200 text-slate-600">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">Transaction ID</th>
                  <th className="py-2.5 px-3 font-semibold">Product</th>
                  <th className="py-2.5 px-3 font-semibold">Type</th>
                  <th className="py-2.5 px-3 font-semibold">Location / Owner</th>
                  <th className="py-2.5 px-3 font-semibold">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-6 text-center text-slate-400">
                      No blockchain transactions recorded yet. Register a product to begin.
                    </td>
                  </tr>
                ) : (
                  transactions.slice(0, 6).map((tx) => (
                    <tr key={tx.txId} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3 font-mono font-medium text-teal-700">
                        {tx.txId.substring(0, 10)}...{tx.txId.substring(tx.txId.length - 6)}
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-bold text-navy-900">{tx.productId}</span>
                        <span className="block text-[11px] text-slate-500 truncate max-w-[140px]">{tx.productName}</span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                          {tx.type}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-medium text-slate-800">{tx.location}</span>
                        <span className="block text-[11px] text-slate-400">{tx.owner}</span>
                      </td>
                      <td className="py-3 px-3 text-slate-500 font-mono text-[11px]">
                        {new Date(tx.timestamp).toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
