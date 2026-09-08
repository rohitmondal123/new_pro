import React, { createContext, useContext, useState } from 'react';
import { UserRole } from '../types/mplads';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
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
    email: 'vivek.swarup@gov.in',
    designation: 'Joint Secretary & Director General (MPLADS)',
    role: 'MINISTRY_ADMIN',
    state: 'All States (National)',
    district: 'New Delhi HQ',
    badge: 'Ministry Admin',
  },
  STATE_AUTHORITY: {
    id: 'USR-ST-WB',
    name: 'Smt. Shreya Sen, IAS',
    email: 'shreya.sen@wb.gov.in',
    designation: 'Principal Secretary, Planning & Development Dept',
    role: 'STATE_AUTHORITY',
    state: 'West Bengal',
    district: 'State Nodal Cell, Kolkata',
    badge: 'State Nodal Authority',
  },
  DISTRICT_AUTHORITY: {
    id: 'USR-DIST-BNK',
    name: 'Sri Rajesh Sharma, IAS',
    email: 'dm.bankura@gov.in',
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
    email: 'arundhati.mp@sansad.nic.in',
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
    email: 'amitabh.cag@cag.gov.in',
    designation: 'Senior Deputy Accountant General (Audit)',
    role: 'AUDITOR',
    state: 'National Audit Wing',
    district: 'CAG Regional Directorate',
    badge: 'Statutory Auditor',
  },
  INSPECTOR: {
    id: 'USR-INSP-09',
    name: 'Er. Tanmoy Roy',
    email: 'tanmoy.roy@pwd.wb.gov.in',
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

export interface LoginCredentials {
  email?: string;
  password?: string;
  role?: UserRole;
}

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
  login: (credentials?: LoginCredentials | UserRole) => void;
  logout: () => void;
  notificationsOpen: boolean;
  setNotificationsOpen: (open: boolean) => void;
  globalSearch: string;
  setGlobalSearch: (q: string) => void;
  triggerRiskAlert: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentRole, setCurrentRole] = useState<UserRole>('DISTRICT_AUTHORITY');
  const [customUser, setCustomUser] = useState<UserProfile | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true);
  const [activeRoute, setActiveRoute] = useState<ViewRoute>('dashboard');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('MPL-1024');
  const [notificationsOpen, setNotificationsOpen] = useState<boolean>(false);
  const [globalSearch, setGlobalSearch] = useState<string>('');

  const currentUser = customUser || ROLE_PROFILES[currentRole];

  const setRole = (role: UserRole) => {
    setCurrentRole(role);
    setCustomUser(null);
  };

  const login = (credentials?: LoginCredentials | UserRole) => {
    if (!credentials) {
      setCurrentRole('DISTRICT_AUTHORITY');
      setCustomUser(null);
      setIsLoggedIn(true);
      setActiveRoute('dashboard');
      return;
    }

    if (typeof credentials === 'string') {
      setCurrentRole(credentials as UserRole);
      setCustomUser(null);
      setIsLoggedIn(true);
      setActiveRoute('dashboard');
      return;
    }

    const { email, role } = credentials;

    // Check if email corresponds to one of the known profiles
    if (email) {
      const lower = email.toLowerCase().trim();
      const matchedRole = (Object.keys(ROLE_PROFILES) as UserRole[]).find((r) =>
        ROLE_PROFILES[r].email.toLowerCase() === lower
      );

      if (matchedRole) {
        setCurrentRole(matchedRole);
        setCustomUser(null);
      } else {
        // Assign a personalized profile with their email
        const username = email.split('@')[0].replace(/[._-]/g, ' ');
        const formattedName = username
          .split(' ')
          .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
          .join(' ');

        setCurrentRole(role || 'DISTRICT_AUTHORITY');
        setCustomUser({
          id: `USR-AUTH-${Date.now().toString().slice(-4)}`,
          name: formattedName || 'Authorized Officer',
          email: email,
          designation: 'Designated Government Official',
          role: role || 'DISTRICT_AUTHORITY',
          state: 'West Bengal',
          district: 'Bankura',
          constituency: 'Bankura',
          badge: 'Verified Officer',
        });
      }
    } else if (role) {
      setCurrentRole(role);
      setCustomUser(null);
    }

    setIsLoggedIn(true);
    setActiveRoute('dashboard');
  };

  const logout = () => {
    setIsLoggedIn(false);
  };

  const triggerRiskAlert = () => {
    window.dispatchEvent(new CustomEvent('mplads-trigger-high-risk-alert'));
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
