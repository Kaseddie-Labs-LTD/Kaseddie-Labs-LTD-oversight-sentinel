import React, { useState, useEffect } from 'react';

export default function App() {
  const [currentView, setCurrentView] = useState('compliance');
  
  // Compliance Form State
  const [title, setTitle] = useState('');
  const [corridor, setCorridor] = useState('Kampala');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  // Worker Pulse-Check Monitoring State
  const [workersList, setWorkersList] = useState([]);
  const [loadingWorkers, setLoadingWorkers] = useState(false);

  // Fetch Live Worker Data when mounting HR view
  const fetchWorkerPulseChecks = async () => {
    setLoadingWorkers(true);
    try {
      const response = await fetch('/api/workers/pulse-check', { method: 'POST' });
      const data = await response.json();
      if (data.status === 'success') {
        setWorkersList(data.pulse_checks);
      }
    } catch (err) {
      console.error("Failed fetching trans-national tracking data stream:", err);
    } finally {
      setLoadingWorkers(false);
    }
  };

  useEffect(() => {
    if (currentView === 'hr') {
      fetchWorkerPulseChecks();
    }
  }, [currentView]);

  // Handle Pipeline Submission
  const handleSubmitLog = async (e) => {
    e.preventDefault();
    if (!title || !description) {
      setStatusMessage({ type: 'error', text: 'Please fill in all required operational fields.' });
      return;
    }

    setLoading(true);
    setStatusMessage({ type: 'info', text: 'Spreading transaction across multi-cloud assembly line...' });

    try {
      const response = await fetch('/api/compliance/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          corridor,
          metadata: {
            node_id: 'GLB-NODE-SIM',
            operator: 'Santiago System Controller'
          }
        })
      });

      const data = await response.json();

      if (response.ok) {
        setStatusMessage({
          type: 'success',
          text: `Pipeline Synced! ID: ${data.logId || 'Success'}. Gemini Summary: "${data.analysis?.summary || 'Processed'}"`
        });
        setTitle('');
        setDescription('');
      } else {
        setStatusMessage({ type: 'error', text: `Pipeline Halt: ${data.message || 'Unknown Error'}` });
      }
    } catch (err) {
      setStatusMessage({ type: 'error', text: `Network connection drop: ${err.message}` });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.appContainer}>
      {/* GLOBAL TELEMETRY HEADER */}
      <header style={styles.globalHeader}>
        <div style={styles.brandBlock}>
          <div style={styles.pulsePill}></div>
          <span style={styles.brandTitle}>KASEDDIE LABS LTD</span>
          <span style={styles.brandDivider}>|</span>
          <span style={styles.subProject}>OVERSIGHT SENTINEL</span>
        </div>
        <div style={styles.telemetryMetrics}>
          <div style={styles.metricItem}>
            <span style={styles.metricLabel}>ETHICAL IMPACT:</span>
            <span style={styles.metricValue}>$500,380</span>
          </div>
          <div style={styles.metricItem}>
            <span style={styles.metricLabel}>ACTIVE NODES:</span>
            <span style={styles.metricValue} style={{ color: '#00ffcc' }}>127</span>
          </div>
          <div style={styles.metricItem}>
            <span style={styles.metricLabel}>PIPELINE SYNC:</span>
            <span style={styles.metricValue} style={{ color: '#00ffcc' }}>99.9%</span>
          </div>
        </div>
      </header>

      <div style={styles.mainLayout}>
        {/* GLASSMORPHISM SIDEBAR NAVIGATION */}
                  <nav style={styles.sidebarNav}>
            <div style={styles.sidebarHeader}>COMMAND SECTIONS</div>
            <button 
              onClick={() => setCurrentView('compliance')} 
              style={{...styles.navButton, ...(currentView === 'compliance' ? styles.navButtonActive : {})}}
            >
              🛡️ Compliance Overwatch
            </button>
            <button 
              onClick={() => setCurrentView('partner')} 
              style={{...styles.navButton, ...(currentView === 'partner' ? styles.navButtonActive : {})}}
            >
              🤝 B2B Partner Hub
            </button>
            <button 
              onClick={() => setCurrentView('media')} 
              style={{...styles.navButton, ...(currentView === 'media' ? styles.navButtonActive : {})}}
            >
              🎨 Artisan Media Suite
            </button>
            <button 
              onClick={() => setCurrentView('hr')} 
              style={{...styles.navButton, ...(currentView === 'hr' ? styles.navButtonActive : {})}}
            >
              👥 HR Recruitment Portal
            </button>
            <button 
              onClick={() => setCurrentView('admin')} 
              style={{...styles.navButton, ...(currentView === 'admin' ? styles.navButtonActive : {})}}
            >
              ⚙️ Admin Dashboard
            </button>
            <div style={styles.sidebarFooter}>v2.0.0 Stable Build</div>
          </nav>

        {/* MAIN DYNAMIC VIEWPORT WORKSPACE */}
        <main style={styles.mainViewport}>
          {currentView === 'compliance' && (
            <div style={styles.viewCard}>
              <h2 style={styles.viewTitle}>🛡️ Operational Compliance Log Ingestion</h2>
              <p style={styles.viewSubtitle}>Submitting this record routes data into MongoDB, triggers Gemini, and updates Qdrant vectors.</p>
              <form onSubmit={handleSubmitLog} style={styles.formContainer}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Transaction Handshake Title *</label>
                  <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Corridor Salary Variance Flag" style={styles.input} />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Target Transit Corridor</label>
                  <select value={corridor} onChange={(e) => setCorridor(e.target.value)} style={styles.input}>
                    <option value="Kampala">Kampala Corridor</option>
                    <option value="Dubai">Dubai Corridor</option>
                    <option value="Doha">Qatar Corridor</option>
                    <option value="Europe">European Network</option>
                  </select>
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Operational Description & Text Context *</label>
                  <textarea rows="5" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Provide full description for AI extraction." style={styles.textarea} />
                </div>
                <button type="submit" disabled={loading} style={styles.submitBtn}>
                  {loading ? 'Processing Cloud High-Road...' : '⚡ Launch Ingestion Assembly Line'}
                </button>
              </form>
              {statusMessage && (
                <div style={{ ...styles.statusBox, ...(statusMessage.type === 'success' ? styles.statusSuccess : statusMessage.type === 'error' ? styles.statusError : styles.statusInfo) }}>
                  {statusMessage.text}
                </div>
              )}
            </div>
          )}

          {currentView === 'partner' && (
            <div style={styles.viewCard}>
              <h2 style={styles.viewTitle}>🤝 B2B Partner Hub</h2>
              <p style={styles.viewSubtitle}>System links for external ecosystem verification and commercial accounts.</p>
              <div style={styles.placeholderGrid}>
                <div style={styles.miniCard}><h4>Santiago System Node</h4><span style={{ color: '#00ffcc' }}>CONNECTED</span></div>
                <div style={styles.miniCard}><h4>Kaseddie Lab Vault</h4><span style={{ color: '#00ffcc' }}>ACTIVE</span></div>
              </div>
            </div>
          )}

          {currentView === 'media' && (
            <div style={styles.viewCard}>
              <h2 style={styles.viewTitle}>🎨 Artisan Media Suite</h2>
              <p style={styles.viewSubtitle}>Generate cinematic scripts and marketing flyers for commercial loops.</p>
              <div style={styles.miniCard}><h4>Marketing Distribution Engine</h4><p style={{ fontSize: '12px', margin: '5px 0 0 0', color: '#aaa' }}>WhatsApp and TikTok asset output configured.</p></div>
            </div>
          )}

          {currentView === 'hr' && (
            <div style={styles.viewCard}>
              <h2 style={styles.viewTitle}>👥 HR Recruitment Portal & Real-time GlobalPath Engine</h2>
              <p style={styles.viewSubtitle}>Monitoring real-time corridor safety limits and trans‑national worker pulse checks.</p>
              {loadingWorkers ? (
                <p style={{ color: '#94a3b8', fontSize: '14px' }}>Streaming active worker telemetry...</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
                  {workersList.map((worker, i) => (
                    <div key={i} style={{
                      ...styles.miniCard,
                      borderLeft: worker.status === 'CRITICAL' ? '4px solid #f87171' : '4px solid #34d399',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                    }}>
                      <div>
                        <h4 style={{ margin: '0 0 5px 0' }}>{worker.workerName} <span style={{ fontSize: '12px', color: '#64748b' }}>({worker.workerId})</span></h4>
                        <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>Silence Duration: <span style={{ fontFamily: 'monospace', color: '#fff' }}>{worker.daysSinceLastCheck} Days</span></p>
                      </div>
                      <span style={{
                        fontSize: '11px', fontWeight: 'bold', padding: '4px 10px', borderRadius: '4px',
                        backgroundColor: worker.status === 'CRITICAL' ? 'rgba(248,113,113,0.15)' : 'rgba(52,211,153,0.15)',
                        color: worker.status === 'CRITICAL' ? '#f87171' : '#34d399'
                      }}>
                        {worker.status === 'CRITICAL' ? '🚨 RED‑FLAG ALERT' : '✅ SECURE'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {currentView === 'admin' && (
            <div style={styles.viewCard}>
              <h2 style={styles.viewTitle}>⚙️ Admin System Cluster Controls</h2>
              <p style={styles.viewSubtitle}>Configure hardware adapters, diagnostic parameters, and cloud service credentials.</p>
              <div style={styles.miniCard}><h4>Active Environment Variables</h4><p style={{ fontSize: '11px', fontFamily: 'monospace', color: '#00ffcc', marginTop: '5px' }}>MONGO_URI, QDRANT_URL, VERTEX_API_KEY mapped locally.</p></div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

// PREMIUM INLINE GLASSMORPHISM COMPONENT STYLE TOKENS
const styles = {
  appContainer: { display: 'flex', flexDirection: 'column', height: '100vh', fontFamily: '"Inter", "Segoe UI", sans-serif', backgroundColor: '#0a0f1d', color: '#f1f5f9', overflow: 'hidden' },
  globalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 24px', height: '65px', backgroundColor: 'rgba(15, 23, 42, 0.9)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', backdropFilter: 'blur(10px)' },
  brandBlock: { display: 'flex', alignItems: 'center', gap: '10px' },
  pulsePill: { width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#00ffcc', boxShadow: '0 0 8px #00ffcc' },
  brandTitle: { fontWeight: '800', letterSpacing: '1px', color: '#ffffff' },
  brandDivider: { color: 'rgba(255,255,255,0.3)' },
  subProject: { color: '#94a3b8', fontSize: '13px', fontWeight: '600', letterSpacing: '0.5px' },
  telemetryMetrics: { display: 'flex', gap: '30px' },
  metricItem: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end' },
  metricLabel: { fontSize: '10px', color: '#64748b', fontWeight: '700', letterSpacing: '0.5px' },
  metricValue: { fontSize: '13px', fontWeight: '700', fontFamily: 'monospace', color: '#ffffff' },
  mainLayout: { display: 'flex', flex: 1, overflow: 'hidden' },
  sidebarNav: { width: '260px', backgroundColor: 'rgba(15, 23, 42, 0.6)', borderRight: '1px solid rgba(255, 255, 255, 0.05)', padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '8px' },
  sidebarHeader: { fontSize: '11px', fontWeight: '700', color: '#475569', letterSpacing: '1px', marginBottom: '10px', paddingLeft: '8px' },
  navButton: { display: 'block', width: '100%', textAlign: 'left', padding: '12px 14px', backgroundColor: 'transparent', border: 'none', borderRadius: '8px', color: '#94a3b8', cursor: 'pointer', fontSize: '13px', fontWeight: '600', transition: 'all 0.2s ease' },
  navButtonActive: { backgroundColor: 'rgba(255, 255, 255, 0.08)', color: '#ffffff', boxShadow: 'inset 4px 0 0 #00ffcc' },
  sidebarFooter: { marginTop: 'auto', fontSize: '11px', color: '#475569', textAlign: 'center', fontFamily: 'monospace' },
  mainViewport: { flex: 1, padding: '40px', backgroundColor: '#0f172a', overflowY: 'auto' },
  viewCard: { backgroundColor: 'rgba(30, 41, 59, 0.4)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '16px', padding: '32px', backdropFilter: 'blur(20px)', maxWidth: '850px' },
  viewTitle: { fontSize: '22px', fontWeight: '700', margin: '0 0 8px 0', color: '#ffffff' },
  viewSubtitle: { fontSize: '14px', color: '#94a3b8', lineHeight: '1.6', margin: '0 0 30px 0' },
  formContainer: { display: 'flex', flexDirection: 'column', gap: '20px' },
  formGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
  label: { fontSize: '12px', fontWeight: '600', color: '#cbd5e1' },
  input: { padding: '12px 16px', backgroundColor: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', color: '#ffffff', fontSize: '14px', outline: 'none' },
  textarea: { padding: '12px 16px', backgroundColor: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', color: '#ffffff', fontSize: '14px', outline: 'none', resize: 'vertical', fontFamily: 'inherit' },
  submitBtn: { padding: '14px', backgroundColor: '#00ffcc', border: 'none', borderRadius: '8px', color: '#0f172a', fontSize: '14px', fontWeight: '700', cursor: 'pointer', transition: 'transform 0.1s, opacity 0.2s' },
  statusBox: { marginTop: '24px', padding: '16px', borderRadius: '8px', fontSize: '13px', fontFamily: 'monospace', lineHeight: '1.5' },
  statusInfo: { backgroundColor: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.2)' },
  statusSuccess: { backgroundColor: 'rgba(52, 211, 153, 0.1)', color: '#34d399', border: '1px solid rgba(52, 211, 153, 0.2)' },
  statusError: { backgroundColor: 'rgba(248, 113, 113, 0.1)', color: '#f87171', border: '1px solid rgba(248, 113, 113, 0.2)' },
  placeholderGrid: { display: 'flex', gap: '20px', marginTop: '20px' },
  miniCard: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.4)', border: '1px solid rgba(255, 255, 255, 0.05)', padding: '20px', borderRadius: '12px' }
};
