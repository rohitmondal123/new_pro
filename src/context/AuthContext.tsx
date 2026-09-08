import React, { createContext, useContext, useState } from 'react';
import { UserRole } from '../types/mplads';

export interface UserProfile {
  id: string;
  name: string;
  designation: string;
  role: UserRole;
  state: string;
  district: string;
  constituency?: string;
  badge: string;
}

export const ROLE_PROFILES: Record<UserRole, UserProfile> = {
  MINISTRY_ADMIN: {
    id: 'USR-MIN-01',
    name: 'Dr. Vivek Swarup, IAS',
    designation: 'Joint Secretary & Director General (MPLADS)',
    role: 'MINISTRY_ADMIN',
    state: 'All States (National)',
    district: 'New Delhi HQ',
    badge: 'Ministry Admin',
  },
  STATE_AUTHORITY: {
    id: 'USR-ST-WB',
    name: 'Smt. Shreya Sen, IAS',
    designation: 'Principal Secretary, Planning & Development Dept',
    role: 'STATE_AUTHORITY',
    state: 'West Bengal',
    district: 'State Nodal Cell, Kolkata',
    badge: 'State Nodal Authority',
  },
  DISTRICT_AUTHORITY: {
    id: 'USR-DIST-BNK',
    name: 'Sri Rajesh Sharma, IAS',
    designation: 'District Magistrate & Collector, Bankura',
    role: 'DISTRICT_AUTHORITY',
    state: 'West Bengal',
    district: 'Bankura',
    constituency: 'Bankura',
    badge: 'District Authority',
  },
  MP_USER: {
    id: 'USR-MP-WB04',
    name: 'Smt. Arundhati Mukherjee',
    designation: 'Hon’ble Member of Parliament (Lok Sabha)',
    role: 'MP_USER',
    state: 'West Bengal',
    district: 'Bankura',
    constituency: 'Bankura (PC-36)',
    badge: 'MP User',
  },
  AUDITOR: {
    id: 'USR-AUD-CAG',
    name: 'Shri Amitabh Ghosh, IA&AS',
    designation: 'Senior Deputy Accountant General (Audit)',
    role: 'AUDITOR',
    state: 'National Audit Wing',
    district: 'CAG Regional Directorate',
    badge: 'Statutory Auditor',
  },
  INSPECTOR: {
    id: 'USR-INSP-09',
    name: 'Er. Tanmoy Roy',
    designation: 'Executive Engineer & Technical Vigilance Officer',
    role: 'INSPECTOR',
    state: 'West Bengal',
    district: 'Bankura Division',
    badge: 'Field Technical Inspector',
  },
};

export type ViewRoute =
  | 'dashboard'
  | 'projects'
  | 'project-detail'
  | 'queue'
  | 'reality'
  | 'cost-anomaly'
  | 'duplicates'
  | 'map'
  | 'predictions'
  | 'compliance'
  | 'data-quality'
  | 'ai-assistant'
  | 'ai-chart-bot'
  | 'audit'
  | 'analytics'
  | 'reports';

interface AuthContextType {
  currentUser: UserProfile;
  currentRole: UserRole;
  setRole: (role: UserRole) => void;
  activeRoute: ViewRoute;
  setActiveRoute: (route: ViewRoute) => void;
  selectedProjectId: string;
  setSelectedProjectId: (id: string) => void;
  openProjectDetail: (id: string) => void;
  isLoggedIn: boolean;
  login: (role: UserRole) => void;
  logout: () => void;
  notificationsOpen: boolean;
  setNotificationsOpen: (open: boolean) => void;
  globalSearch: string;
  setGlobalSearch: (q: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentRole, setCurrentRole] = useState<UserRole>('DISTRICT_AUTHORITY');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true);
  const [activeRoute, setActiveRoute] = useState<ViewRoute>('dashboard');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('MPL-1024');
  const [notificationsOpen, setNotificationsOpen] = useState<boolean>(false);
  const [globalSearch, setGlobalSearch] = useState<string>('');

  const currentUser = ROLE_PROFILES[currentRole];

  const setRole = (role: UserRole) => {
    setCurrentRole(role);
  };

  const login = (role: UserRole) => {
    setCurrentRole(role);
    setIsLoggedIn(true);
    setActiveRoute('dashboard');
  };

  const logout = () => {
    setIsLoggedIn(false);
  };

  const openProjectDetail = (id: string) => {
    setSelectedProjectId(id);
    setActiveRoute('project-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentRole,
        setRole,
        activeRoute,
        setActiveRoute,
        selectedProjectId,
        setSelectedProjectId,
        openProjectDetail,
        isLoggedIn,
        login,
        logout,
        notificationsOpen,
        setNotificationsOpen,
        globalSearch,
        setGlobalSearch,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
