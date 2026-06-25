import { useMemo, useState } from 'react';
import Layout from './components/Layout.jsx';
import SignIn from './pages/SignIn.jsx';
import SearchPage from './pages/SearchPage.jsx';
import Repository from './pages/Repository.jsx';
import Settings from './pages/Settings.jsx';
import { documents, linkedDocuments, registerDocuments } from './data/hsseData.js';

const defaultUser = {
  name: 'Jonnathan',
  email: 'jonnathan@taqa.com',
};

export default function App() {
  const [activePage, setActivePage] = useState('search');
  const [docs, setDocs] = useState(documents);

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('ledgerAuth') === 'true';
  });

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('ledgerUser')) || defaultUser;
    } catch {
      return defaultUser;
    }
  });

  const stats = useMemo(
    () => ({
      total: docs.length,
      linked: linkedDocuments.length,
      register: registerDocuments.length,

      categories: new Set(docs.map((d) => d.category).filter(Boolean)).size,
      subCategories: new Set(docs.map((d) => d.subCategory).filter(Boolean)).size,

      procedures: docs.filter((d) => d.category === 'Procedure').length,
      forms: docs.filter((d) => d.category === 'Form').length,

      types: new Set(docs.map((d) => d.documentType).filter(Boolean)).size,
    }),
    [docs]
  );

  function handleSignIn(user) {
    const nextUser = user || defaultUser;

    localStorage.setItem('ledgerAuth', 'true');
    localStorage.setItem('ledgerUser', JSON.stringify(nextUser));

    setCurrentUser(nextUser);
    setIsAuthenticated(true);
    setActivePage('search');
  }

  function handleLogout() {
    localStorage.removeItem('ledgerAuth');
    localStorage.removeItem('ledgerUser');

    setIsAuthenticated(false);
    setActivePage('search');
  }

  if (!isAuthenticated) {
    return <SignIn onSignIn={handleSignIn} />;
  }

  return (
    <Layout
      activePage={activePage}
      setActivePage={setActivePage}
      currentUser={currentUser}
      onLogout={handleLogout}
    >
      {activePage === 'search' && <SearchPage docs={docs} stats={stats} />}

      {activePage === 'repository' && (
        <Repository docs={docs} setDocs={setDocs} />
      )}

      {activePage === 'settings' && (
        <Settings stats={stats} registerDocuments={registerDocuments} />
      )}
    </Layout>
  );
}