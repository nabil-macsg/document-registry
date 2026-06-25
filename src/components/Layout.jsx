import { createContext, useEffect, useMemo, useState } from 'react';
import {
  Check,
  ChevronDown,
  FolderOpen,
  LogOut,
  Search,
  Settings,
  UserRound,
} from 'lucide-react';
import taqaLogo from '../assets/taqa_logo.png';
import macsgLogo from '../assets/macsg_logo.png';

export const AccessContext = createContext({
  role: 'Admin',
  permissions: {
    canSearch: true,
    canViewRepository: true,
    canManageRepository: true,
    canDeleteDocuments: true,
    canAccessSettings: true,
  },
});

const roles = [
  {
    name: 'Admin',
    desc: 'Full access to search, repository and settings.',
    color: '#D98E04',
    permissions: {
      canSearch: true,
      canViewRepository: true,
      canManageRepository: true,
      canDeleteDocuments: true,
      canAccessSettings: true,
    },
  },
  {
    name: 'Document Manager',
    desc: 'Can search and manage the repository.',
    color: '#3F7A5C',
    permissions: {
      canSearch: true,
      canViewRepository: true,
      canManageRepository: true,
      canDeleteDocuments: true,
      canAccessSettings: false,
    },
  },
  {
    name: 'Document Viewer',
    desc: 'Search and view access only.',
    color: '#5B6B82',
    permissions: {
      canSearch: true,
      canViewRepository: true,
      canManageRepository: false,
      canDeleteDocuments: false,
      canAccessSettings: false,
    },
  },
];

export default function Layout({
  activePage,
  setActivePage,
  children,
  currentUser,
  onLogout,
}) {
  const [role, setRole] = useState(() => localStorage.getItem('ledgerRole') || 'Admin');
  const [roleOpen, setRoleOpen] = useState(false);

  const currentRole = roles.find((r) => r.name === role) || roles[0];

  const items = useMemo(() => {
    const baseItems = [
      {
        key: 'search',
        label: 'Search',
        icon: Search,
        allowed: currentRole.permissions.canSearch,
      },
      {
        key: 'repository',
        label: 'Document Repository',
        icon: FolderOpen,
        allowed: currentRole.permissions.canViewRepository,
      },
      {
        key: 'settings',
        label: 'Settings',
        icon: Settings,
        allowed: currentRole.permissions.canAccessSettings,
      },
    ];

    return baseItems.filter((item) => item.allowed);
  }, [currentRole]);

  useEffect(() => {
    localStorage.setItem('ledgerRole', role);

    const activeAllowed = items.some((item) => item.key === activePage);
    if (!activeAllowed) {
      setActivePage('search');
    }
  }, [role, items, activePage, setActivePage]);

  function changeRole(nextRole) {
    setRole(nextRole);
    setRoleOpen(false);
  }

  function handleLogout() {
    if (typeof onLogout === 'function') {
      onLogout();
    }
  }

  return (
    <AccessContext.Provider
      value={{
        role,
        permissions: currentRole.permissions,
      }}
    >
      <div className="app-shell">
        <header className="topbar compact-topbar">
          <div className="topbar-brand">
            <div className="logo-panel">
              <img
                src={macsgLogo}
                alt="MACS-G Solutions"
                className="brand-logo"
                width={110}
              />

              <div className="logo-divider" />

              <img
                src={taqaLogo}
                alt="TAQA Generation"
                className="brand-logo"
                width={110}
              />
            </div>

            <div className="brand-text">
              <span className="brand-title">HSSE O&amp;M</span>
              <span className="brand-sub">Document Register</span>
            </div>
          </div>

          <nav className="topbar-nav" aria-label="Primary navigation">
            {items.map((item) => {
              const Icon = item.icon;

              return (
                <button
                  key={item.key}
                  type="button"
                  className={`top-nav-item ${activePage === item.key ? 'top-nav-item-active' : ''
                    }`}
                  onClick={() => setActivePage(item.key)}
                >
                  <Icon size={20} strokeWidth={1.8} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="topbar-actions">
            <div className="role-switch">
              <button
                type="button"
                className="role-current"
                onClick={() => setRoleOpen((v) => !v)}
              >
                <span className="role-dot" style={{ background: currentRole.color }} />
                <span className="role-current-text">{role}</span>
                <ChevronDown size={15} className={roleOpen ? 'chev-up' : ''} />
              </button>

              {roleOpen && (
                <div className="role-menu">
                  {roles.map((r) => (
                    <button
                      key={r.name}
                      type="button"
                      className="role-option"
                      onClick={() => changeRole(r.name)}
                    >
                      <span className="role-dot" style={{ background: r.color }} />

                      <div className="role-option-text">
                        <span className="role-option-name">{r.name}</span>
                        <span className="role-option-desc">{r.desc}</span>
                      </div>

                      {role === r.name && <Check size={15} />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="account-row">
              <div className="account-avatar">
                <UserRound size={16} />
              </div>

              <div className="account-text">
                <span className="account-name">
                  {currentUser?.name || 'Jonnathan'}
                </span>
                <span className="account-role">{role}</span>
              </div>

              <button
                type="button"
                className="logout-btn"
                onClick={handleLogout}
                title="Sign out"
                aria-label="Sign out"
              >
                <LogOut size={15} />
              </button>
            </div>
          </div>
        </header>

        <main className="main-area">{children}</main>
      </div>
    </AccessContext.Provider>
  );
}