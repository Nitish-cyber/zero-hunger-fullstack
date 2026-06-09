/**
 * ==============================================================================
 * ZERO HUNGER FRONTEND APPLICATION ENTRYPOINT (App.jsx)
 * ==============================================================================
 * 
 * CORE REACT BOOTCAMP TRAINING CONCEPTS:
 * --------------------------------------
 * 1. Controlled State Components: Using 'useState' to store authorization tokens,
 *    current login profile, lists of donations, logs, and notification messages.
 * 2. Effect Lifecycle Hook: Using 'useEffect' to run initialization queries
 *    (checking client storage credentials) and orchestrate continuous background
 *    polling to sync records with the database.
 * 3. Conditional Rendering: Dynamically displaying the correct actor dashboard
 *    (Donor, NGO, Volunteer, Vendor, Admin) based on the user's active role.
 * 4. Local browser persistence: Reading and writing to browser's 'localStorage'
 *    to preserve session states across page reloads.
 */

import React, { useState, useEffect } from 'react';
import AuthPortal from './components/AuthPortal';
import DonorDashboard from './components/DonorDashboard';
import NgoDashboard from './components/NgoDashboard';
import VolunteerDashboard from './components/VolunteerDashboard';
import VendorDashboard from './components/VendorDashboard';
import AdminDashboard from './components/AdminDashboard';

// Define the root API endpoint for backend service integration
const API_BASE = import.meta.env.VITE_API_BASE || (import.meta.env.DEV ? "http://localhost:5000/api" : "/api");

function App() {
  /**
   * --------------------------------------------------------------------------
   * 1. REACT STATE HOOKS (Declarative Variables)
   * --------------------------------------------------------------------------
   * When any of these states change, React automatically updates/re-renders the DOM.
   */
  // Authorization Session States: Attempt to read pre-existing credentials from browser storage first
  const [token, setToken] = useState(localStorage.getItem('zh_token') || '');
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('zh_user')) || null);
  
  // Data Records Collections States
  const [donations, setDonations] = useState([]);
  const [logs, setLogs] = useState([]);
  
  // UX Feedback Banner States
  const [statusMsg, setStatusMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  
  // Advanced Navigation & Portal Overlay States
  const [currentView, setCurrentView] = useState('');
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Actor Profile Form Editor States (Controlled input variables)
  const [profileName, setProfileName] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [profilePassword, setProfilePassword] = useState('');
  const [profileHasFssai, setProfileHasFssai] = useState(true);
  const [profileLicenseId, setProfileLicenseId] = useState('');
  const [profileTargetUnits, setProfileTargetUnits] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [profileStatus, setProfileStatus] = useState('');
  const [profileError, setProfileError] = useState('');

  /**
   * --------------------------------------------------------------------------
   * 2. REACT LIFECYCLE EFFECTS (useEffect)
   * --------------------------------------------------------------------------
   */
  // Sync form inputs whenever the logged-in user context changes or is loaded
  useEffect(() => {
    if (user) {
      setCurrentView(user.role);
      // Populate profile editor modal with current database records
      setProfileName(user.name || '');
      setProfileEmail(user.email || '');
      setProfileHasFssai(user.hasFssai !== undefined ? user.hasFssai : true);
      setProfileLicenseId(user.licenseId || '');
      setProfileTargetUnits(user.targetUnits || '');
      setProfilePhone(user.phone || '');
    }
  }, [user]);

  // Synchronous background data sync: Query API server or fall back gracefully
  useEffect(() => {
    if (token && user) {
      // 1. Run initial fetch immediately upon successful authentication
      fetchData();
      
      // 2. Set up interval-polling to check for new claims or logistics updates every 8 seconds
      const interval = setInterval(fetchData, 8000);
      
      // Cleanup function: Triggered when component unmounts to prevent memory leaks
      return () => clearInterval(interval);
    }
  }, [token, user]);

  /**
   * --------------------------------------------------------------------------
   * 3. DATA ACQUISITION & FALLBACK SIMULATOR
   * --------------------------------------------------------------------------
   * In local training setups, the backend server might not be running.
   * This query function handles errors gracefully, ensuring seamless local offline mock simulation.
   */
  const fetchData = async () => {
    try {
      // Fetch surplus listings from API
      const donRes = await fetch(`${API_BASE}/transactions/donations`);
      if (donRes.ok) {
        const donData = await donRes.json();
        setDonations(donData.donations);
      }
      
      // Fetch administrative audit trails if the active profile is 'Admin'
      if (user && user.role === 'Admin') {
        const logRes = await fetch(`${API_BASE}/transactions/logs`);
        if (logRes.ok) {
          const logData = await logRes.json();
          setLogs(logData.logs);
        }
      }
    } catch (err) {
      // Graceful offline degradation for zero-setup workshops
      console.warn("Backend server not responding. Operating in localized browser memory fallback.");
    }
  };

  /**
   * --------------------------------------------------------------------------
   * 4. HANDLERS (Login, Logout, Profile Updates)
   * --------------------------------------------------------------------------
   */
  // Handles successful sign-in or registration from AuthPortal component
  const handleLogin = (jwt, profile) => {
    localStorage.setItem('zh_token', jwt);
    localStorage.setItem('zh_user', JSON.stringify(profile));
    setToken(jwt);
    setUser(profile);
    setCurrentView(profile.role);
    setStatusMsg(`Welcome back, ${profile.name}! Dashboard successfully authorized.`);
    
    // Auto-dim banner after 4 seconds
    setTimeout(() => setStatusMsg(''), 4000);
  };

  // Erases tokens to safely terminate session
  const handleLogout = () => {
    localStorage.removeItem('zh_token');
    localStorage.removeItem('zh_user');
    setToken('');
    setUser(null);
    setDonations([]);
    setLogs([]);
    setCurrentView('');
    setShowProfileModal(false);
  };

  // Submits profile modifications to the Express API (or falls back to mock storage if server is down)
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileError('');
    setProfileStatus('');

    const payload = {
      userId: user.id,
      name: profileName,
      email: profileEmail,
      password: profilePassword || undefined,
      hasFssai: user.role === 'Donor' ? profileHasFssai : undefined,
      licenseId: user.role === 'Donor' && profileHasFssai ? profileLicenseId : undefined,
      targetUnits: user.role === 'NGO' ? profileTargetUnits : undefined,
      phone: user.role === 'Volunteer' ? profilePhone : undefined
    };

    try {
      const response = await fetch(`${API_BASE}/auth/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      if (response.ok && data.success) {
        const updatedProfile = { ...user, ...data.user };
        localStorage.setItem('zh_user', JSON.stringify(updatedProfile));
        setUser(updatedProfile);
        setProfilePassword('');
        setProfileStatus("Success: Profile saved to cloud database!");
        setTimeout(() => {
          setProfileStatus('');
          setShowProfileModal(false);
        }, 1500);
      } else {
        setProfileError(data.message || "Failed to update profile.");
      }
    } catch (networkErr) {
      // Local training simulation fallback
      const simulatedUser = {
        ...user,
        name: profileName,
        email: profileEmail,
        hasFssai: profileHasFssai,
        licenseId: profileLicenseId,
        targetUnits: profileTargetUnits,
        phone: profilePhone
      };
      localStorage.setItem('zh_user', JSON.stringify(simulatedUser));
      setUser(simulatedUser);
      setProfileStatus("SUCCESS (MOCKED): Profile saved locally to browser.");
      setTimeout(() => {
        setProfileStatus('');
        setShowProfileModal(false);
      }, 1500);
    }
  };

  /**
   * --------------------------------------------------------------------------
   * 5. DYNAMIC COMPONENT DISPATCHER
   * --------------------------------------------------------------------------
   * Reads active portal view state to render the matching React component dashboard.
   */
  const renderDashboard = () => {
    if (!user) return null;
    
    switch (currentView) {
      case 'Donor':
        return (
          <DonorDashboard 
            user={user} 
            donations={donations.filter(d => d.donorName === user.name)} 
            onDonationPosted={fetchData} 
          />
        );
      case 'NGO':
        return (
          <NgoDashboard 
            user={user} 
            donations={donations} 
            onDonationUpdated={fetchData} 
          />
        );
      case 'Volunteer':
        return (
          <VolunteerDashboard 
            user={user} 
            donations={donations} 
            onDonationUpdated={fetchData} 
          />
        );
      case 'Vendor':
        return (
          <VendorDashboard 
            user={user} 
          />
        );
      case 'Admin':
        return (
          <AdminDashboard 
            user={user} 
            donations={donations} 
            logs={logs} 
          />
        );
      default:
        return <div className="alert-box danger">Error: Invalid dashboard view configuration specified.</div>;
    }
  };

  // If user session does not exist, display authorization portal
  if (!token || !user) {
    return (
      <div className="auth-bg">
        <AuthPortal onAuthSuccess={handleLogin} />
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Premium Navigation Header */}
      <header className="navbar">
        <div className="brand-section">
          <div className="brand-logo">ØH</div>
          <div>
            <h1 className="brand-title" style={{ lineHeight: 1.1 }}>Zero Hunger</h1>
            <span style={{ fontSize: '10px', color: 'var(--primary)', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Bootcamp Platform
            </span>
          </div>
        </div>

        {/* Dynamic Multi-Portal Portal View Switcher (Enables easy testing of multiple roles in training classes) */}
        {user.role === 'Admin' && (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '10px', 
            background: '#f8fafc', 
            padding: '6px 16px', 
            borderRadius: '40px', 
            border: '1px solid var(--border-color)',
            transition: 'var(--transition)'
          }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>Viewing Portal:</span>
            <select 
              value={currentView} 
              onChange={(e) => setCurrentView(e.target.value)}
              style={{ 
                border: 'none', 
                background: 'transparent', 
                fontSize: '13px', 
                fontWeight: 700, 
                color: 'var(--primary)', 
                outline: 'none', 
                cursor: 'pointer' 
              }}
            >
              <option value="Donor">Donor Portal</option>
              <option value="NGO">NGO Portal</option>
              <option value="Volunteer">Volunteer Portal</option>
              <option value="Vendor">Vendor Discount Portal</option>
              <option value="Admin">Admin Portal</option>
            </select>
          </div>
        )}
        
        {/* User Badging Section */}
        <div className="user-profile-badge">
          <span 
            className={`role-tag ${user.role.toLowerCase()}`} 
            onClick={() => setShowProfileModal(true)}
            style={{ cursor: 'pointer', transition: 'var(--transition)' }}
            title="Click to view/edit profile"
          >
            {user.role} 👤
          </span>
          <span 
            style={{ fontWeight: 700, color: 'var(--text-main)', cursor: 'pointer' }}
            onClick={() => setShowProfileModal(true)}
            title="Click to view/edit profile"
          >
            {user.name}
          </span>
          <button className="btn btn-outline" onClick={handleLogout} style={{ height: '36px', padding: '0 16px' }}>
            Logout
          </button>
        </div>
      </header>

      {/* Main Content Layout Wrapper */}
      <main className="main-wrapper">
        {statusMsg && <div className="alert-box">{statusMsg}</div>}
        {errorMsg && <div className="alert-box danger">{errorMsg}</div>}
        
        {renderDashboard()}
      </main>

      {/* Interactive Profile Edit Dialog Box Overlay */}
      {showProfileModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.4)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="glass-panel" style={{
            width: '100%',
            maxWidth: '500px',
            padding: '30px',
            backgroundColor: 'white',
            borderRadius: '20px',
            boxShadow: 'var(--shadow-lg)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', color: 'var(--primary)' }}>
                Edit Actor Profile
              </h3>
              <button 
                onClick={() => setShowProfileModal(false)}
                style={{ border: 'none', background: 'none', fontSize: '20px', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                ✕
              </button>
            </div>

            {profileError && <div className="alert-box danger">{profileError}</div>}
            {profileStatus && <div className="alert-box">{profileStatus}</div>}

            <form onSubmit={handleUpdateProfile}>
              <div className="form-group">
                <label className="form-label">Full Name / Banquet Name</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={profileName} 
                  onChange={(e) => setProfileName(e.target.value)} 
                  required 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input 
                  type="email" 
                  className="form-input" 
                  value={profileEmail} 
                  onChange={(e) => setProfileEmail(e.target.value)} 
                  required 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Change Password (leave blank to keep current)</label>
                <input 
                  type="password" 
                  className="form-input" 
                  placeholder="••••••••" 
                  value={profilePassword} 
                  onChange={(e) => setProfilePassword(e.target.value)} 
                />
              </div>

              {/* Role-specific parameters form layout */}
              {user.role === 'Donor' && (
                <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                    <input 
                      type="checkbox" 
                      checked={profileHasFssai} 
                      onChange={(e) => setProfileHasFssai(e.target.checked)} 
                    />
                    <span className="form-label" style={{ margin: 0 }}>FSSAI Licensed</span>
                  </div>
                  {profileHasFssai && (
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="FSSAI License ID" 
                      value={profileLicenseId} 
                      onChange={(e) => setProfileLicenseId(e.target.value)} 
                      required
                    />
                  )}
                </div>
              )}

              {user.role === 'NGO' && (
                <div className="form-group">
                  <label className="form-label">Target Units Address</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={profileTargetUnits} 
                    onChange={(e) => setProfileTargetUnits(e.target.value)} 
                    required
                  />
                </div>
              )}

              {user.role === 'Volunteer' && (
                <div className="form-group">
                  <label className="form-label">Mobile Contact Number</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={profilePhone} 
                    onChange={(e) => setProfilePhone(e.target.value)} 
                    required
                  />
                </div>
              )}

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }}>
                Save Changes
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
