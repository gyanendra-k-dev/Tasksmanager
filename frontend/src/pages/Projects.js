import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import Modal from '../components/Modal';

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}) : 'No due date';
const isOverdue = (d) => d && new Date(d) < new Date();

const COLORS = ['#4f46e5','#0891b2','#059669','#d97706','#dc2626','#7c3aed','#db2777','#0284c7'];
const colorFor = (str) => { let h=0; for(let c of (str||'')) h=(h<<5)-h+c.charCodeAt(0); return COLORS[Math.abs(h)%COLORS.length]; };

const Projects = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name:'', description:'', dueDate:'', status:'in-progress' });

  const load = () => api.get('/projects').then(r => setProjects(r.data)).finally(()=>setLoading(false));
  useEffect(() => { load(); }, []);

  const set = (k, v) => setForm(f => ({...f, [k]: v}));

  const handleCreate = async (e) => {
    e.preventDefault(); setError(''); setSaving(true);
    try {
      await api.post('/projects', form);
      setOpen(false); setForm({name:'',description:'',dueDate:'',status:'in-progress'}); load();
    } catch(err) { setError(err.response?.data?.error||'Failed to create project'); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="loading-screen"><div className="spinner"/></div>;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Projects</h1>
        {user?.role==='admin' && <button className="btn btn-primary" onClick={()=>setOpen(true)}>+ New Project</button>}
      </div>

      {!projects.length ? (
        <div className="empty-state">
          <div className="empty-icon">▦</div>
          <div style={{fontWeight:500,marginBottom:8}}>No projects yet</div>
          {user?.role==='admin' && <button className="btn btn-primary" onClick={()=>setOpen(true)}>Create your first project</button>}
        </div>
      ) : (
        <div className="grid-auto">
          {projects.map(p => {
            const pts = p.Tasks || [];
            const done = pts.filter(t=>t.status==='completed').length;
            const pct = pts.length ? Math.round(done/pts.length*100) : 0;
            const od = pts.filter(t=>t.status!=='completed'&&isOverdue(t.dueDate)).length;
            const col = colorFor(p.id);
            return (
              <div className="project-card" key={p.id} onClick={()=>navigate(`/projects/${p.id}`)}>
                <div className="project-icon" style={{background:col+'20'}}>
                  <span style={{fontSize:18}}>▦</span>
                </div>
                <div style={{fontSize:15,fontWeight:600,marginBottom:4}}>{p.name}</div>
                <div className="text-secondary text-sm" style={{marginBottom:14,minHeight:36}}>{p.description||'No description'}</div>
                <div className="progress-bar" style={{marginBottom:8}}><div className="progress-fill" style={{width:`${pct}%`,background:col}}/></div>
                <div className="flex-between">
                  <span className="text-secondary text-sm">{done}/{pts.length} tasks · {pct}%</span>
                  {od ? <span className="badge badge-overdue">{od} overdue</span> :
                   isOverdue(p.dueDate) ? <span className="badge badge-overdue">Due {fmtDate(p.dueDate)}</span> :
                   <span className="text-secondary text-sm">Due {fmtDate(p.dueDate)}</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal open={open} onClose={()=>setOpen(false)} title="New Project">
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleCreate}>
          <div className="form-group"><label>Project Name *</label><input type="text" value={form.name} onChange={e=>set('name',e.target.value)} placeholder="e.g. Website Redesign" required/></div>
          <div className="form-group"><label>Description</label><textarea rows={3} value={form.description} onChange={e=>set('description',e.target.value)} placeholder="What's this project about?"/></div>
          <div className="grid-2">
            <div className="form-group"><label>Due Date</label><input type="date" value={form.dueDate} onChange={e=>set('dueDate',e.target.value)}/></div>
            <div className="form-group"><label>Status</label><select value={form.status} onChange={e=>set('status',e.target.value)}><option value="in-progress">In Progress</option><option value="completed">Completed</option></select></div>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn" onClick={()=>setOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving?'Creating...':'Create Project'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Projects;
