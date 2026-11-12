import React, { createContext, useContext, useState, useEffect } from 'react';

const ROLES = {
  Manufacturer: {
    id: 'Manufacturer',
    name: 'Apex Manufacturing Corp',
    msp: 'Org1MSP',
    orgName: 'Org1 (Production & Manufacturing)',
    color: 'emerald',
    description: 'Can register new products and initiate initial dispatch to distributor.',
    canRegister: true,
    canTransferToDistributor: true,
    canReceiveAtDistributor: false,
    canTransferToRetailer: false,
    canConfirmDelivery: false,
  },
  Distributor: {
    id: 'Distributor',
    name: 'Logistics Express Hub',
    msp: 'Org1MSP',
    orgName: 'Org1/Org2 Logistics Partner',
    color: 'blue',
    description: 'Receives products at warehouse, updates transit locations, and dispatches to retailers.',
    canRegister: false,
    canTransferToDistributor: false,
    canReceiveAtDistributor: true,
    canTransferToRetailer: true,
    canConfirmDelivery: false,
  },
  Retailer: {
    id: 'Retailer',
    name: 'Metro Retail Stores',
    msp: 'Org2MSP',
    orgName: 'Org2 (Retail Outlet Network)',
    color: 'purple',
    description: 'Receives products from distributor, validates integrity, and confirms final delivery.',
    canRegister: false,
    canTransferToDistributor: false,
    canReceiveAtDistributor: false,
    canTransferToRetailer: false,
    canConfirmDelivery: true,
  },
};

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentRole, setCurrentRole] = useState(() => {
    return localStorage.getItem('chaintrace_role') || 'Manufacturer';
  });

  const selectRole = (roleKey) => {
    if (ROLES[roleKey]) {
      setCurrentRole(roleKey);
      localStorage.setItem('chaintrace_role', roleKey);
    }
  };

  const user = ROLES[currentRole];

  return (
    <AuthContext.Provider value={{ currentRole, selectRole, user, allRoles: ROLES }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
