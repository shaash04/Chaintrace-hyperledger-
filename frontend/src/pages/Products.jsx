import React, { useState } from 'react';
import { 
  Package, 
  Plus, 
  Search, 
  Eye, 
  ArrowRight, 
  Calendar, 
  MapPin, 
  Building2, 
  Tag, 
  ShieldAlert, 
  CheckCircle2, 
  X,
  Loader2,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';

export const Products = ({ products, onRefresh, onSelectForTracking }) => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState(null);

  // New product form state
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    description: '',
    manufacturer: user.id === 'Manufacturer' ? user.name : '',
    batchNumber: '',
    manufacturingDate: new Date().toISOString().split('T')[0],
    origin: '',
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    if (user.id !== 'Manufacturer') {
      setNotification({
        type: 'error',
        message: 'Access Denied: Only Manufacturer can register new products on the blockchain.'
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await api.createProduct(user.id, formData);
      setNotification({
        type: 'success',
        message: `Product ${formData.id} successfully minted on Hyperledger Fabric ledger!`
      });
      setIsModalOpen(false);
      setFormData({
        id: '',
        name: '',
        description: '',
        manufacturer: user.name,
        batchNumber: '',
        manufacturingDate: new Date().toISOString().split('T')[0],
        origin: '',
      });
      onRefresh();
    } catch (err) {
      setNotification({
        type: 'error',
        message: err.message || 'Failed to register product on blockchain'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredProducts = products.filter((p) => {
    const term = searchTerm.toLowerCase();
    return (
      (p.id && p.id.toLowerCase().includes(term)) ||
      (p.name && p.name.toLowerCase().includes(term)) ||
      (p.manufacturer && p.manufacturer.toLowerCase().includes(term)) ||
      (p.batchNumber && p.batchNumber.toLowerCase().includes(term))
    );
  });

  const getStatusBadge = (status) => {
    const s = (status || '').toLowerCase();
    if (s.includes('delivered')) {
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
    if (s.includes('transit')) {
      return 'bg-amber-50 text-amber-700 border-amber-200';
    }
    if (s.includes('received')) {
      return 'bg-blue-50 text-blue-700 border-blue-200';
    }
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

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

      {/* Action Header: Search & Register Button */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search products by ID, Name, or Batch Number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-3">
          {user.id !== 'Manufacturer' && (
            <span className="text-[11px] text-slate-400 italic hidden md:inline">
              (Registration disabled: Active role is {user.id})
            </span>
          )}
          <button
            onClick={() => {
              if (user.id !== 'Manufacturer') {
                setNotification({
                  type: 'error',
                  message: `Role Restricted: Only Manufacturer (Org1MSP) can register products. You are currently logged in as ${user.id}.`
                });
                return;
              }
              setIsModalOpen(true);
            }}
            disabled={user.id !== 'Manufacturer'}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-teal-500 text-white text-xs font-semibold hover:bg-teal-600 transition-colors shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" />
            <span>Register New Product</span>
          </button>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-sm text-navy-900">Registered Ledger Products</h3>
          <span className="text-xs text-slate-500 font-mono">Total: {filteredProducts.length}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
              <tr>
                <th className="py-3 px-4 font-semibold">Product ID</th>
                <th className="py-3 px-4 font-semibold">Name & Details</th>
                <th className="py-3 px-4 font-semibold">Manufacturer</th>
                <th className="py-3 px-4 font-semibold">Batch No.</th>
                <th className="py-3 px-4 font-semibold">Current Owner</th>
                <th className="py-3 px-4 font-semibold">Location</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-slate-400">
                    No products found matching your search.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-teal-700">
                      {p.id}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-navy-900 block">{p.name}</span>
                      <span className="text-[11px] text-slate-500 line-clamp-1">{p.description}</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 font-medium">
                      {p.manufacturer}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">
                      {p.batchNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-medium text-slate-800 block">{p.owner}</span>
                      <span className="text-[10px] text-teal-600 font-medium">{p.ownerRole || 'Participant'}</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{p.location}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold border ${getStatusBadge(p.status)}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => setSelectedProduct(p)}
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-navy-900 hover:bg-slate-100 transition-colors"
                        title="View Full Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onSelectForTracking(p.id)}
                        className="px-2.5 py-1 rounded-lg bg-navy-900 text-white font-medium hover:bg-navy-800 transition-colors inline-flex items-center gap-1 text-[11px]"
                        title="Track in Supply Chain"
                      >
                        <span>Track</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Details Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-navy-900 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-teal-400 font-semibold font-mono">Hyperledger Fabric State</span>
                <h3 className="font-bold text-base">{selectedProduct.name} ({selectedProduct.id})</h3>
              </div>
              <button 
                onClick={() => setSelectedProduct(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <p className="text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                {selectedProduct.description}
              </p>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase block mb-1">Manufacturer</span>
                  <span className="font-bold text-navy-900 text-xs">{selectedProduct.manufacturer}</span>
                  <span className="text-[10px] text-teal-600 block">{selectedProduct.ownerMsp || 'Org1MSP'}</span>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase block mb-1">Batch Number</span>
                  <span className="font-mono font-bold text-navy-900 text-xs">{selectedProduct.batchNumber}</span>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase block mb-1">Manufacturing Date</span>
                  <span className="font-mono text-slate-800 text-xs">{selectedProduct.manufacturingDate}</span>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase block mb-1">Origin Facility</span>
                  <span className="font-medium text-slate-800 text-xs">{selectedProduct.origin}</span>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase block mb-1">Current Owner</span>
                  <span className="font-bold text-navy-900 text-xs">{selectedProduct.owner}</span>
                  <span className="text-[10px] text-slate-500 block">Stage: {selectedProduct.stage || 'Manufacturer'}</span>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase block mb-1">Current Location</span>
                  <span className="font-medium text-slate-800 text-xs">{selectedProduct.location}</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase block">Product Status</span>
                  <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${getStatusBadge(selectedProduct.status)}`}>
                    {selectedProduct.status}
                  </span>
                </div>
                <div className="text-right text-[11px] text-slate-400">
                  <span>Last Ledger Update:</span>
                  <span className="block font-mono text-slate-600">{new Date(selectedProduct.updatedAt).toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => {
                  const id = selectedProduct.id;
                  setSelectedProduct(null);
                  onSelectForTracking(id);
                }}
                className="px-4 py-2 rounded-lg bg-teal-500 text-white font-semibold hover:bg-teal-600 transition-colors inline-flex items-center gap-1.5"
              >
                <span>Track Supply Chain</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setSelectedProduct(null)}
                className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-200/60 font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Product Registration Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-navy-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">Register New Product</h3>
                <p className="text-xs text-slate-300">Invokes Chaincode: <code>CreateProduct()</code> on Fabric</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Product ID *</label>
                  <input
                    type="text"
                    name="id"
                    required
                    placeholder="e.g. PROD-102"
                    value={formData.id}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-mono uppercase"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Batch Number *</label>
                  <input
                    type="text"
                    name="batchNumber"
                    required
                    placeholder="e.g. BATCH-2026-X1"
                    value={formData.batchNumber}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Product Name *</label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="e.g. Smart Energy Inverter 10kVA"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description *</label>
                <textarea
                  name="description"
                  required
                  rows="2"
                  placeholder="Detailed specifications, storage requirements, or certification data..."
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Manufacturer *</label>
                  <input
                    type="text"
                    name="manufacturer"
                    required
                    placeholder="e.g. Apex Manufacturing Corp"
                    value={formData.manufacturer}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Manufacturing Date *</label>
                  <input
                    type="date"
                    name="manufacturingDate"
                    required
                    value={formData.manufacturingDate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Origin Facility / Location *</label>
                <input
                  type="text"
                  name="origin"
                  required
                  placeholder="e.g. Pune Manufacturing Facility, Plant 2"
                  value={formData.origin}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>

              <div className="p-3 bg-teal-50 rounded-lg border border-teal-200/60 text-[11px] text-teal-900 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <span>
                  This action will commit a cryptographically signed transaction proposal to Fabric Orderer using Org1MSP credentials.
                </span>
              </div>

              <div className="pt-2 flex justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-lg bg-teal-500 text-white font-semibold hover:bg-teal-600 transition-colors shadow-sm inline-flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Committing to Fabric...</span>
                    </>
                  ) : (
                    <span>Mint & Commit to Ledger</span>
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
