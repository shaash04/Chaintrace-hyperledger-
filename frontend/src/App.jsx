import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { NetworkAlert } from './components/NetworkAlert';
import { LoginModal } from './components/LoginModal';
import { Dashboard } from './pages/Dashboard';
import { Products } from './pages/Products';
import { Tracking } from './pages/Tracking';
import { BlockchainHistory } from './pages/BlockchainHistory';
import { api } from './api';

function AppContent() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [products, setProducts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [networkStatus, setNetworkStatus] = useState({ connected: true });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);

  // Selected product state for cross-module navigation
  const [selectedProductIdForTracking, setSelectedProductIdForTracking] = useState('');
  const [selectedProductFilterForHistory, setSelectedProductFilterForHistory] = useState('');

  const loadData = async (showLoadingSpinner = false) => {
    try {
      if (showLoadingSpinner) setIsRefreshing(true);

      const [statusRes, prodRes, txRes] = await Promise.allSettled([
        api.getNetworkStatus(),
        api.getProducts(),
        api.getTransactions()
      ]);

      if (statusRes.status === 'fulfilled') {
        setNetworkStatus(statusRes.value.data || { connected: true });
      } else {
        setNetworkStatus({ connected: false, error: statusRes.reason?.message });
      }

      if (prodRes.status === 'fulfilled') {
        setProducts(prodRes.value.data || []);
      }

      if (txRes.status === 'fulfilled') {
        setTransactions(txRes.value.data || []);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData(false);
    const interval = setInterval(() => {
      loadData(false);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleNavigateToTracking = (productId) => {
    setSelectedProductIdForTracking(productId);
    setActiveTab('tracking');
  };

  const handleNavigateToHistory = (productId) => {
    setSelectedProductFilterForHistory(productId);
    setActiveTab('history');
  };

  const getPageTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'Supply Chain Dashboard';
      case 'products': return 'Product Asset Management';
      case 'tracking': return 'Supply Chain Tracking';
      case 'history': return 'Hyperledger Fabric Transaction History';
      default: return 'ChainTrace';
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* 4-item Sidebar */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        networkConnected={networkStatus?.connected} 
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <Header
          title={getPageTitle()}
          onOpenRoleModal={() => setIsRoleModalOpen(true)}
          networkStatus={networkStatus}
          onRefresh={() => loadData(true)}
          isRefreshing={isRefreshing}
        />

        {/* Network Alert (Only visible if Fabric is disconnected) */}
        <NetworkAlert networkStatus={networkStatus} />

        {/* Dynamic Page Views */}
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'dashboard' && (
              <Dashboard 
                products={products}
                transactions={transactions}
                networkStatus={networkStatus}
                onNavigateToProduct={(id) => { setActiveTab('products'); }}
                onNavigateToTracking={handleNavigateToTracking}
              />
            )}

            {activeTab === 'products' && (
              <Products 
                products={products}
                onRefresh={() => loadData(true)}
                onSelectForTracking={handleNavigateToTracking}
              />
            )}

            {activeTab === 'tracking' && (
              <Tracking 
                products={products}
                initialProductId={selectedProductIdForTracking}
                onRefresh={() => loadData(true)}
                onNavigateToHistory={handleNavigateToHistory}
              />
            )}

            {activeTab === 'history' && (
              <BlockchainHistory 
                transactions={transactions}
                products={products}
                selectedProductFilter={selectedProductFilterForHistory}
                onFilterChange={setSelectedProductFilterForHistory}
              />
            )}
          </div>
        </main>
      </div>

      {/* Role Selection Modal */}
      <LoginModal 
        isOpen={isRoleModalOpen} 
        onClose={() => setIsRoleModalOpen(false)} 
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
