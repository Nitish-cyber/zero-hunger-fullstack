/**
 * ==============================================================================
 * CENTRAL ADMINISTRATOR AUDIT COMPONENT (AdminDashboard.jsx)
 * ==============================================================================
 * 
 * REACT TRAINING CONCEPTS:
 * ------------------------
 * 1. Global KPI Metrics: Filtering lists globally to extract core platform metrics 
 *    (Total Listings, Active Batches, Completed Shipments, and Warnings).
 * 2. Nested Sub-Tab Navigation: Toggling layout tables (`Global Transaction Audit Matrix` 
 *    vs `Registered Actors Directory`) using simple tab states.
 * 3. Log Shell Emulator: Creating an interactive logging viewport styled 
 *    like a server terminal console for high fidelity visuals.
 * 4. Inline Search Filters: Real-time search matching over multi-field log strings.
 */

import React, { useState } from 'react';

function AdminDashboard({ user, donations, logs }) {
  // Tab controller state
  const [activeTab, setActiveTab] = useState('transactions'); // Supports 'transactions' or 'users'
  
  // Console logging search term state
  const [logSearch, setLogSearch] = useState('');

  // 1. Calculate global analytics values dynamically
  const totalDonated = donations.length;
  const activeCount = donations.filter(d => d.status === 'Available').length;
  const deliveredCount = donations.filter(d => d.status === 'Delivered').length;
  const urgentCount = donations.filter(d => d.status === 'Available' && d.hoursRemaining <= 2).length;

  // Pre-seeded actor accounts list representing the simulated users collection
  const preseededUsers = [
    { id: "USR-001", name: "Grand Taj Banquet Noida", email: "donor@zerohunger.org", role: "Donor", special: "FSSAI Licensed" },
    { id: "USR-002", name: "Feed The Children Foundation NGO", email: "ngo@zerohunger.org", role: "NGO", special: "Target Noida Units" },
    { id: "USR-003", name: "Ravi Kumar Logistics", email: "volunteer@zerohunger.org", role: "Volunteer", special: "Logistics Driver" },
    { id: "USR-004", name: "Metro Commercial Kitchens", email: "vendor@zerohunger.org", role: "Vendor", special: "Commercial Kitchen" },
    { id: "USR-005", name: "System Administrator Core", email: "admin@zerohunger.org", role: "Admin", special: "Superuser access" }
  ];

  // Inline array filtering based on the console log search input
  const filteredLogs = logs.filter(log => 
    log.activity.toLowerCase().includes(logSearch.toLowerCase()) ||
    log.timestamp.toLowerCase().includes(logSearch.toLowerCase())
  );

  return (
    <div>
      {/* Title Header */}
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '28px' }}>Platform Administrator Dashboard</h2>
        <p style={{ color: 'var(--text-muted)' }}>Global overview of food redistribution metrics, audit logs, and allocations</p>
      </div>

      {/* KPI Cards Row (Premium Analytics Metrics) */}
      <div className="card-grid" style={{ marginBottom: '30px', gridTemplateColumns: 'repeat(4, 1fr)' }}>
        
        <div className="dashboard-card" style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)', border: 'none', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Registered Listings</div>
          <div style={{ fontSize: '38px', fontWeight: 800, marginTop: '8px', color: 'var(--text-main)', fontFamily: 'var(--font-display)' }}>
            {totalDonated}
          </div>
        </div>

        <div className="dashboard-card" style={{ background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)', border: 'none', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ color: 'var(--primary-hover)', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Active Available Surplus</div>
          <div style={{ fontSize: '38px', fontWeight: 800, marginTop: '8px', color: 'var(--primary-hover)', fontFamily: 'var(--font-display)' }}>
            {activeCount}
          </div>
        </div>

        <div className="dashboard-card" style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)', border: 'none', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ color: '#1e40af', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Redistributions Completed</div>
          <div style={{ fontSize: '38px', fontWeight: 800, marginTop: '8px', color: '#1e40af', fontFamily: 'var(--font-display)' }}>
            {deliveredCount}
          </div>
        </div>

        <div className="dashboard-card" style={{ background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)', border: 'none', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ color: '#991b1b', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Urgent Action Warnings</div>
          <div style={{ fontSize: '38px', fontWeight: 800, marginTop: '8px', color: '#991b1b', fontFamily: 'var(--font-display)' }}>
            {urgentCount}
          </div>
        </div>

      </div>

      {/* Grid: 2 columns - Left: Datatables (Audit/Actors) | Right: Live Shell log console */}
      <div className="dashboard-grid" style={{ gridTemplateColumns: '1fr 420px' }}>
        
        {/* Left Panel: Global Tables Matrix */}
        <div>
          {/* Sub-Tabs switching header */}
          <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', borderBottom: '1.5px solid var(--border-color)', paddingBottom: '10px' }}>
            <button
              onClick={() => setActiveTab('transactions')}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '16px',
                fontWeight: 700,
                color: activeTab === 'transactions' ? 'var(--primary)' : 'var(--text-muted)',
                cursor: 'pointer',
                borderBottom: activeTab === 'transactions' ? '2.5px solid var(--primary)' : '2.5px solid transparent',
                paddingBottom: '8px',
                fontFamily: 'var(--font-display)',
                transition: 'var(--transition)'
              }}
            >
              📊 Global Transaction Audit Matrix
            </button>
            <button
              onClick={() => setActiveTab('users')}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '16px',
                fontWeight: 700,
                color: activeTab === 'users' ? 'var(--primary)' : 'var(--text-muted)',
                cursor: 'pointer',
                borderBottom: activeTab === 'users' ? '2.5px solid var(--primary)' : '2.5px solid transparent',
                paddingBottom: '8px',
                fontFamily: 'var(--font-display)',
                transition: 'var(--transition)'
              }}
            >
              👥 Registered Actors Directory
            </button>
          </div>
          
          {activeTab === 'transactions' ? (
            donations.length === 0 ? (
              <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-light)', border: '1px dashed var(--border-color)' }}>
                No transactions currently recorded.
              </div>
            ) : (
              <div className="audit-table-wrapper">
                <table className="audit-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Food Batch</th>
                      <th>Donor Name</th>
                      <th>Claimed NGO</th>
                      <th>Volunteer Logistics</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {donations.map((don) => (
                      <tr key={don.id} style={{ transition: 'var(--transition)' }}>
                        <td style={{ fontWeight: 700, color: 'var(--text-muted)' }}>{don.id}</td>
                        <td style={{ fontWeight: 700 }}>{don.item} ({don.quantityKgs}kg)</td>
                        <td>{don.donorName}</td>
                        <td>{don.claimedBy || <span style={{ color: 'var(--text-light)', fontSize: '12px', fontStyle: 'italic' }}>Awaiting claim</span>}</td>
                        <td>{don.assignedVolunteer || <span style={{ color: 'var(--text-light)', fontSize: '12px', fontStyle: 'italic' }}>Unassigned</span>}</td>
                        <td>
                          <span className={`status-badge ${don.status.toLowerCase()}`}>{don.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          ) : (
            <div className="audit-table-wrapper">
              <table className="audit-table">
                <thead>
                  <tr>
                    <th>User ID</th>
                    <th>Full Name / Organization</th>
                    <th>Email Address</th>
                    <th>Actor Role</th>
                    <th>Special Attributes</th>
                  </tr>
                </thead>
                <tbody>
                  {preseededUsers.map((u) => (
                    <tr key={u.id} style={{ transition: 'var(--transition)' }}>
                      <td style={{ fontWeight: 700, color: 'var(--text-muted)' }}>{u.id}</td>
                      <td style={{ fontWeight: 700 }}>{u.name}</td>
                      <td>{u.email}</td>
                      <td>
                        <span className={`role-tag ${u.role.toLowerCase()}`} style={{ fontSize: '10px', padding: '4px 10px' }}>
                          {u.role}
                        </span>
                      </td>
                      <td style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>{u.special}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Panel: High-Fidelity Shell Console Viewer */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', height: 'fit-content', border: '1px solid var(--border-color)' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', marginBottom: '6px', color: 'var(--text-main)' }}>
            🪵 Central API Action Register
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginBottom: '16px' }}>
            Real-time monitor tracking incoming client claims, volunteer dispatches, and audit requests.
          </p>

          <div style={{ marginBottom: '16px' }}>
            <input 
              type="text" 
              className="form-input" 
              placeholder="🔍 Filter log activities..." 
              value={logSearch}
              onChange={(e) => setLogSearch(e.target.value)}
              style={{ height: '36px', fontSize: '13px', borderRadius: '8px' }}
            />
          </div>

          {/* Terminal Console Viewport */}
          <div style={{ 
            flex: 1, 
            background: '#0f172a', 
            color: '#34d399', 
            fontFamily: '"SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace', 
            fontSize: '11px', 
            padding: '16px', 
            borderRadius: '10px', 
            maxHeight: '400px', 
            minHeight: '280px',
            overflowY: 'auto',
            boxShadow: 'inset 0 2px 8px rgba(0, 0, 0, 0.8)',
            lineHeight: '1.5'
          }}>
            {filteredLogs.length === 0 ? (
              <span style={{ color: '#64748b' }}>// No matching log activity registered on terminal...</span>
            ) : (
              filteredLogs.map((log, index) => (
                <div key={index} style={{ marginBottom: '8px', borderBottom: '1px solid #1e293b', paddingBottom: '6px' }}>
                  <span style={{ color: '#64748b' }}>[{log.timestamp}]</span> {log.activity}
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default AdminDashboard;
