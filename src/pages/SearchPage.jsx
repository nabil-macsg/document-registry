import { useMemo, useState } from 'react';
import {
  ClipboardList,
  ExternalLink,
  Eye,
  FileText,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react';

function normalizeDoc(d) {
  return {
    ...d,
    documentNo: d.documentNo || '',
    documentTitle: d.documentTitle || '',
    category: d.category || 'Procedure',
    subCategory: d.subCategory || 'General',
    documentType: d.documentType || 'Standard',
    documentUrl: d.documentUrl || '',
  };
}

export default function SearchPage({ docs = [], stats = {} }) {
  const [query, setQuery] = useState('');
  const [searched, setSearched] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const [filters, setFilters] = useState({
    category: 'All',
    subCategory: 'All',
    documentType: 'All',
  });

  const normalizedDocs = useMemo(() => docs.map(normalizeDoc), [docs]);

  const categories = useMemo(
    () => ['All', ...new Set(normalizedDocs.map((d) => d.category).filter(Boolean))],
    [normalizedDocs]
  );

  const subCategories = useMemo(
    () => ['All', ...new Set(normalizedDocs.map((d) => d.subCategory).filter(Boolean))],
    [normalizedDocs]
  );

  const documentTypes = useMemo(
    () => ['All', ...new Set(normalizedDocs.map((d) => d.documentType).filter(Boolean))],
    [normalizedDocs]
  );

  const hasCriteria =
    query.trim() ||
    filters.category !== 'All' ||
    filters.subCategory !== 'All' ||
    filters.documentType !== 'All';

  const activeAdvancedCount = useMemo(() => {
    let count = 0;
    if (filters.category !== 'All') count += 1;
    if (filters.subCategory !== 'All') count += 1;
    if (filters.documentType !== 'All') count += 1;
    return count;
  }, [filters]);

  const computedStats = useMemo(
    () => ({
      total: stats.total || normalizedDocs.length,
      categories: stats.categories || categories.length - 1,
      subCategories: subCategories.length - 1,
    }),
    [stats, normalizedDocs, categories, subCategories]
  );

  const results = useMemo(() => {
    if (!searched || !hasCriteria) return [];

    const q = query.trim().toLowerCase();

    return normalizedDocs.filter((d) => {
      const haystack = [
        d.documentNo,
        d.documentTitle,
        d.category,
        d.subCategory,
        d.documentType,
      ]
        .join(' ')
        .toLowerCase();

      return (
        (!q || haystack.includes(q)) &&
        (filters.category === 'All' || d.category === filters.category) &&
        (filters.subCategory === 'All' || d.subCategory === filters.subCategory) &&
        (filters.documentType === 'All' || d.documentType === filters.documentType)
      );
    });
  }, [normalizedDocs, query, filters, searched, hasCriteria]);

  function clearSearch() {
    setQuery('');
    setFilters({
      category: 'All',
      subCategory: 'All',
      documentType: 'All',
    });
    setSearched(false);
    setAdvancedOpen(false);
  }

  function updateFilter(key, value) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  function openDocument(doc) {
    if (!doc.documentUrl) return;
    window.open(doc.documentUrl, '_blank', 'noopener,noreferrer');
  }

  return (
    <div className="view search-view">
      <header className="search-hero compact-search-hero">
        <div className="ledger-lines" />

        <div className="hero-content-grid">
          <div className="hero-copy">
            <span className="hero-eyebrow">Document Registry · Lookup</span>
            <h1 className="hero-title">Find controlled documents faster.</h1>
            <p className="hero-sub">
              Search by document number, title, category, sub-category, or document type.
            </p>
          </div>

          <div className="hero-stats compact-hero-stats">
            <div className="hero-stat">
              <span className="hero-stat-num">{computedStats.total}</span>
              <span className="hero-stat-label">Documents</span>
            </div>
            <div className="hero-stat-sep" />
            <div className="hero-stat">
              <span className="hero-stat-num">{computedStats.categories}</span>
              <span className="hero-stat-label">Categories</span>
            </div>
            <div className="hero-stat-sep" />
            <div className="hero-stat">
              <span className="hero-stat-num">{computedStats.subCategories}</span>
              <span className="hero-stat-label">Sub Categories</span>
            </div>
          </div>
        </div>

        <form
          className="search-bar compact-search-bar"
          onSubmit={(e) => {
            e.preventDefault();
            setSearched(true);
          }}
        >
          <Search size={17} className="search-icon" />

          <input
            autoFocus
            placeholder="Search by document no or document title..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />

          {query && (
            <button type="button" className="search-clear-btn" onClick={() => setQuery('')}>
              <X size={15} />
            </button>
          )}

          <button
            type="button"
            className={`advanced-search-btn ${activeAdvancedCount ? 'advanced-search-btn-active' : ''}`}
            onClick={() => setAdvancedOpen(true)}
          >
            <SlidersHorizontal size={16} />
            <span>Advanced</span>
            {activeAdvancedCount > 0 && <strong>{activeAdvancedCount}</strong>}
          </button>

          <button type="submit" className="search-submit">Search</button>
        </form>
      </header>

      <section className="search-results-area">
        {(!searched || !hasCriteria) && (
          <div className="search-empty compact-empty">
            <ClipboardList size={26} />
            <h3>Start your search</h3>
            <p>Enter a document number/title or apply an advanced filter.</p>
          </div>
        )}

        {searched && hasCriteria && results.length === 0 && (
          <div className="search-empty compact-empty">
            <Search size={26} />
            <h3>No matching documents found</h3>
            <p>Try a shorter keyword or clear advanced filters.</p>
            <button className="empty-action-btn" type="button" onClick={clearSearch}>
              Clear search
            </button>
          </div>
        )}

        {searched && hasCriteria && results.length > 0 && (
          <>
            <div className="results-meta">
              <span>
                Showing <strong>{results.length}</strong> matching document
                {results.length !== 1 ? 's' : ''}
              </span>
              <button type="button" onClick={clearSearch}>Clear</button>
            </div>

            <div className="results-list clean-results-list">
              {results.map((d, index) => (
                <article key={`${d.documentNo}-${index}`} className="clean-doc-card search-doc-card">
                  <div className="clean-doc-main">
                    <div className="clean-doc-icon">
                      <FileText size={18} />
                    </div>

                    <div className="clean-doc-content">
                      <div className="search-doc-title-row">
                        <h3>{d.documentTitle}</h3>

                        <span
                          className={`category-pill search-category-pill ${d.category === 'Procedure'
                              ? 'category-pill-procedure'
                              : 'category-pill-form'
                            }`}
                        >
                          {d.category}
                        </span>
                      </div>

                      <div className="search-doc-tags-row">
                        <span className="doc-code">{d.documentNo}</span>
                        <span className="file-pill">{d.documentType}</span>
                      </div>

                      <div className="clean-doc-category">
                        {d.subCategory}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="view-doc-btn"
                    onClick={() => openDocument(d)}
                    disabled={!d.documentUrl}
                  >
                    <Eye size={14} />
                    <span>View</span>
                    <ExternalLink size={12} />
                  </button>
                </article>
              ))}
            </div>
          </>
        )}
      </section>

      {advancedOpen && (
        <div className="filter-backdrop" onClick={() => setAdvancedOpen(false)}>
          <aside className="filter-pane" onClick={(e) => e.stopPropagation()}>
            <div className="filter-pane-header">
              <div>
                <span>Advanced Search</span>
                <h2>Filter documents</h2>
              </div>
              <button type="button" onClick={() => setAdvancedOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form
              className="filter-form"
              onSubmit={(e) => {
                e.preventDefault();
                setSearched(true);
                setAdvancedOpen(false);
              }}
            >
              <SelectField label="Category" value={filters.category} options={categories} onChange={(v) => updateFilter('category', v)} />
              <SelectField label="Sub Category" value={filters.subCategory} options={subCategories} onChange={(v) => updateFilter('subCategory', v)} />
              <SelectField label="Document Type" value={filters.documentType} options={documentTypes} onChange={(v) => updateFilter('documentType', v)} />

              <div className="filter-actions">
                <button type="button" className="filter-reset-btn" onClick={clearSearch}>
                  Reset
                </button>
                <button type="submit" className="filter-apply-btn">
                  Apply Filters
                </button>
              </div>
            </form>
          </aside>
        </div>
      )}
    </div>
  );
}

function SelectField({ label, value, options, onChange }) {
  return (
    <label className="filter-field">
      <span>{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}