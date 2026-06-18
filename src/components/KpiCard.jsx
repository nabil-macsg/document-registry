export default function KpiCard({ label, value, hint, icon: Icon }) {
  return <div className="kpi-card"><div><span>{label}</span><strong>{value}</strong><small>{hint}</small></div>{Icon && <Icon size={22}/>}</div>;
}
