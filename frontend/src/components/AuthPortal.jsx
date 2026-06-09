/**
 * ==============================================================================
 * AUTHENTICATION PORTAL COMPONENT (AuthPortal.jsx)
 * ==============================================================================
 * 
 * REACT TRAINING CONCEPTS:
 * ------------------------
 * 1. Dual Mode Controller: Toggling between Login and Register views with a single boolean state (`isLogin`).
 * 2. Controlled Input Binding: Binding form `<input>` values directly to React `useState` variables to keep 
 *    the React State and the User Interface perfectly synchronized.
 * 3. Quick-Select Presets: Exposing pre-seeded training accounts that pre-fill forms to accelerate class testing.
 * 4. Graceful Local Fallback: Integrating built-in mock logins so frontend developers can practice UI mechanics 
 *    even when offline/without a backend connection.
 */

import React, { useState } from 'react';

// Backend integration root URL
const API_BASE = import.meta.env.VITE_API_BASE || (import.meta.env.DEV ? "http://localhost:5000/api" : "/api");

// Standard pre-seeded sandbox credentials for students to test each dashboard instantly
const PRESEEDED_ACCOUNTS = [
  { role: "Donor", email: "donor@zerohunger.org", label: "Banquet Donor Portal", desc: "List surplus fresh food", icon: "🏢" },
  { role: "NGO", email: "ngo@zerohunger.org", label: "NGO Distribution Hub", desc: "Claim listings for shelters", icon: "🎒" },
  { role: "Volunteer", email: "volunteer@zerohunger.org", label: "Volunteer Logistics", desc: "Accept transport routes", icon: "🚚" },
  { role: "Vendor", email: "vendor@zerohunger.org", label: "Vendor Wastage Center", desc: "Publish discount bundles", icon: "🏪" },
  { role: "Admin", email: "admin@zerohunger.org", label: "Admin Core Audit", desc: "Monitor platform metrics", icon: "⚙️" }
];

function AuthPortal({ onAuthSuccess }) {
  // Toggle states
  const [isLogin, setIsLogin] = useState(true);
  
  // Standard fields
  const [role, setRole] = useState('Donor');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('donor@zerohunger.org');
  const [password, setPassword] = useState('password123');
  
  // Role-specific customized registration attributes
  const [hasFssai, setHasFssai] = useState(true);
  const [licenseId, setLicenseId] = useState('');
  const [targetUnits, setTargetUnits] = useState('');
  const [phone, setPhone] = useState('');
  
  // UX Alerts
  const [errorMsg, setErrorMsg] = useState('');
  const [statusMsg, setStatusMsg] = useState('');

  // Pre-fills login forms with preseeded credentials
  const selectPreseeded = (acc) => {
    setEmail(acc.email);
    setPassword('password123');
    setRole(acc.role);
    setStatusMsg(`Quick authorized: ${acc.role} selected. Click submit below!`);
    
    // Auto clear alert
    setTimeout(() => setStatusMsg(''), 2000);
  };

  // Handles registration/login forms submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevents standard browser page reload behavior
    setErrorMsg('');
    setStatusMsg('');
    
    // Basic verification check
    if (!email || !password || (!isLogin && !name)) {
      setErrorMsg("Please fill out all required fields.");
      return;
    }

    const payload = isLogin 
      ? { email, password }
      : { 
          name, 
          email, 
          password, 
          role,
          // Conditionally submit optional fields depending on the registered role
          hasFssai: role === 'Donor' ? hasFssai : undefined,
          licenseId: role === 'Donor' && hasFssai ? licenseId : undefined,
          targetUnits: role === 'NGO' ? targetUnits : undefined,
          phone: role === 'Volunteer' ? phone : undefined
        };

    const endpoint = isLogin ? `${API_BASE}/auth/login` : `${API_BASE}/auth/register`;

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        // Authenticate session in parent App.jsx
        onAuthSuccess(data.token, data.user);
      } else {
        setErrorMsg(data.message || "An exception occurred during verification.");
      }
    } catch (networkErr) {
      // Local Sandbox Fallback Simulator: Activates offline so students can learn without network setup
      console.warn("Backend server not responding. Operating in localized browser memory validation.");
      
      if (isLogin) {
        // Mock authorization checks matching preseeded seeds in database_sim.js
        if (email.toLowerCase() === 'donor@zerohunger.org' && password === 'password123') {
          onAuthSuccess("mock_jwt", { id: "USR-001", name: "Grand Taj Banquet Noida", email, role: "Donor", hasFssai: true, licenseId: "FSSAI-123456789" });
        } else if (email.toLowerCase() === 'ngo@zerohunger.org' && password === 'password123') {
          onAuthSuccess("mock_jwt", { id: "USR-002", name: "Feed The Children Foundation NGO", email, role: "NGO", targetUnits: "Noida Sector 62" });
        } else if (email.toLowerCase() === 'volunteer@zerohunger.org' && password === 'password123') {
          onAuthSuccess("mock_jwt", { id: "USR-003", name: "Ravi Kumar Logistics", email, role: "Volunteer", phone: "9876543210" });
        } else if (email.toLowerCase() === 'vendor@zerohunger.org' && password === 'password123') {
          onAuthSuccess("mock_jwt", { id: "USR-004", name: "Metro Commercial Kitchens", email, role: "Vendor" });
        } else if (email.toLowerCase() === 'admin@zerohunger.org' && password === 'password123') {
          onAuthSuccess("mock_jwt", { id: "USR-005", name: "System Administrator Core", email, role: "Admin" });
        } else {
          setErrorMsg("Incorrect email or password credentials. Tip: Use a quick-select option on the left panel!");
        }
      } else {
        // Simulate account creation instantly
        onAuthSuccess("mock_jwt", { id: `USR-${Math.floor(100 + Math.random() * 900)}`, name, email, role });
      }
    }
  };

  return (
    <div className="auth-card" style={{ maxWidth: '680px', width: '100%', border: '1px solid var(--border-color)', transition: 'var(--transition)' }}>
      <div className="auth-header">
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
          <div className="brand-logo" style={{ width: '54px', height: '54px', fontSize: '26px' }}>ØH</div>
        </div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '32px' }}>
          Zero Hunger Platform
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>
          {isLogin ? "Sign in to manage surplus food allocations" : "Create a new actor account on the redistribution network"}
        </p>
      </div>

      {errorMsg && <div className="alert-box danger">{errorMsg}</div>}
      {statusMsg && <div className="alert-box">{statusMsg}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: isLogin ? '270px 1fr' : '1fr', gap: '30px' }}>
        
        {/* Left Column (Only for Login): Premium Quick Preseeded Accounts Selection Widget */}
        {isLogin && (
          <div style={{ borderRight: '1px solid var(--border-color)', paddingRight: '20px' }}>
            <h4 style={{ 
              fontSize: '11px', 
              fontWeight: 700, 
              color: 'var(--text-light)', 
              textTransform: 'uppercase', 
              letterSpacing: '0.08em', 
              marginBottom: '14px' 
            }}>
              Quick-Select Portal
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {PRESEEDED_ACCOUNTS.map((acc) => {
                const isActive = email.toLowerCase() === acc.email.toLowerCase();
                return (
                  <div 
                    key={acc.role} 
                    onClick={() => selectPreseeded(acc)}
                    style={{
                      padding: '12px',
                      background: isActive ? 'var(--primary-light)' : '#f8fafc',
                      border: isActive ? '1.5px solid var(--primary)' : '1.5px solid var(--border-color)',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      transform: isActive ? 'scale(1.02)' : 'none',
                      boxShadow: isActive ? 'var(--shadow-sm)' : 'none',
                      transition: 'var(--transition)'
                    }}
                    title={`Pre-fill inputs for the ${acc.role} sandbox`}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '13px', color: isActive ? 'var(--primary-hover)' : 'var(--text-main)' }}>
                      <span style={{ fontSize: '16px' }}>{acc.icon}</span>
                      <span>{acc.role}</span>
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>
                      {acc.desc}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Right Column: Controlled Authentication Form */}
        <div>
          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <div className="form-group">
                <label className="form-label">Full Name / Organization Name</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g., Grand Palace Hotel" 
                  value={name}
                  onChange={(e) => setName(e.target.value)} 
                  required 
                />
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input 
                type="email" 
                className="form-input" 
                placeholder="e.g., donor@zerohunger.org" 
                value={email}
                onChange={(e) => setEmail(e.target.value)} 
                required 
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input 
                type="password" 
                className="form-input" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)} 
                required 
              />
            </div>

            {!isLogin && (
              <div className="form-group">
                <label className="form-label">Select Your Redistribution Portal</label>
                <select 
                  className="form-input" 
                  value={role} 
                  onChange={(e) => setRole(e.target.value)}
                  style={{ padding: '0 12px', cursor: 'pointer' }}
                >
                  <option value="Donor">Donor Portal</option>
                  <option value="NGO">NGO Portal</option>
                  <option value="Volunteer">Volunteer Portal</option>
                  <option value="Vendor">Vendor Discount Portal</option>
                  <option value="Admin">Admin Portal</option>
                </select>
              </div>
            )}

            {/* Role-Specific Secondary Fields (Registration Only) */}
            {!isLogin && role === 'Donor' && (
              <div className="form-group glass-panel" style={{ padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  <input 
                    type="checkbox" 
                    id="fssai-check"
                    checked={hasFssai} 
                    onChange={(e) => setHasFssai(e.target.checked)} 
                    style={{ cursor: 'pointer' }}
                  />
                  <label htmlFor="fssai-check" className="form-label" style={{ margin: 0, cursor: 'pointer' }}>FSSAI Licensed Donor</label>
                </div>
                {hasFssai && (
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Enter FSSAI License ID" 
                    value={licenseId} 
                    onChange={(e) => setLicenseId(e.target.value)}
                    required
                  />
                )}
              </div>
            )}

            {!isLogin && role === 'NGO' && (
              <div className="form-group">
                <label className="form-label">NGO Target Delivery Units</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g., Slum Shelter Sector 62" 
                  value={targetUnits} 
                  onChange={(e) => setTargetUnits(e.target.value)}
                  required
                />
              </div>
            )}

            {!isLogin && role === 'Volunteer' && (
              <div className="form-group">
                <label className="form-label">Active Mobile Number</label>
                <input 
                  type="tel" 
                  className="form-input" 
                  placeholder="e.g., +91 9876543210" 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
            )}

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }}>
              {isLogin ? "Log In to Platform" : "Register and Open Account"}
            </button>
          </form>
        </div>

      </div>

      {/* Switch panel buttons */}
      <div style={{ textAlign: 'center', marginTop: '24px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
        <button 
          className="btn btn-outline" 
          style={{ border: 'none', background: 'none', color: 'var(--primary)', height: 'auto', padding: 0 }}
          onClick={() => {
            setIsLogin(!isLogin);
            setErrorMsg('');
            if (!isLogin) {
              setEmail('donor@zerohunger.org');
              setRole('Donor');
            } else {
              setEmail('');
            }
          }}
        >
          {isLogin ? "Need a new redistribution account? Register here" : "Already registered? Switch back to login portal"}
        </button>
      </div>
    </div>
  );
}

export default AuthPortal;
