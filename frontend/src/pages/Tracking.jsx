import React, { useState, useEffect } from 'react';
import { 
  GitFork, 
  Search, 
  Building2, 
  Truck, 
  Store, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  ArrowRight, 
  ShieldCheck, 
  ShieldAlert, 
  Loader2, 
  X,
  History,
  RotateCcw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';

export const Tracking = ({ products, initialProductId, onRefresh, onNavigateToHistory }) => {
  const { user } = useAuth();
  const [selectedProductId, setSelectedProductId] = useState(initialProductId || (products[0] ? products[0].id : ''));
  const [productHistory, setProductHistory] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  // Transfer action modal state
  const [actionType, setActionType] = useState(null); // 'transfer_to_distributor' | 'receive_at_distributor' | 'transfer_to_retailer' | 'confirm_delivery' | 'update_location'
  const [actionForm, setActionForm] = useState({
    newOwner: '',
    newLocation: '',
    newStatus: '',
  });

  const selectedProduct = products.find(p => p.id === selectedProductId);

  // Sync initial product selection
  useEffect(() => {
    if (initialProductId) {
      setSelectedProductId(initialProductId);
    } else if (!selectedProductId && products.length > 0) {
      setSelectedProductId(products[0].id);
    }
  }, [initialProductId, products]);

  // Load product history when selection changes
  useEffect(() => {
    if (selectedProductId) {
      loadHistory(selectedProductId);
    }
  }, [selectedProductId]);

  const loadHistory = async (id) => {
    try {
      setIsLoadingHistory(true);
      const res = await api.getProductHistory(id);
      setProductHistory(res.data || []);
    } catch (err) {
      console.error('Failed to load product history:', err);
      setProductHistory([]);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleOpenAction = (type, defaultOwner = '', defaultLoc = '', defaultStatus = '') => {
    setActionType(type);
    setActionForm({
      newOwner: defaultOwner,
      newLocation: defaultLoc,
      newStatus: defaultStatus,
    });
  };

  const executeAction = async (e) => {
    e.preventDefault();
    if (!selectedProduct) return;

    try {
      setIsActionLoading(true);

      if (actionType === 'update_location') {
        await api.updateLocation(user.id, selectedProduct.id, actionForm.newLocation);
        setNotification({
          type: 'success',
          message: `Location for ${selectedProduct.id} updated on Fabric ledger to "${actionForm.newLocation}".`
        });
      } else {
        await api.transferProduct(user.id, selectedProduct.id, actionForm);
        setNotification({
          type: 'success',
          message: `Supply chain transaction for ${selectedProduct.id} successfully committed to Hyperledger Fabric!`
        });
      }

      setActionType(null);
      await onRefresh();
      await loadHistory(selectedProduct.id);
    } catch (err) {
      setNotification({
        type: 'error',
        message: err.message || 'Supply chain action failed on Fabric ledger'
      });
    } finally {
      setIsActionLoading(false);
    }
  };

  // Determine stage progress
  const getStageNumber = (product) => {
    if (!product) return 1;
    const stage = product.stage || 'Manufacturer';
    const status = (product.status || '').toLowerCase();

    if (stage === 'Delivered' || status.includes('delivered')) return 3;
    if (stage === 'Retailer' || status.includes('retailer')) return 3;
    if (stage === 'Distributor' || status.includes('distributor')) return 2;
    return 1;
  };

  const currentStageNum = getStageNumber(selectedProduct);

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div className={`p-4 rounded-xl border flex items-center justify-between text-xs font-medium animate-in fade-in duration-200 ${
          notification.type === 'success' 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
            : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          <div className="flex items-center gap-2.5">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Product Selector Bar */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider shrink-0">
            Select Tracked Item:
          </label>
          <select
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
            className="px-3.5 py-2 text-xs rounded-lg border border-slate-200 bg-slate-50 font-semibold text-navy-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 min-w-[240px]"
          >
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.id} - {p.name} ({p.status})
              </option>
            ))}
          </select>
        </div>

        {selectedProduct && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleOpenAction('update_location', selectedProduct.owner, '', selectedProduct.status)}
              className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors inline-flex items-center gap-1.5"
            >
              <MapPin className="w-3.5 h-3.5 text-slate-500" />
              <span>Update Waypoint / Location</span>
            </button>
            <button
              onClick={() => onNavigateToHistory(selectedProduct.id)}
              className="px-3.5 py-1.5 rounded-lg bg-slate-100 text-navy-900 text-xs font-semibold hover:bg-slate-200 transition-colors inline-flex items-center gap-1.5"
            >
              <History className="w-3.5 h-3.5 text-teal-600" />
              <span>View Full History ({productHistory.length})</span>
            </button>
          </div>
        )}
      </div>

      {!selectedProduct ? (
        <div className="bg-white p-12 rounded-xl border border-slate-200 text-center text-slate-400">
          <GitFork className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No products available to track. Please register a product first.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Main Visual Tracking Timeline Card */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-8 border-b border-slate-100 gap-2">
              <div>
                <span className="text-[11px] font-mono font-bold text-teal-600">{selectedProduct.id}</span>
                <h3 className="text-lg font-extrabold text-navy-900">{selectedProduct.name}</h3>
                <p className="text-xs text-slate-500">{selectedProduct.description}</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-semibold text-slate-400 uppercase block">Current Status</span>
                <span className="inline-block mt-0.5 px-3 py-1 rounded-full text-xs font-bold bg-teal-50 text-teal-800 border border-teal-200">
                  {selectedProduct.status}
                </span>
              </div>
            </div>

            {/* 3-Stage Supply Chain Timeline Diagram */}
            <div className="relative px-4 sm:px-12 py-6">
              {/* Connecting Line */}
              <div className="absolute top-1/2 left-12 right-12 -translate-y-1/2 h-1.5 bg-slate-100 -z-0">
                <div 
                  className="h-full bg-teal-500 transition-all duration-700 rounded-full"
                  style={{ 
                    width: currentStageNum === 1 ? '15%' : currentStageNum === 2 ? '50%' : '100%' 
                  }}
                />
              </div>

              {/* 3 Nodes */}
              <div className="relative z-10 flex justify-between">
                {/* Node 1: Manufacturer */}
                <div className="flex flex-col items-center text-center max-w-[140px]">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center border-2 transition-all shadow-sm ${
                    currentStageNum >= 1
                      ? 'bg-teal-500 text-white border-teal-600 ring-4 ring-teal-500/10'
                      : 'bg-white text-slate-400 border-slate-200'
                  }`}>
                    <Building2 className="w-5 h-5" />
                  </div>
                  <h4 className="mt-3 font-bold text-xs text-navy-900">1. Manufacturer</h4>
                  <p className="text-[11px] text-slate-500 font-medium truncate max-w-[120px]">{selectedProduct.manufacturer}</p>
                  <span className="mt-1 text-[10px] font-mono text-slate-400">{selectedProduct.origin}</span>
                </div>

                {/* Node 2: Distributor */}
                <div className="flex flex-col items-center text-center max-w-[140px]">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center border-2 transition-all shadow-sm ${
                    currentStageNum >= 2
                      ? 'bg-teal-500 text-white border-teal-600 ring-4 ring-teal-500/10'
                      : 'bg-white text-slate-400 border-slate-200'
                  }`}>
                    <Truck className="w-5 h-5" />
                  </div>
                  <h4 className="mt-3 font-bold text-xs text-navy-900">2. Distributor</h4>
                  <p className="text-[11px] text-slate-500 font-medium truncate max-w-[120px]">
                    {currentStageNum >= 2 ? (selectedProduct.ownerRole === 'Distributor' ? selectedProduct.owner : 'Logistics Partner') : 'Pending Dispatch'}
                  </p>
                  <span className="mt-1 text-[10px] font-mono text-slate-400">
                    {currentStageNum >= 2 ? selectedProduct.location : 'Transit Depot'}
                  </span>
                </div>

                {/* Node 3: Retailer */}
                <div className="flex flex-col items-center text-center max-w-[140px]">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center border-2 transition-all shadow-sm ${
                    currentStageNum >= 3
                      ? 'bg-emerald-600 text-white border-emerald-700 ring-4 ring-emerald-500/10'
                      : 'bg-white text-slate-400 border-slate-200'
                  }`}>
                    <Store className="w-5 h-5" />
                  </div>
                  <h4 className="mt-3 font-bold text-xs text-navy-900">3. Retailer</h4>
                  <p className="text-[11px] text-slate-500 font-medium truncate max-w-[120px]">
                    {currentStageNum >= 3 ? selectedProduct.owner : 'Pending Delivery'}
                  </p>
                  <span className="mt-1 text-[10px] font-mono text-slate-400">
                    {currentStageNum >= 3 ? selectedProduct.status : 'Store Destination'}
                  </span>
                </div>
              </div>
            </div>

            {/* Stage Transition Action Bar */}
            <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-slate-50 p-4 rounded-xl">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Available Operation (Based on Current Role: {user.id})
                </span>
                <p className="text-xs text-slate-700 font-medium mt-0.5">
                  {selectedProduct.stage === 'Delivered' ? (
                    'Product lifecycle complete. All supply chain milestones verified on Fabric.'
                  ) : selectedProduct.stage === 'Manufacturer' ? (
                    'Product is with Manufacturer. Ready for dispatch to Distributor.'
                  ) : selectedProduct.stage === 'Distributor' ? (
                    selectedProduct.status === 'In Transit to Distributor'
                      ? 'Product dispatched. Distributor must confirm receipt.'
                      : 'Product at warehouse. Ready for dispatch to Retailer.'
                  ) : (
                    'Product dispatched to Retailer. Retailer must confirm delivery.'
                  )}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {/* Stage 1 Action: Manufacturer Dispatches to Distributor */}
                {selectedProduct.stage === 'Manufacturer' && (
                  <button
                    onClick={() => handleOpenAction(
                      'transfer_to_distributor',
                      'Logistics Express Hub',
                      'Central Distribution Hub, Nagpur',
                      'In Transit to Distributor'
                    )}
                    disabled={user.id !== 'Manufacturer'}
                    className="px-4 py-2 rounded-lg bg-teal-500 text-white text-xs font-semibold hover:bg-teal-600 transition-colors shadow-sm inline-flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <span>Dispatch to Distributor</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}

                {/* Stage 2 Action A: Distributor Receives Product */}
                {selectedProduct.stage === 'Distributor' && selectedProduct.status === 'In Transit to Distributor' && (
                  <button
                    onClick={() => handleOpenAction(
                      'receive_at_distributor',
                      user.id === 'Distributor' ? user.name : 'Logistics Express Hub',
                      'Central Distribution Hub Warehouse',
                      'Received by Distributor'
                    )}
                    disabled={user.id !== 'Distributor'}
                    className="px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors shadow-sm inline-flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Distributor: Confirm Receipt</span>
                  </button>
                )}

                {/* Stage 2 Action B: Distributor Dispatches to Retailer */}
                {selectedProduct.stage === 'Distributor' && selectedProduct.status !== 'In Transit to Distributor' && (
                  <button
                    onClick={() => handleOpenAction(
                      'transfer_to_retailer',
                      'Metro Superstore Outlet',
                      'Indore City Mall, Store #4',
                      'In Transit to Retailer'
                    )}
                    disabled={user.id !== 'Distributor'}
                    className="px-4 py-2 rounded-lg bg-teal-500 text-white text-xs font-semibold hover:bg-teal-600 transition-colors shadow-sm inline-flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <span>Dispatch to Retailer</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}

                {/* Stage 3 Action: Retailer Confirms Receipt */}
                {selectedProduct.stage === 'Retailer' && (
                  <button
                    onClick={() => handleOpenAction(
                      'confirm_delivery',
                      user.id === 'Retailer' ? user.name : 'Metro Superstore Outlet',
                      'Indore City Mall, Store #4',
                      'Delivered'
                    )}
                    disabled={user.id !== 'Retailer'}
                    className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors shadow-sm inline-flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Retailer: Confirm Delivery</span>
                  </button>
                )}

                {/* Stage Delivered: Finished */}
                {selectedProduct.stage === 'Delivered' && (
                  <span className="px-3.5 py-1.5 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold inline-flex items-center gap-1.5 border border-emerald-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Delivery Verified</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Audit Trail Timeline List from Fabric */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-sm text-navy-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-teal-600" />
                Ledger Transaction Milestone Trail
              </h3>
              <span className="text-xs text-slate-500 font-mono">
                {productHistory.length} ledger states recorded
              </span>
            </div>

            {isLoadingHistory ? (
              <div className="py-8 text-center text-slate-400">
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-teal-600" />
                <span className="text-xs">Querying Fabric Ledger for cryptographic history...</span>
              </div>
            ) : productHistory.length === 0 ? (
              <p className="text-xs text-slate-400 py-4">No transaction history recorded yet for this item.</p>
            ) : (
              <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {productHistory.map((item, idx) => (
                  <div key={item.txId || idx} className="relative">
                    {/* Timeline dot */}
                    <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-teal-500 ring-4 ring-white border border-teal-600" />
                    
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 mb-2 border-b border-slate-200/60 gap-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-navy-900">
                            {item.value?.status || 'State Updated'}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-white border border-slate-200 text-slate-600">
                            Stage: {item.value?.stage || 'Unknown'}
                          </span>
                        </div>
                        <span className="font-mono text-[11px] text-slate-500">
                          {new Date(item.timestamp).toLocaleString()}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-slate-600">
                        <div>
                          <span className="text-slate-400 block">Owner / Custodian:</span>
                          <span className="font-semibold text-slate-800">{item.value?.owner || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block">Location:</span>
                          <span className="font-semibold text-slate-800">{item.value?.location || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block">Fabric Tx ID:</span>
                          <span className="font-mono text-teal-700 font-semibold truncate block">
                            {item.txId}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action Execution Modal */}
      {actionType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-navy-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">
                  {actionType === 'update_location' ? 'Update Physical Location' : 'Transfer Product Custody'}
                </h3>
                <p className="text-xs text-slate-300">
                  Invokes: <code>{actionType === 'update_location' ? 'UpdateLocation()' : 'TransferProduct()'}</code>
                </p>
              </div>
              <button 
                onClick={() => setActionType(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={executeAction} className="p-6 space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Product</span>
                  <p className="font-bold text-navy-900">{selectedProduct.name} ({selectedProduct.id})</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Active Role</span>
                  <p className="font-semibold text-teal-700">{user.id}</p>
                </div>
              </div>

              {actionType !== 'update_location' && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">New Owner / Custodian *</label>
                  <input
                    type="text"
                    required
                    value={actionForm.newOwner}
                    onChange={(e) => setActionForm({ ...actionForm, newOwner: e.target.value })}
                    placeholder="e.g. Logistics Express / Metro Retail"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {actionType === 'update_location' ? 'New Current Location *' : 'Dispatch / Destination Location *'}
                </label>
                <input
                  type="text"
                  required
                  value={actionForm.newLocation}
                  onChange={(e) => setActionForm({ ...actionForm, newLocation: e.target.value })}
                  placeholder="e.g. Central Warehouse, Nagpur / Store #4, Indore"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>

              {actionType !== 'update_location' && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">New Lifecycle Status *</label>
                  <input
                    type="text"
                    required
                    value={actionForm.newStatus}
                    onChange={(e) => setActionForm({ ...actionForm, newStatus: e.target.value })}
                    placeholder="e.g. In Transit to Distributor / Delivered"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                </div>
              )}

              <div className="p-3 bg-teal-50 rounded-lg border border-teal-200/60 text-[11px] text-teal-900 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <span>
                  This transaction will be signed with <strong>{user.msp}</strong> and committed to block on <strong>supplychannel</strong>.
                </span>
              </div>

              <div className="pt-2 flex justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActionType(null)}
                  disabled={isActionLoading}
                  className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isActionLoading}
                  className="px-5 py-2 rounded-lg bg-teal-500 text-white font-semibold hover:bg-teal-600 transition-colors shadow-sm inline-flex items-center gap-2 disabled:opacity-50"
                >
                  {isActionLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Committing...</span>
                    </>
                  ) : (
                    <span>Sign & Commit Transaction</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
