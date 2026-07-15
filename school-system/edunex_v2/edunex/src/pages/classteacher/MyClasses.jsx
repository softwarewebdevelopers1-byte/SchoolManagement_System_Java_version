import { School } from 'lucide-react';
import { CLASSES, STUDENTS } from '../../data';

const MY_CLASSES = [CLASSES[0]];

export default function MyClasses() {
  return (
    <div className="grid-auto">
      {MY_CLASSES.map((c) => {
        const roster = STUDENTS.filter((s) => s.classId === c.id);
        return (
          <div key={c.id} className="notch-card" style={{ padding: 22 }}>
            <div className="feature-icon" style={{ marginBottom: 14 }}><School size={20} /></div>
            <h3 style={{ fontSize: 16, marginBottom: 4 }}>{c.name}</h3>
            <p style={{ fontSize: 13, marginBottom: 14 }}>{roster.length} students enrolled · Capacity {c.capacity}</p>
            <div style={{ display: 'flex', gap: 10 }}>
              <span className="badge badge-success">96% attendance</span>
              <span className="badge badge-info">Mean 66.2</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
