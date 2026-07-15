import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { UserPlus, Mail, Phone, Award, ClipboardCheck, Edit3, Trash2 } from 'lucide-react';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import { ConfirmDialog, Breadcrumb } from '../../components/common/ConfirmDialog';
import StatCard from '../../components/common/StatCard';
import { STUDENTS, CLASSES, avatarUrl } from '../../data';
import { useToast } from '../../context/ToastContext';

export function StudentList() {
  const navigate = useNavigate();
  const toast = useToast();
  const [registerOpen, setRegisterOpen] = useState(false);
  const [toDelete, setToDelete] = useState(null);

  return (
    <div>
      <div className="grid-auto" style={{ marginBottom: 20 }}>
        <StatCard label="Total Students" value={STUDENTS.length} tone="blue" />
        <StatCard label="Active" value={STUDENTS.filter((s) => s.status === 'Active').length} tone="success" />
        <StatCard label="Average Attendance" value={`${Math.round(STUDENTS.reduce((a, s) => a + s.attendanceRate, 0) / STUDENTS.length)}%`} tone="blue" />
        <StatCard label="Classes" value={CLASSES.length} tone="warning" />
      </div>

      <DataTable
        title="All students"
        data={STUDENTS}
        searchKeys={['name', 'admissionNo', 'email']}
        filters={[{ key: 'className', options: [...new Set(CLASSES.map((c) => c.name))] }, { key: 'status', options: ['Active', 'Inactive'] }]}
        onRowClick={(r) => navigate(`../students/${r.id}`)}
        toolbar={<button className="btn btn-primary btn-sm" onClick={() => setRegisterOpen(true)}><UserPlus size={15} /> Register student</button>}
        columns={[
          { key: 'name', label: 'Student', render: (r) => (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <img src={avatarUrl(r.avatarSeed)} style={{ width: 30, height: 30, borderRadius: '50%' }} alt="" />
              <div><div style={{ fontWeight: 600 }}>{r.name}</div><div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>{r.admissionNo}</div></div>
            </div>
          ) },
          { key: 'className', label: 'Class' },
          { key: 'gender', label: 'Gender' },
          { key: 'attendanceRate', label: 'Attendance', render: (r) => `${r.attendanceRate}%` },
          { key: 'overallGrade', label: 'Grade', render: (r) => <span className="badge badge-info">{r.overallGrade}</span> },
          { key: 'status', label: 'Status', render: (r) => <span className={`badge badge-${r.status === 'Active' ? 'success' : 'neutral'}`}>{r.status}</span> },
        ]}
        rowActions={(r) => (
          <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
            <button className="btn btn-secondary btn-sm btn-icon" onClick={() => navigate(`../students/${r.id}`)}><Edit3 size={14} /></button>
            <button className="btn btn-danger btn-sm btn-icon" onClick={() => setToDelete(r)}><Trash2 size={14} /></button>
          </div>
        )}
      />

      <Modal open={registerOpen} onClose={() => setRegisterOpen(false)} title="Register new student"
        footer={<>
          <button className="btn btn-secondary" onClick={() => setRegisterOpen(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={() => { toast.success('Student registered'); setRegisterOpen(false); }}>Register student</button>
        </>}>
        <RegisterStudentForm />
      </Modal>

      <ConfirmDialog open={!!toDelete} onClose={() => setToDelete(null)} title="Remove student"
        body={`Remove ${toDelete?.name} from the school roster? This cannot be undone.`}
        onConfirm={() => toast.success(`${toDelete?.name} removed`)} />
    </div>
  );
}

export function RegisterStudentForm() {
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="field"><label>Full name</label><input placeholder="Faith Wanjiru" /></div>
        <div className="field"><label>Admission number</label><input placeholder="ADM-3210" /></div>
        <div className="field"><label>Class</label><select><option>Select class</option>{CLASSES.map((c) => <option key={c.id}>{c.name}</option>)}</select></div>
        <div className="field"><label>Gender</label><select><option>Female</option><option>Male</option></select></div>
        <div className="field"><label>Date of birth</label><input type="date" /></div>
        <div className="field"><label>Guardian phone</label><input placeholder="0712345678" /></div>
      </div>
      <div className="field"><label>Email</label><input placeholder="student@students.edunex.io" /></div>
    </div>
  );
}

export function StudentProfile() {
  const { id } = useParams();
  const student = STUDENTS.find((s) => s.id === id) || STUDENTS[0];
  return (
    <div>
      <Breadcrumb items={[{ label: 'Students', to: '..' }, { label: student.name }]} />
      <div className="grid-2" style={{ marginTop: 16 }}>
        <div className="card" style={{ padding: 26 }}>
          <div style={{ display: 'flex', gap: 18, alignItems: 'center', marginBottom: 20 }}>
            <img src={avatarUrl(student.avatarSeed)} alt="" style={{ width: 72, height: 72, borderRadius: 18 }} />
            <div>
              <h2 style={{ fontSize: 19, marginBottom: 3 }}>{student.name}</h2>
              <p style={{ margin: 0 }}>{student.admissionNo} · {student.className}</p>
            </div>
            <span className={`badge badge-${student.status === 'Active' ? 'success' : 'neutral'}`} style={{ marginLeft: 'auto' }}>{student.status}</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, fontSize: 13.5 }}>
            <div><span style={{ color: 'var(--text-muted)' }}>Gender</span><div style={{ fontWeight: 600 }}>{student.gender}</div></div>
            <div><span style={{ color: 'var(--text-muted)' }}>Date of birth</span><div style={{ fontWeight: 600 }}>{student.dob}</div></div>
            <div><span style={{ color: 'var(--text-muted)' }}>Email</span><div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}><Mail size={13} />{student.email}</div></div>
            <div><span style={{ color: 'var(--text-muted)' }}>Guardian phone</span><div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}><Phone size={13} />{student.guardianPhone}</div></div>
            <div><span style={{ color: 'var(--text-muted)' }}>Electives</span><div style={{ fontWeight: 600 }}>{student.electives.join(', ')}</div></div>
            <div><span style={{ color: 'var(--text-muted)' }}>Admitted</span><div style={{ fontWeight: 600 }}>{student.admitted}</div></div>
          </div>
          <h3 style={{ fontSize: 14, marginTop: 24, marginBottom: 10 }}>Documents</h3>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {['Birth Certificate', 'KCPE Result Slip', 'Admission Letter'].map((d) => (
              <span key={d} className="badge badge-neutral" style={{ padding: '8px 14px' }}>{d}</span>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <StatCard icon={Award} label="Overall Grade" value={student.overallGrade} tone="success" />
          <StatCard icon={ClipboardCheck} label="Attendance Rate" value={`${student.attendanceRate}%`} tone="blue" />
          <div className="card" style={{ padding: 18 }}>
            <h3 style={{ fontSize: 14, marginBottom: 10 }}>Student history</h3>
            {['Promoted to ' + student.className, 'Registered elective: ' + student.electives[0], 'Admitted to EduNex Model Academy'].map((h, i) => (
              <div key={i} style={{ fontSize: 12.8, color: 'var(--text-secondary)', paddingBottom: 8, marginBottom: 8, borderBottom: i < 2 ? '1px solid var(--border)' : 'none' }}>{h}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentList;
