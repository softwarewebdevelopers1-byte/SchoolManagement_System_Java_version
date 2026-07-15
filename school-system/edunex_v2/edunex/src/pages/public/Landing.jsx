import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Menu, ArrowRight, GraduationCap, CalendarClock, BarChart3, ShieldCheck, Users, FileSpreadsheet,
  Sun, Moon, Sparkles, Quote, Mail, Phone, MapPin, Award, ClipboardCheck, TrendingUp, Layers,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import logo from '../../assets/logo.png';
import './Landing.css';

const fadeUp = { hidden: { opacity: 0, y: 22 }, show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.4, 0, 0.2, 1] } } };

const FEATURES = [
  { icon: FileSpreadsheet, title: 'Spreadsheet-fast marks entry', body: 'Enter CATs, assignments and exams in a grid built for speed, with live grade calculation and ranking.' },
  { icon: CalendarClock, title: 'Conflict-free timetabling', body: 'Generate teacher, class and room timetables automatically — zero double-bookings, guaranteed.' },
  { icon: BarChart3, title: 'Analytics that explain why', body: 'Mean scores, grade distributions and subject comparisons that surface where to focus next.' },
  { icon: Users, title: 'Every stakeholder, one place', body: 'Purpose-built dashboards for admins, heads, teachers, students and parents — no bolt-on portals.' },
  { icon: ShieldCheck, title: 'Role-based control', body: 'Granular permissions mean staff see exactly what their role needs, nothing more.' },
  { icon: Award, title: 'Report cards, done right', body: 'Printable, templated report cards with rankings and grade summaries generated in seconds.' },
];

const MODULES = [
  { role: 'Administrator', icon: ShieldCheck, body: 'Full academic structure, staffing, timetables and system-wide analytics.' },
  { role: 'Headteacher', icon: TrendingUp, body: 'School-wide performance, results approval and staff oversight at a glance.' },
  { role: 'Class Teacher', icon: Users, body: 'Roster management, attendance, discipline records and report cards.' },
  { role: 'Subject Teacher', icon: FileSpreadsheet, body: 'Fast marks entry, grade books and subject-level performance tracking.' },
  { role: 'Student', icon: GraduationCap, body: 'Results, timetable, assignments and personal performance trends.' },
  { role: 'Parent', icon: Layers, body: "Track every child's attendance, results and fee status in one feed." },
];

const TESTIMONIALS = [
  { quote: 'Report cards that used to take a week now take an afternoon. The ranking and grade calculation is automatic and it just works.', name: 'Faith Kariuki', role: 'Deputy Principal, Ridgeview High' },
  { quote: 'Our timetable used to have clashes every term. EduNex generates ours with zero conflicts and everyone can see it instantly.', name: 'Dr. Peter Mwaura', role: 'Headteacher, Greenfield Academy' },
  { quote: 'As a parent I finally see attendance and results the same day, not at the end of term. It changed how involved I can be.', name: 'Susan Achieng', role: 'Parent' },
];

const CONTACT_ITEMS = [
  { icon: Mail, text: 'info@edunexacademy.ac.ke' },
  { icon: Phone, text: '+254 700 112 233' },
  { icon: MapPin, text: 'Ridgeview Road, Nairobi, Kenya' },
];

export default function Landing() {
  const { theme, toggleTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [screenshotTab, setScreenshotTab] = useState('admin');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div style={{ background: 'var(--bg)' }}>
      <div className={`pub-nav ${scrolled ? 'scrolled' : ''}`}>
        <a href="#top" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src={logo} alt="EduNex" style={{ width: 34, height: 34, borderRadius: 9 }} />
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 17 }}>EduNex</span>
        </a>
        <nav className="pub-nav-links desktop-only">
          <a href="#features">Features</a>
          <a href="#modules">Modules</a>
          <a href="#screenshots">Product</a>
          <a href="#testimonials">Testimonials</a>
          <a href="#contact">Contact</a>
        </nav>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button className="btn-icon btn-ghost" onClick={toggleTheme}>{theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}</button>
          <Link to="/login" className="btn btn-secondary btn-sm desktop-only">Log in</Link>
          <Link to="/login" className="btn btn-primary btn-sm">Get started</Link>
        </div>
      </div>

      <section id="top" className="hero-section">
        <div className="hero-grid">
          <motion.div initial="hidden" animate="show" variants={fadeUp}>
            <span className="eyebrow"><Sparkles size={13} /> Built for modern schools</span>
            <h1 className="hero-title">Run your entire school from <span className="text-gradient">one platform</span>.</h1>
            <p className="hero-sub">EduNex brings admissions, marks, timetabling, attendance and analytics into a single system — with a dashboard designed for exactly what each role needs to do.</p>
            <div className="hero-cta-row">
              <Link to="/login" className="btn btn-primary">Get started free <ArrowRight size={16} /></Link>
              <a href="#screenshots" className="btn btn-secondary">See it in action</a>
            </div>
            <div className="hero-trust">
              <div>240+<span>Students managed</span></div>
              <div>6<span>Purpose-built roles</span></div>
              <div>0<span>Timetable conflicts</span></div>
              <div>99.2%<span>Uptime this term</span></div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.15 }} className="hero-visual">
            <div className="hero-mock">
              <div className="hero-mock-bar"><span /><span /><span /></div>
              <div style={{ padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15 }}>School Analytics</div>
                  <span className="badge badge-success">Term 2 · Live</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 16 }}>
                  {[['Mean Score', '68.4'], ['Attendance', '96%'], ['Top Grade', 'A']].map(([l, v]) => (
                    <div key={l} className="card" style={{ padding: 12 }}>
                      <div style={{ fontSize: 10.5, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{l}</div>
                      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, marginTop: 4 }}>{v}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 90 }}>
                  {[40, 65, 50, 80, 60, 95, 70].map((h, i) => (
                    <div key={i} style={{ flex: 1, height: `${h}%`, borderRadius: 6, background: 'var(--brand-gradient)', opacity: 0.85 }} />
                  ))}
                </div>
              </div>
            </div>
            <div className="hero-float" style={{ top: -18, left: -24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <ClipboardCheck size={16} color="var(--success)" /> Report cards published
              </div>
            </div>
            <div className="hero-float" style={{ bottom: -16, right: -18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <CalendarClock size={16} color="var(--brand-blue)" /> Timetable: 0 conflicts
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="stats-strip">
        <div className="stats-grid">
          {[['240+', 'Students'], ['28', 'Teaching staff'], ['16', 'Subjects offered'], ['4', 'Forms · 4 streams each']].map(([n, l]) => (
            <div key={l}><div className="num">{n}</div><div className="lbl">{l}</div></div>
          ))}
        </div>
      </div>

      <section id="features" className="section">
        <div className="section-head">
          <span className="section-eyebrow">Why EduNex</span>
          <h2>Everything a school office actually needs</h2>
          <p>No unused modules, no separate logins per system — just the tools your team opens every day.</p>
        </div>
        <div className="feature-grid">
          {FEATURES.map((f, i) => (
            <motion.div key={f.title} className="card feature-card" initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.3 }} variants={fadeUp} transition={{ delay: i * 0.05 }}>
              <div className="feature-icon"><f.icon size={20} /></div>
              <h3 style={{ fontSize: 15.5, marginBottom: 8 }}>{f.title}</h3>
              <p style={{ fontSize: 13.8, marginBottom: 0 }}>{f.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section id="modules" className="section" style={{ background: 'var(--bg-subtle)' }}>
        <div className="section-head">
          <span className="section-eyebrow">One system, six perspectives</span>
          <h2>A dashboard for every role in the school</h2>
          <p>Each account sees only what's relevant to them — with the depth a specialist needs.</p>
        </div>
        <div className="modules-grid">
          {MODULES.map((m) => (
            <div key={m.role} className="notch-card module-card">
              <div className="feature-icon" style={{ marginBottom: 14 }}><m.icon size={20} /></div>
              <span className="role-tag">{m.role}</span>
              <p style={{ fontSize: 13.8, marginTop: 8, marginBottom: 0 }}>{m.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="screenshots" className="section">
        <div className="section-head">
          <span className="section-eyebrow">Product</span>
          <h2>See EduNex in your school's colors</h2>
        </div>
        <div className="screenshot-tabs">
          {['admin', 'analytics', 'marks', 'timetable'].map((t) => (
            <button key={t} className={screenshotTab === t ? 'active' : ''} onClick={() => setScreenshotTab(t)} style={{ textTransform: 'capitalize' }}>{t}</button>
          ))}
        </div>
        <div className="screenshot-frame">
          <div style={{ display: 'flex', gap: 6, padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
            <span style={{ width: 9, height: 9, borderRadius: '50%', background: 'var(--border-strong)' }} />
            <span style={{ width: 9, height: 9, borderRadius: '50%', background: 'var(--border-strong)' }} />
            <span style={{ width: 9, height: 9, borderRadius: '50%', background: 'var(--border-strong)' }} />
          </div>
          <div style={{ padding: 28 }}>
            {screenshotTab === 'admin' && <div className="grid-auto">{['240 Students', '28 Teachers', '16 Subjects', '99.2% Uptime'].map((s) => (<div key={s} className="card" style={{ padding: 18 }}><div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Live metric</div><div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, marginTop: 6 }}>{s}</div></div>))}</div>}
            {screenshotTab === 'analytics' && <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 160 }}>{[35, 60, 45, 80, 55, 90, 65, 75].map((h, i) => (<div key={i} style={{ flex: 1, height: `${h}%`, background: 'var(--brand-gradient)', borderRadius: 8, opacity: 0.85 }} />))}</div>}
            {screenshotTab === 'marks' && <div className="table-wrap"><table><thead><tr><th>Student</th><th>CAT 1</th><th>Midterm</th><th>End Term</th><th>Grade</th></tr></thead><tbody>{['Faith W.', 'Brian O.', 'Grace N.', 'Kevin M.'].map((n, i) => (<tr key={n}><td>{n}</td><td>{72 - i * 3}</td><td>{78 - i * 2}</td><td>{81 - i * 4}</td><td><span className="badge badge-success">A-</span></td></tr>))}</tbody></table></div>}
            {screenshotTab === 'timetable' && <div className="table-wrap"><table><thead><tr><th>Period</th><th>Mon</th><th>Tue</th><th>Wed</th></tr></thead><tbody>{['8:00-8:40', '8:40-9:20', '9:20-10:00'].map((p) => (<tr key={p}><td>{p}</td><td>Mathematics</td><td>English</td><td>Biology</td></tr>))}</tbody></table></div>}
          </div>
        </div>
      </section>

      <section id="testimonials" className="section" style={{ background: 'var(--bg-subtle)' }}>
        <div className="section-head">
          <span className="section-eyebrow">From schools using EduNex</span>
          <h2>Trusted by staff who used to dread report-card week</h2>
        </div>
        <div className="testimonial-grid">
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="card testimonial-card">
              <Quote size={20} color="var(--brand-blue)" style={{ marginBottom: 14, opacity: 0.6 }} />
              <p className="quote">{t.quote}</p>
              <div className="testimonial-person">
                <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(t.name)}`} alt="" />
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13.5 }}>{t.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="section" style={{ paddingBottom: 60 }}>
        <div className="cta-band">
          <h2>Ready to see your own school's data in EduNex?</h2>
          <p>Sign in with any demo role — no setup, no credit card, dummy data preloaded.</p>
          <Link to="/login" className="btn" style={{ background: '#fff', color: 'var(--brand-ink)' }}>Explore the demo <ArrowRight size={16} /></Link>
        </div>
      </section>

      <section id="contact" className="section">
        <div className="section-head">
          <span className="section-eyebrow">Get in touch</span>
          <h2>Talk to us about your school</h2>
        </div>
        <div className="contact-grid">
          <div className="card" style={{ padding: 26 }}>
            <div className="field"><label>Full name</label><input placeholder="Jane Doe" /></div>
            <div className="field"><label>School email</label><input placeholder="you@school.ac.ke" /></div>
            <div className="field"><label>Message</label><textarea rows={4} placeholder="Tell us about your school…" /></div>
            <button className="btn btn-primary btn-block">Send message</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {CONTACT_ITEMS.map(({ icon: Icon, text }) => (
              <div key={text} className="card" style={{ padding: 18, display: 'flex', alignItems: 'center', gap: 14 }}>
                <div className="feature-icon" style={{ marginBottom: 0 }}><Icon size={18} /></div>
                <span style={{ fontSize: 14 }}>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="pub-footer">
        <div className="footer-grid">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <img src={logo} alt="EduNex" style={{ width: 30, height: 30, borderRadius: 8 }} />
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800 }}>EduNex</span>
            </div>
            <p style={{ fontSize: 13, maxWidth: 260 }}>Smarter schools, better futures. A complete academic management platform for modern institutions.</p>
          </div>
          <div><h4>Product</h4><a href="#features">Features</a><a href="#modules">Roles</a><a href="#screenshots">Product tour</a></div>
          <div><h4>Company</h4><a href="#testimonials">Testimonials</a><a href="#contact">Contact</a><Link to="/login">Log in</Link></div>
          <div><h4>Legal</h4><a href="#">Privacy policy</a><a href="#">Terms of service</a></div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 EduNex. All rights reserved.</span>
          <span>Demo data only — no real student records are used.</span>
        </div>
      </footer>
    </div>
  );
}
