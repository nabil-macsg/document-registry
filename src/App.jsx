import { useMemo, useState } from 'react';
import Layout from './components/Layout.jsx';
import SearchPage from './pages/SearchPage.jsx';
import Repository from './pages/Repository.jsx';
import Settings from './pages/Settings.jsx';
import { documents, linkedDocuments, registerDocuments } from './data/hsseData.js';

export default function App() {
  const [activePage, setActivePage] = useState('search');
  const [docs, setDocs] = useState(documents);

  const stats = useMemo(
    () => ({
      total: docs.length,
      linked: linkedDocuments.length,
      register: registerDocuments.length,
      categories: new Set(docs.map((d) => d.category).filter(Boolean)).size,
      procedures: new Set(docs.map((d) => d.procedureNo).filter(Boolean)).size,
      types: new Set(docs.map((d) => d.documentType).filter(Boolean)).size,
    }),
    [docs]
  );

  return (
    <Layout activePage={activePage} setActivePage={setActivePage}>
      {activePage === 'search' && <SearchPage docs={docs} stats={stats} />}
      {activePage === 'repository' && <Repository docs={docs} setDocs={setDocs} />}
      {activePage === 'settings' && (
        <Settings stats={stats} registerDocuments={registerDocuments} />
      )}
    </Layout>
  );
}