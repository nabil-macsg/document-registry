import { useMemo, useState } from 'react';
import {
  Edit3,
  Lock,
  Mail,
  Plus,
  Shield,
  Trash2,
  UserPlus,
  X,
} from 'lucide-react';

const roles = [
  {
    name: 'Admin',
    desc: 'Full system access — search, manage repository, and configure users.',
    color: '#D98E04',
  },
  {
    name: 'Document Manager',
    desc: 'Search, view, add, edit, and delete documents. No settings access.',
    color: '#3F7A5C',
  },
  {
    name: 'Document Viewer',
    desc: 'Search and view documents only. No settings access.',
    color: '#5B6B82',
  },
];

const initialUsers = [
  {
    id: 1,
    name: 'Jonnathan',
    email: 'jonnathan@macs-g.com',
    role: 'Admin',
    addedOn: '2025-11-02',
  },
  {
    id: 2,
    name: 'Nabil Uchummal',
    email: 'nabil.uchummal@macs-g.com',
    role: 'Document Manager',
    addedOn: '2025-12-14',
  },
  {
    id: 3,
    name: 'Rethish Nair',
    email: 'rethish.nair@macs-g.com',
    role: 'Document Viewer',
    addedOn: '2026-01-22',
  },
];

const emptyForm = {
  name: '',
  email: '',
  password: '',
  role: 'Document Viewer',
};

function initials(name) {
  return String(name || '')
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export default function Settings() {
  const [users, setUsers] = useState(initialUsers);
  const [paneOpen, setPaneOpen] = useState(false);
  const [mode, setMode] = useState('add');
  const [form, setForm] = useState(emptyForm);
  const [deleteUser, setDeleteUser] = useState(null);
  const [toast, setToast] = useState('');

  const roleCounts = useMemo(() => {
    return roles.map((role) => ({
      ...role,
      count: users.filter((u) => u.role === role.name).length,
    }));
  }, [users]);

  function showToast(message) {
    setToast(message);
    setTimeout(() => setToast(''), 2200);
  }

  function openAddPane() {
    setMode('add');
    setForm(emptyForm);
    setPaneOpen(true);
  }

  function openEditPane(user) {
    setMode('edit');
    setForm({
      ...user,
      password: '',
    });
    setPaneOpen(true);
  }

  function updateForm(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function submitUser(e) {
    e.preventDefault();

    if (mode === 'add') {
      setUsers((prev) => [
        {
          id: Date.now(),
          name: form.name,
          email: form.email,
          role: form.role,
          addedOn: new Date().toISOString().slice(0, 10),
        },
        ...prev,
      ]);
      showToast('User added');
    } else {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === form.id
            ? {
              ...u,
              name: form.name,
              email: form.email,
              role: form.role,
            }
            : u
        )
      );
      showToast('User updated');
    }

    setPaneOpen(false);
    setForm(emptyForm);
  }

  function confirmDelete() {
    setUsers((prev) => prev.filter((u) => u.id !== deleteUser.id));
    setDeleteUser(null);
    showToast('User deleted');
  }

  return (
    <div className="view settings-view">
      {toast && <div className="center-toast">{toast}</div>}

      <div className="view-header settings-header">
        <div>
          <span className="view-eyebrow">Settings</span>
          <h1 className="view-title">User Management</h1>
          <p className="view-desc">
            Control who can search, manage, and administer the registry.
          </p>
        </div>

        <button type="button" className="primary-btn add-user-btn" onClick={openAddPane}>
          <UserPlus size={17} />
          Add user
        </button>
      </div>

      <section className="role-grid">
        {roleCounts.map((role) => (
          <article className="role-card" key={role.name}>
            <div className="role-card-head">
              <span className="role-dot" style={{ background: role.color }} />
              <h3>{role.name}</h3>
              <strong>{role.count}</strong>
            </div>
            <p>{role.desc}</p>
          </article>
        ))}
      </section>

      <section className="users-table-card">
        <div className="users-table-header">
          <span>User</span>
          <span>Email</span>
          <span>Role</span>
          <span>Added On</span>
          <span>Actions</span>
        </div>

        {users.map((user) => (
          <div className="users-table-row" key={user.id}>
            <div className="user-cell">
              <div className="user-avatar">{initials(user.name)}</div>
              <strong>{user.name}</strong>
            </div>

            <div className="mono-cell">{user.email}</div>

            <div>
              <span className={`role-badge role-${user.role.toLowerCase().replaceAll(' ', '-')}`}>
                {user.role}
              </span>
            </div>

            <div>{user.addedOn}</div>

            <div className="users-actions">
              <button type="button" onClick={() => openEditPane(user)} title="Edit user">
                <Edit3 size={15} />
              </button>
              <button type="button" onClick={() => setDeleteUser(user)} title="Delete user">
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}
      </section>

      {paneOpen && (
        <div className="filter-backdrop" onClick={() => setPaneOpen(false)}>
          <aside className="filter-pane user-form-pane" onClick={(e) => e.stopPropagation()}>
            <div className="filter-pane-header">
              <div>
                <span>{mode === 'add' ? 'New Account' : 'Manage Account'}</span>
                <h2>{mode === 'add' ? 'Add a user' : 'Edit user'}</h2>
              </div>

              <button type="button" onClick={() => setPaneOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form className="filter-form" onSubmit={submitUser}>
              <label className="filter-field">
                <span>Full name *</span>
                <input
                  required
                  placeholder="e.g. Aditi Sharma"
                  value={form.name}
                  onChange={(e) => updateForm('name', e.target.value)}
                />
              </label>

              <label className="filter-field">
                <span>Email *</span>
                <div className="input-with-icon">
                  <Mail size={16} />
                  <input
                    required
                    type="email"
                    placeholder="name@company.com"
                    value={form.email}
                    onChange={(e) => updateForm('email', e.target.value)}
                  />
                </div>
              </label>

              <label className="filter-field">
                <span>Password {mode === 'add' ? '*' : ''}</span>
                <div className="input-with-icon">
                  <Lock size={16} />
                  <input
                    required={mode === 'add'}
                    type="password"
                    placeholder={
                      mode === 'add'
                        ? 'Set a temporary password'
                        : 'Leave blank to keep current password'
                    }
                    value={form.password}
                    onChange={(e) => updateForm('password', e.target.value)}
                  />
                </div>
              </label>

              <div className="filter-field">
                <span>Role *</span>

                <div className="role-select-list">
                  {roles.map((role) => (
                    <label
                      key={role.name}
                      className={`role-select-card ${form.role === role.name ? 'role-select-card-active' : ''
                        }`}
                    >
                      <input
                        type="radio"
                        name="role"
                        checked={form.role === role.name}
                        onChange={() => updateForm('role', role.name)}
                      />
                      <span className="role-dot" style={{ background: role.color }} />
                      <div>
                        <strong>{role.name}</strong>
                        <p>{role.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="filter-actions">
                <button type="button" className="filter-reset-btn" onClick={() => setPaneOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="filter-apply-btn">
                  {mode === 'add' ? 'Create User' : 'Save Changes'}
                </button>
              </div>
            </form>
          </aside>
        </div>
      )}

      {deleteUser && (
        <div className="modal-backdrop-clean" onClick={() => setDeleteUser(null)}>
          <div className="repo-modal-clean small-modal-clean" onClick={(e) => e.stopPropagation()}>
            <div className="repo-modal-header">
              <div>
                <span className="view-eyebrow">Confirm Delete</span>
                <h2>Delete user?</h2>
              </div>
              <button type="button" onClick={() => setDeleteUser(null)}>
                <X size={18} />
              </button>
            </div>

            <p className="repo-modal-note">
              This will remove <strong>{deleteUser.name}</strong> from the user list mockup.
            </p>

            <div className="repo-modal-actions">
              <button type="button" className="ghost-btn" onClick={() => setDeleteUser(null)}>
                Cancel
              </button>
              <button type="button" className="danger-btn" onClick={confirmDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}