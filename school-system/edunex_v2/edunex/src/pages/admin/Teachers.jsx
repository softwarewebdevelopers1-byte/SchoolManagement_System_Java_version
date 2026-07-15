import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { UserPlus, Mail, Phone, Briefcase, Edit3, Trash2 } from 'lucide-react';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import { ConfirmDialog, Breadcrumb } from '../../components/common/ConfirmDialog';
import StatCard from '../../components/common/StatCard';
import { TEACHERS, DEPARTMENTS, SUBJECTS, avatarUrl } from '../../data';
import { useToast } from '../../context/ToastContext';

export function TeacherList() {
  const navigate = useNavigate();
  const toast = useToast();
  const [registerOpen, setRegisterOpen] = useState(false);
  const [toDelete, setToDelete] = useState(null);

  return (
    <div>
      <div className="grid-auto" style={{ marginBottom: 20 }}>
        <StatCard label="Teaching Staff" value={TEACHERS.length} tone="blue" />
        <StatCard label="Active" value={TEACHERS.filter((t) => t.status === 'Active').length} tone="success" />
        <StatCard label="Departments" value={DEPARTMENTS.length} tone="warning" />
        <StatCard label="Avg. Workload" value={`${Math.round(TEACHERS.reduce((a, t) => a + t.workload, 0) / TEACHERS.length)} lessons/wk`} tone="blue" />
      </div>

      <DataTable
        title="All teachers"
        data={TEACHERS}
        searchKeys={['name', 'email', 'department']}
        filters={[{ key: 'department', options: DEPARTMENTS }, { key: 'status', options: ['Active', 'On Leave'] }]}
        onRowClick={(r) => navigate(`../teachers/${r.id}`)}
        toolbar={<button className="btn btn-primary btn-sm" onClick={() => setRegisterOpen(true)}><UserPlus size={15} /> Register teacher</button>}
        columns={[
          { key: 'name', label: 'Teacher', render: (r) => (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <img src={avatarUrl(r.avatarSeed)} style={{ width: 30, height: 30, borderRadius: '50%' }} alt="" />
              <div><div style={{ fontWeight: 600 }}>{r.name}</div><div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>{r.tsc}</div></div>
            </div>
          ) },
          { key: 'department', label: 'Department' },
          { key: 'subjects', label: 'Subjects', render: (r) => r.subjects.map((id) => SUBJECTS.find((s) => s.id === id)?.code).join(', ') },
          { key: 'workload', label: 'Workload', render: (r) => `${r.workload} lessons/wk` },
          { key: 'status', label: 'Status', render: (r) => <span className={`badge badge-${r.status === 'Active' ? 'success' : 'warning'}`}>{r.status}</span> },
        ]}
        rowActions={(r) => (
          <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
            <button className="btn btn-secondary btn-sm btn-icon" onClick={() => navigate(`../teachers/${r.id}`)}><Edit3 size={14} /></button>
            <button className="btn btn-danger btn-sm btn-icon" onClick={() => setToDelete(r)}><Trash2 size={14} /></button>
          </div>
        )}
      />

      <Modal open={registerOpen} onClose={() => setRegisterOpen(false)} title="Register new teacher"
        footer={<>
          <button className="btn btn-secondary" onClick={() => setRegisterOpen(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={() => { toast.success('Teacher registered'); setRegisterOpen(false); }}>Register teacher</button>
        </>}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className="field"><label>Full name</label><input placeholder="Grace Njoroge" /></div>
          <div className="field"><label>TSC number</label><input placeholder="TSC/123456" /></div>
          <div className="field"><label>Department</label><select>{DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}</select></div>
          <div className="field"><label>Primary subject</label><select>{SUBJECTS.map((s) => <option key={s.id}>{s.name}</option>)}</select></div>
          <div className="field"><label>Email</label><input placeholder="teacher@edunex.io" /></div>
          <div className="field"><label>Phone</label><input placeholder="0712345678" /></div>
        </div>
      </Modal>

      <ConfirmDialog open={!!toDelete} onClose={() => setToDelete(null)} title="Remove teacher"
        body={`Remove ${toDelete?.name} from the staff directory?`}
        onConfirm={() => toast.success(`${toDelete?.name} removed`)} />
    </div>
  );
}

export function TeacherProfile() {
  const { id } = useParams();
  const teacher = TEACHERS.find((t) => t.id === id) || TEACHERS[0];
  return (
    <div>
      <Breadcrumb items={[{ label: 'Teachers', to: '..' }, { label: teacher.name }]} />
      <div className="grid-2" style={{ marginTop: 16 }}>
        <div className="card" style={{ padding: 26 }}>
          <div style={{ display: 'flex', gap: 18, alignItems: 'center', marginBottom: 20 }}>
            <img src={avatarUrl(teacher.avatarSeed)} alt="" style={{ width: 72, height: 72, borderRadius: 18 }} />
            <div>
              <h2 style={{ fontSize: 19, marginBottom: 3 }}>{teacher.name}</h2>
              <p style={{ margin: 0 }}>{teacher.department} · {teacher.tsc}</p>
            </div>
            <span className={`badge badge-${teacher.status === 'Active' ? 'success' : 'warning'}`} style={{ marginLeft: 'auto' }}>{teacher.status}</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, fontSize: 13.5 }}>
            <div><span style={{ color: 'var(--text-muted)' }}>Email</span><div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}><Mail size={13} />{teacher.email}</div></div>
            <div><span style={{ color: 'var(--text-muted)' }}>Phone</span><div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}><Phone size={13} />{teacher.phone}</div></div>
            <div><span style={{ color: 'var(--text-muted)' }}>Joined</span><div style={{ fontWeight: 600 }}>{teacher.joined}</div></div>
            <div><span style={{ color: 'var(--text-muted)' }}>Gender</span><div style={{ fontWeight: 600 }}>{teacher.gender}</div></div>
          </div>
          <h3 style={{ fontSize: 14, marginTop: 24, marginBottom: 10 }}>Subjects taught</h3>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {teacher.subjects.map((id2) => <span key={id2} className="badge badge-info">{SUBJECTS.find((s) => s.id === id2)?.name}</span>)}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <StatCard icon={Briefcase} label="Weekly Workload" value={`${teacher.workload} lessons`} tone="blue" />
          <div className="card" style={{ padding: 18 }}>
            <h3 style={{ fontSize: 14, marginBottom: 10 }}>Assignments</h3>
            <p style={{ fontSize: 12.8, marginBottom: 0 }}>Class teacher of at least one stream, plus subject teaching load across {teacher.subjects.length} subject(s).</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TeacherList;
