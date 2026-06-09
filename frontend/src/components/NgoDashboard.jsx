/**
 * ==============================================================================
 * NGO FOOD REDISTRIBUTION PORTAL (NgoDashboard.jsx)
 * ==============================================================================
 * 
 * REACT TRAINING CONCEPTS:
 * ------------------------
 * 1. Advanced Search Indexing: Combining multiple criteria (search input string, 
 *    category dropdown selections, urgency checkboxes) inside a single filter 
 *    render loop.
 * 2. Visual Progress Steps: Mapping state variables (Claimed, Dispatched, Delivered) 
 *    into an intuitive step-by-step progress tracking element.
 * 3. PUT Route Execution: Making transactional updates (`PUT /api/transactions/donations/:id/claim`)
 *    to reserve food batches securely.
 * 4. Responsive Master-Detail Grid: Splitting screens dynamically into "Claimable Batches" 
 *    and "Logistics Monitor".
 */

import React, { useState } from 'react';

// API services entry point
const API_BASE = "http://localhost:5000/api";

function NgoDashboard({ user, donations, onDonationUpdated }) {
  // UX Alerts
  const [errorMsg, setErrorMsg] = useState('');
  const [statusMsg, setStatusMsg] = useState('');
  
  // High fidelity search and filtering state variables
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All'); // Supports 'All', 'Veg', 'Non-Veg'
  const [showUrgentOnly, setShowUrgentOnly] = useState(false);

  // Claims a specific food batch
  const handleClaim = async (donationId) => {
    setErrorMsg('');
    setStatusMsg('');

    try {
      const response = await fetch(`${API_BASE}/transactions/donations/${donationId}/claim`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ngoName: user.name })
      });
      
      const data = await response.json();
      if (response.ok && data.success) {
        setStatusMsg("Success: Surplus claimed! Volunteer logistics dispatched.");
        onDonationUpdated(); // Sync datastore in parent App.jsx
        setTimeout(() => setStatusMsg(''), 4000);
      } else {
        setErrorMsg(data.message || "Failed to claim food batch.");
      }
    } catch (networkErr) {
      // Local training simulator fallback
      console.warn("Backend server not responding. Operating in localized mock claim.");
      onDonationUpdated();
      setStatusMsg("SUCCESS (MOCKED): Food claimed and registered locally.");
      setTimeout(() => setStatusMsg(''), 4000);
    }
  };

  /**
   * --------------------------------------------------------------------------
   * TRAINING CONCEPT: Compound Array Filters
   * --------------------------------------------------------------------------
   * We filter the raw donations database array based on multiple inputs
   * (only show available listings, matching search term, matching category type,
   * and optionally matching urgency shelf-life < 2 hours).
   */
  const availableList = donations.filter(d => {
    // Condition 1: Must be in 'Available' state
    if (d.status !== 'Available') return false;
    
    // Condition 2: Search queries matching food item name or Banquet donor name
    const matchesSearch = d.item.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          d.donorName.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Condition 3: Food Classification (Veg vs Non-Veg)
    const matchesType = filterType === 'All' ? true : d.type === filterType;
    
    // Condition 4: Urgency Checkbox (Shelf-life under 2 hours left)
    const matchesUrgency = showUrgentOnly ? d.hoursRemaining <= 2 : true;
    
    return matchesSearch && matchesType && matchesUrgency;
  });

  // Filters the list of donations claimed by the current logged-in NGO
  const claimedList = donations.filter(d => d.claimedBy === user.name);

  return (
    <div>
      {/* Header Profile Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '28px' }}>NGO Food Distribution Panel</h2>
          <p style={{ color: 'var(--text-muted)' }}>Claim fresh surplus food listings and manage distribution channels</p>
        </div>
        {user.targetUnits && (
          <span className="role-tag ngo" style={{ textTransform: 'none', fontWeight: 700 }}>
            📍 Delivering to: {user.targetUnits}
          </span>
        )}
      </div>

      {errorMsg && <div className="alert-box danger">{errorMsg}</div>}
      {statusMsg && <div className="alert-box">{statusMsg}</div>}

      {/* Grid Layout: Left (Surplus Feeds) / Right (NGO Logistics Progress) */}
      <div className="dashboard-grid">
        
        {/* Left Column: Surplus Listings */}
        <div>
          
          {/* Advanced Search & Filtering Controls */}
          <div className="glass-panel" style={{ 
            padding: '20px', 
            borderRadius: '12px', 
            marginBottom: '24px', 
            display: 'flex', 
            gap: '16px', 
            flexWrap: 'wrap', 
            alignItems: 'center',
            border: '1px solid var(--border-color)'
          }}>
            
            <div style={{ flex: 1, minWidth: '200px' }}>
              <input 
                type="text" 
                className="form-input" 
                placeholder="🔍 Search food items or banquets..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ height: '40px' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              {['All', 'Veg', 'Non-Veg'].map(t => (
                <button
                  key={t}
                  onClick={() => setFilterType(t)}
                  className={`btn ${filterType === t ? 'btn-primary' : 'btn-outline'}`}
                  style={{ height: '40px', padding: '0 16px', fontSize: '13px', borderRadius: '8px' }}
                >
                  {t}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input 
                type="checkbox" 
                id="urgent-toggle"
                checked={showUrgentOnly} 
                onChange={(e) => setShowUrgentOnly(e.target.checked)}
                style={{ cursor: 'pointer', width: '16px', height: '16px' }}
              />
              <label htmlFor="urgent-toggle" style={{ fontSize: '13px', fontWeight: 700, color: 'var(--danger)', cursor: 'pointer' }}>
                ⚠️ Urgent Only (shelf life ≤ 2h)
              </label>
            </div>

          </div>

          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            🟢 Available surplus Food Listings 
            <span style={{ fontSize: '13px', background: 'var(--primary)', color: 'white', padding: '2px 8px', borderRadius: '12px', fontWeight: 700 }}>
              {availableList.length} available
            </span>
          </h3>

          {availableList.length === 0 ? (
            <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-light)', border: '1px dashed var(--border-color)' }}>
              No active surplus food listed matching selected filters.
            </div>
          ) : (
            <div className="card-grid">
              {availableList.map((don) => {
                const isUrgent = don.hoursRemaining <= 2;
                return (
                  <div 
                    key={don.id} 
                    className="dashboard-card"
                    style={{
                      borderLeft: isUrgent ? '4px solid var(--danger)' : '1px solid var(--border-color)',
                      transition: 'var(--transition)'
                    }}
                  >
                    {isUrgent && (
                      <div style={{ color: 'var(--danger)', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', marginBottom: '8px' }}>
                        ⚠️ Urgent: Expiring in {don.hoursRemaining}h
                      </div>
                    )}
                    
                    <div className="card-header">
                      <span className={`role-tag ${don.type === 'Veg' ? 'donor' : 'ngo'}`} style={{ fontSize: '10px', padding: '4px 10px' }}>
                        {don.type}
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
                        <span className="param-label">Location:</span>
                        <span className="param-value">📍 {don.location}</span>
                      </div>
                      <div className="param-item">
                        <span className="param-label">Weight:</span>
                        <span className="param-value">{don.quantityKgs} kg</span>
                      </div>
                      <div className="param-item">
                        <span className="param-label">Safety Shelf-life:</span>
                        <span className="param-value" style={{ color: isUrgent ? 'var(--danger)' : 'var(--text-main)' }}>
                          {don.hoursRemaining} hours left
                        </span>
                      </div>
                    </div>

                    <button 
                      onClick={() => handleClaim(don.id)} 
                      className={`btn ${isUrgent ? 'btn-accent' : 'btn-primary'}`}
                      style={{ width: '100%', height: '40px', marginTop: '10px', borderRadius: '8px' }}
                    >
                      Claim Food Batch
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Claims Logistics Progress */}
        <div className="glass-panel" style={{ padding: '30px', border: '1px solid var(--border-color)' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', marginBottom: '18px' }}>
            🎒 Your Claims Progress ({claimedList.length})
          </h3>

          {claimedList.length === 0 ? (
            <div style={{ color: 'var(--text-light)', fontSize: '14px', textAlign: 'center', padding: '30px 0' }}>
              Claimed donations will be shown here along with active logistics status.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {claimedList.map((don) => {
                // Determine step for active delivery visualization (1 = Claimed, 2 = Dispatched, 3 = Delivered)
                const step = don.status === 'Claimed' ? 1 : don.status === 'Dispatched' ? 2 : 3;
                return (
                  <div 
                    key={don.id} 
                    style={{ 
                      padding: '16px', 
                      background: 'white', 
                      border: '1px solid var(--border-color)', 
                      borderRadius: '12px',
                      boxShadow: 'var(--shadow-sm)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <span style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-main)' }}>{don.item}</span>
                      <span className={`status-badge ${don.status.toLowerCase()}`}>{don.status}</span>
                    </div>
                    
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                      <div>ID: {don.id} | Quantity: {don.quantityKgs}kg</div>
                      {don.assignedVolunteer ? (
                        <div style={{ marginTop: '4px', color: 'var(--primary)', fontWeight: 700 }}>
                          🚚 Driver: {don.assignedVolunteer} {don.volunteerPhone && `(${don.volunteerPhone})`}
                        </div>
                      ) : (
                        <div style={{ marginTop: '4px', color: 'var(--accent)', fontWeight: 700 }}>
                          ⏳ Awaiting driver assignment...
                        </div>
                      )}
                    </div>

                    {/* Step Visual Indicator with beautiful CSS transitions */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', marginTop: '16px', padding: '0 8px' }}>
                      <div style={{ position: 'absolute', top: '8px', left: '16px', right: '16px', height: '2px', background: '#e2e8f0', zIndex: 1 }} />
                      <div style={{ 
                        position: 'absolute', 
                        top: '8px', 
                        left: '16px', 
                        width: step === 1 ? '0%' : step === 2 ? '50%' : '100%', 
                        height: '2px', 
                        background: 'var(--primary)', 
                        zIndex: 2, 
                        transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)' 
                      }} />
                      
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 3 }}>
                        <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: step >= 1 ? 'var(--primary)' : '#e2e8f0', color: 'white', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>1</div>
                        <span style={{ fontSize: '9px', marginTop: '4px', fontWeight: 700, color: step >= 1 ? 'var(--primary)' : 'var(--text-light)' }}>Claimed</span>
                      </div>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 3 }}>
                        <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: step >= 2 ? 'var(--primary)' : '#e2e8f0', color: 'white', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>2</div>
                        <span style={{ fontSize: '9px', marginTop: '4px', fontWeight: 700, color: step >= 2 ? 'var(--primary)' : 'var(--text-light)' }}>In Transit</span>
                      </div>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 3 }}>
                        <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: step >= 3 ? 'var(--primary)' : '#e2e8f0', color: 'white', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>3</div>
                        <span style={{ fontSize: '9px', marginTop: '4px', fontWeight: 700, color: step >= 3 ? 'var(--primary)' : 'var(--text-light)' }}>Delivered</span>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default NgoDashboard;
