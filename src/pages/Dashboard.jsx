import { ClipboardList, Files, FolderOpen, Layers, Plus } from 'lucide-react';
import PageHeader from '../components/PageHeader.jsx';
import KpiCard from '../components/KpiCard.jsx';

export default function Dashboard({ docs, stats, onNavigate }) {
  const topCategories = Object.entries(docs.reduce((acc, d) => { acc[d.category] = (acc[d.category] || 0) + 1; return acc; }, {})).sort((a,b)=>b[1]-a[1]).slice(0,6);
  const recent = docs.filter(d => Number(d.totalLinkedDocs) > 0).slice(0,6);
  return <>
    <PageHeader eyebrow="Command Center" title="HSSE Master Procedure Mapping" description="Static front-end repository built from the uploaded Excel mapping and document register." action={<button className="primary-btn" onClick={() => onNavigate('repository')}><Plus size={17}/> Manage Repository</button>} />
    <section className="hero-card"><div><span className="hero-kicker">Gen HSSE O&M Documents Register</span><h2>Search, review, and maintain procedure-to-appendix mapping.</h2><p>The application uses local React state only. Search, filters, view, edit, add, and delete actions work without an API.</p></div><div className="hero-score"><strong>{stats.procedures}</strong><span>procedures</span></div></section>
    <section className="kpi-grid">
      <KpiCard label="Procedures" value={stats.procedures} hint="Master mapping records" icon={ClipboardList}/>
      <KpiCard label="Linked Docs" value={stats.linked} hint="Forms, registers, appendices" icon={Files}/>
      <KpiCard label="Categories" value={stats.categories} hint="HSSE control groups" icon={FolderOpen}/>
      <KpiCard label="Register Rows" value={stats.register} hint="Excel document register" icon={Layers}/>
    </section>
    <section className="content-grid two-col">
      <div className="panel"><div className="panel-head"><h3>Category Distribution</h3><span>{topCategories.length} groups</span></div>{topCategories.map(([name,count]) => <div className="bar-row" key={name}><div><b>{name}</b><span>{count} procedures</span></div><div className="bar-track"><i style={{width:`${Math.max(8,(count/docs.length)*100)}%`}} /></div></div>)}</div>
      <div className="panel"><div className="panel-head"><h3>Linked Document Summary</h3><span>by type</span></div><div className="summary-stack"><div><strong>{stats.forms}</strong><span>Forms</span></div><div><strong>{stats.checklists}</strong><span>Checklists</span></div><div><strong>{stats.registers}</strong><span>Registers</span></div><div><strong>{stats.appendices}</strong><span>Appendices</span></div></div></div>
    </section>
    <section className="panel"><div className="panel-head"><h3>Procedures with linked evidence</h3><button className="link-btn" onClick={() => onNavigate('linked')}>Open linked docs</button></div><div className="mini-list">{recent.map(d => <div key={d.id}><b>{d.procedureNo}</b><span>{d.procedureTitle}</span><em>{d.totalLinkedDocs} linked</em></div>)}</div></section>
  </>;
}
