import { Wallet, CheckCircle2, Clock } from 'lucide-react';
import StatCard from '../../components/common/StatCard';
import { STUDENTS } from '../../data';
import { ME_PARENT } from './ParentDashboard';

const INVOICES = [
  { term: 'Term 2, 2026', amount: 'KES 45,000', paid: 'KES 32,600', status: 'Partial', due: '2026-05-10' },
  { term: 'Term 1, 2026', amount: 'KES 45,000', paid: 'KES 45,000', status: 'Paid', due: '2026-01-10' },
  { term: 'Term 3, 2025', amount: 'KES 42,000', paid: 'KES 42,000', status: 'Paid', due: '2025-09-05' },
];

export default function Fees() {
  const children = STUDENTS.filter((s) => ME_PARENT.childrenIds.includes(s.id));
  const kids = children.length ? children : STUDENTS.slice(0, 2);

  return (
    <div>
      <div className="grid-auto" style={{ marginBottom: 20 }}>
        <StatCard icon={Wallet} label="Outstanding Balance" value="KES 12,400" tone="warning" />
        <StatCard icon={CheckCircle2} label="Paid This Term" value="KES 32,600" tone="success" />
        <StatCard label="Children Billed" value={kids.length} tone="blue" />
      </div>
      <div className="card table-wrap">
        <table>
          <thead><tr><th>Term</th><th>Amount</th><th>Paid</th><th>Due</th><th>Status</th></tr></thead>
          <tbody>
            {INVOICES.map((inv) => (
              <tr key={inv.term}>
                <td>{inv.term}</td><td>{inv.amount}</td><td>{inv.paid}</td><td>{inv.due}</td>
                <td><span className={`badge badge-${inv.status === 'Paid' ? 'success' : 'warning'}`}>{inv.status === 'Paid' ? <CheckCircle2 size={12} /> : <Clock size={12} />} {inv.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 12 }}>Fee information is illustrative UI only — no live payment processing is connected.</p>
    </div>
  );
}
