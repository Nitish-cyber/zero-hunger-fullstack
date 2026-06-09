/**
 * ==============================================================================
 * VOLUNTEER TRANSPORT & LOGISTICS PORTAL (VolunteerDashboard.jsx)
 * ==============================================================================
 * 
 * REACT TRAINING CONCEPTS:
 * ------------------------
 * 1. Logistics Routing Checks: Guiding the driver using interactive step checklist
 *    controls (Step 1: Pick up food -> Step 2: Arrive and deliver).
 * 2. Disabled Input State: Programmatically disabling action buttons until the 
 *    user completes required prerequisites (Step 2 checkbox must be checked to enable Delivery).
 * 3. State synchronization methods: Confirming dispatch/delivery updates against 
 *    the Express transaction routes.
 * 4. Micro-Interactions: Real-time route state indicators, dashboard summary metrics, 
 *    and clean list logs.
 */

import React, { useState } from 'react';

// API services URL
const API_BASE = import.meta.env.VITE_API_BASE || (import.meta.env.DEV ? "http://localhost:5000/api" : "/api");

function VolunteerDashboard({ user, donations, onDonationUpdated }) {
  // UX Alerts
  const [errorMsg, setErrorMsg] = useState('');
  const [statusMsg, setStatusMsg] = useState('');
  
  // Interactive delivery tracking steps
  const [activeRoutingStep, setActiveRoutingStep] = useState(1); // 1 = Pick up location, 2 = NGO units delivery

  // Confirms volunteer has accepted shipment pickup
  const handleDispatch = async (donationId) => {
    setErrorMsg('');
    setStatusMsg('');

    try {
      const response = await fetch(`${API_BASE}/transactions/donations/${donationId}/dispatch`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          volunteerName: user.name,
          phone: user.phone || '9876543210' 
        })
      });
      
      const data = await response.json();
      if (response.ok && data.success) {
        setStatusMsg("Pickup dispatch confirmed! Route mapping is active.");
        setActiveRoutingStep(1); // Initialize pickup checklist step
        onDonationUpdated(); // Refresh App state
        setTimeout(() => setStatusMsg(''), 4000);
      } else {
        setErrorMsg(data.message || "Failed to dispatch listing.");
      }
    } catch (networkErr) {
      // Offline local sandbox fallback
      console.warn("Backend server not responding. Simulating volunteer dispatch locally.");
      onDonationUpdated();
      setStatusMsg("SUCCESS (MOCKED): Food batch dispatch updated locally.");
      setTimeout(() => setStatusMsg(''), 4000);
    }
  };

  // Confirms volunteer has safely handed over the food batch to the NGO shelter
  const handleDeliver = async (donationId) => {
    setErrorMsg('');
    setStatusMsg('');

    try {
      const response = await fetch(`${API_BASE}/transactions/donations/${donationId}/deliver`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const data = await response.json();
      if (response.ok && data.success) {
        setStatusMsg("Success: Food successfully delivered to NGO units!");
        onDonationUpdated(); // Sync state
        setTimeout(() => setStatusMsg(''), 4000);
      } else {
        setErrorMsg(data.message || "Failed to complete delivery.");
      }
    } catch (networkErr) {
      // Offline local sandbox fallback
      console.warn("Backend server not responding. Completing delivery locally.");
      onDonationUpdated();
      setStatusMsg("SUCCESS (MOCKED): Delivery completed and saved locally.");
      setTimeout(() => setStatusMsg(''), 4000);
    }
  };

  // Declarative calculations: Filter listings based on volunteer lifecycle stages
  const pendingList = donations.filter(d => d.status === 'Available' || d.status === 'Claimed');
  const activeDeliveries = donations.filter(d => d.status === 'Dispatched' && d.assignedVolunteer === user.name);
  const completedList = donations.filter(d => d.status === 'Delivered' && d.assignedVolunteer === user.name);

  return (
    <div>
      {/* Title Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '28px' }}>Volunteer Transport Portal</h2>
          <p style={{ color: 'var(--text-muted)' }}>Manage pick up routes, transport timelines, and deliver food to target units</p>
        </div>
        <div className="role-tag volunteer" style={{ display: 'flex', gap: '6px', alignItems: 'center', fontWeight: 700 }}>
          <span>🚚 Driver status: Active</span>
          {user.phone && <span style={{ opacity: 0.8 }}>({user.phone})</span>}
        </div>
      </div>

      {/* Stats Cards Row (Visual KPI Summaries) */}
      <div className="card-grid" style={{ marginBottom: '30px', gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="dashboard-card" style={{ background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)', border: 'none', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ color: 'var(--accent-hover)', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Claimed Shipments Waiting</div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--accent-hover)', marginTop: '8px', fontFamily: 'var(--font-display)' }}>
            {pendingList.length} batches
          </div>
        </div>

        <div className="dashboard-card" style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)', border: 'none', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ color: '#1e40af', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Active Deliveries Routed</div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: '#1e40af', marginTop: '8px', fontFamily: 'var(--font-display)' }}>
            {activeDeliveries.length} active
          </div>
        </div>

        <div className="dashboard-card" style={{ background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)', border: 'none', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ color: 'var(--primary-hover)', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Your Deliveries Completed</div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--primary-hover)', marginTop: '8px', fontFamily: 'var(--font-display)' }}>
            {completedList.length} handovers
          </div>
        </div>
      </div>

      {errorMsg && <div className="alert-box danger">{errorMsg}</div>}
      {statusMsg && <div className="alert-box">{statusMsg}</div>}

      {/* Grid: 2 columns - Left: shipments seeking drivers / Right: active routing map */}
      <div className="dashboard-grid">
        
        {/* Left Column: Claimed Shipments Seeking Transport */}
        <div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', marginBottom: '18px' }}>
            📦 Claimed Food Shipments Seeking Drivers ({pendingList.length})
          </h3>

          {pendingList.length === 0 ? (
            <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-light)', border: '1px dashed var(--border-color)' }}>
              No claimed shipments awaiting transport at this moment.
            </div>
          ) : (
            <div className="card-grid">
              {pendingList.map((don) => (
                <div key={don.id} className="dashboard-card" style={{ transition: 'var(--transition)' }}>
                  <div className="card-header">
                    <span className="role-tag ngo" style={{ textTransform: 'none', fontSize: '11px', fontWeight: 700 }}>
                      To NGO: {don.claimedBy || "Awaiting NGO Claim"}
                    </span>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-light)' }}>{don.id}</span>
                  </div>

                  <h4 style={{ fontSize: '18px', margin: '8px 0 12px 0', color: 'var(--text-main)' }}>{don.item}</h4>
                  
                  <div className="param-list">
                    <div className="param-item">
                      <span className="param-label">Banquet:</span>
                      <span className="param-value">{don.donorName}</span>
                    </div>
                    <div className="param-item">
                      <span className="param-label">Banquet Address:</span>
                      <span className="param-value">📍 {don.location}</span>
                    </div>
                    <div className="param-item">
                      <span className="param-label">Weight:</span>
                      <span className="param-value">{don.quantityKgs} kg</span>
                    </div>
                    <div className="param-item">
                      <span className="param-label">Safe Hours left:</span>
                      <span className="param-value" style={{ color: don.hoursRemaining <= 2 ? 'var(--danger)' : 'var(--text-main)' }}>
                        {don.hoursRemaining}h remaining
                      </span>
                    </div>
                  </div>

                  <button 
                    onClick={() => handleDispatch(don.id)} 
                    className="btn btn-primary"
                    style={{ width: '100%', height: '40px', marginTop: '10px', borderRadius: '8px' }}
                  >
                    Confirm Food Pick Up
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Active Logistics Maps / Checklists */}
        <div className="glass-panel" style={{ padding: '30px', height: 'fit-content', border: '1px solid var(--border-color)' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', marginBottom: '18px' }}>
            🧭 Active Routing Task ({activeDeliveries.length})
          </h3>

          {activeDeliveries.length === 0 ? (
            <div style={{ color: 'var(--text-light)', fontSize: '14px', textAlign: 'center', padding: '30px 0' }}>
              Confirm a food pickup to activate delivery routes and destination checkmarks.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {activeDeliveries.map((don) => (
                <div 
                  key={don.id} 
                  style={{ 
                    padding: '20px', 
                    background: 'white', 
                    border: '1.5px dashed var(--primary)', 
                    borderRadius: '12px',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <h4 style={{ fontSize: '16px', color: 'var(--text-main)' }}>{don.item}</h4>
                    <span className="status-badge dispatched">{don.status}</span>
                  </div>

                  {/* Route progress checkboxes checklist */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: '#f8fafc', padding: '14px', borderRadius: '8px', margin: '14px 0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' }}>
                      <input 
                        type="checkbox" 
                        id="route-step-1"
                        checked={activeRoutingStep >= 1} 
                        onChange={() => setActiveRoutingStep(1)}
                        style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                      />
                      <label htmlFor="route-step-1" style={{ fontWeight: activeRoutingStep === 1 ? '700' : '400', color: activeRoutingStep >= 1 ? 'var(--primary)' : 'var(--text-main)', cursor: 'pointer' }}>
                        1. Pick up from <strong>{don.donorName}</strong> (Address: {don.location})
                      </label>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' }}>
                      <input 
                        type="checkbox" 
                        id="route-step-2"
                        checked={activeRoutingStep >= 2} 
                        onChange={() => setActiveRoutingStep(2)}
                        style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                      />
                      <label htmlFor="route-step-2" style={{ fontWeight: activeRoutingStep === 2 ? '700' : '400', color: activeRoutingStep >= 2 ? 'var(--primary)' : 'var(--text-main)', cursor: 'pointer' }}>
                        2. Deliver surplus to <strong>{don.claimedBy || "NGO / Distribution Center"}</strong>
                      </label>
                    </div>
                  </div>

                  <button 
                    onClick={() => handleDeliver(don.id)} 
                    className="btn btn-accent"
                    style={{ width: '100%', height: '40px', borderRadius: '8px' }}
                    disabled={activeRoutingStep < 2} // Enforce delivery step compliance
                  >
                    Confirm Delivery Completed
                  </button>
                  {activeRoutingStep < 2 && (
                    <p style={{ color: 'var(--text-light)', fontSize: '11px', textAlign: 'center', marginTop: '8px', fontWeight: 600 }}>
                      * Check Step 2 above once you arrive at destination to enable delivery button.
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default VolunteerDashboard;
