import React, { useState } from 'react';

function LandingPage({ onGetStarted }) {
  // 1. Calculator State
  const [mealQuantity, setMealQuantity] = useState(350);

  // Derived ecological impact values
  const peopleFed = Math.round(mealQuantity);
  const co2Saved = (mealQuantity * 2.5).toFixed(1);
  const waterSaved = Math.round(mealQuantity * 180).toLocaleString();

  // 2. Interactive Role Explorer State
  const [activeRole, setActiveRole] = useState('Donor');

  const roleDetails = {
    Donor: {
      title: "Surplus Food Donor Portal",
      desc: "For hotels, banquets, restaurants, and corporate kitchens. Easily list clean, leftover food instead of throwing it away.",
      icon: "🏢",
      badge: "Food Producers & Banquets",
      colorClass: "donor",
      steps: [
        { title: "Log Surplus Instantly", desc: "Select food category, portions, and FSSAI shelf life details directly in your dashboard." },
        { title: "Smart Matching", desc: "Our system automatically alerts nearby registered NGOs and volunteer networks." },
        { title: "Seamless Dispatch", desc: "Volunteers arrive at your location to safely transport the food, tracking status throughout." }
      ]
    },
    NGO: {
      title: "NGO Distribution Hub",
      desc: "For registered shelters, charity kitchens, and community organizations. Request, secure, and distribute surplus food.",
      icon: "🎒",
      badge: "Verified Shelters & Charities",
      colorClass: "ngo",
      steps: [
        { title: "Browse Available Listings", desc: "See real-time food donations available in your surrounding sectors." },
        { title: "Claim Surplus", desc: "Secure allocations for your shelter with a single click to prevent duplicate claims." },
        { title: "Accept Delivery", desc: "Confirm safe receipt of the food and record feed counts to update platform metrics." }
      ]
    },
    Volunteer: {
      title: "Volunteer Logistics network",
      desc: "For local individuals and dispatch agents. Be the bridge that safely delivers food from donors to NGO drop-off points.",
      icon: "🚚",
      badge: "Local Transport Heroes",
      colorClass: "volunteer",
      steps: [
        { title: "View Routes", desc: "Access the pending deliveries tab to find open pickup requests near you." },
        { title: "Accept Logistic Route", desc: "Claim a route, lock the pickup, and head over to the donor location." },
        { title: "Deliver & Confirm", desc: "Transport securely under safety guidelines, upload delivery confirmation, and log it." }
      ]
    },
    Vendor: {
      title: "Vendor Wastage Center",
      desc: "For local bakeries, grocery shops, and supermarkets. Sell near-expiry items as discounted bundles to community members.",
      icon: "🏪",
      badge: "Local Shops & Grocers",
      colorClass: "vendor",
      steps: [
        { title: "Create Discount Bundles", desc: "Upload surplus grocery kits or baked items at up to 70% discount prices." },
        { title: "List in Directory", desc: "Help budget-conscious families locate and buy affordable food packs before closing hours." },
        { title: "Minimize Store Loss", desc: "Convert potential waste into modest returns while helping families in your sector." }
      ]
    }
  };

  // 3. FAQ State
  const [openFaq, setOpenFaq] = useState(null);

  const faqs = [
    {
      question: "How is food safety maintained on the Zero Hunger Platform?",
      answer: "We mandate FSSAI certification and license verification for all commercial food donors. Donors must provide shelf-life indicators and specific preservation instructions for each listed item. Volunteers are trained in basic hygiene logistics."
    },
    {
      question: "Can individual households donate food, or only commercial vendors?",
      answer: "Currently, our primary focus is on commercial kitchens (banquets, hotels, caterers) to maximize impact and logistics efficiency. However, individual donor signups are supported for large event caterers or group meal contributions."
    },
    {
      question: "Is there any cost for NGOs or Volunteers to join?",
      answer: "Absolutely not. Zero Hunger is a completely free community platform built during react training workshops to facilitate digital logistics routing for social welfare."
    },
    {
      question: "How does the Vendor Discount Portal differ from standard donations?",
      answer: "The Vendor Portal allows local grocery stores, bakeries, and cafes to sell near-expiry food bundles at deep discounts rather than donating. This helps store owners reduce inventory write-offs while providing inexpensive options to the public."
    }
  ];

  return (
    <div className="landing-wrapper">
      {/* 1. HERO SECTION */}
      <section className="hero-section">
        <div>
          <div className="hero-badge">
            <span>🌱</span> Zero Waste, Zero Hunger Initiative
          </div>
          <h1 style={{ fontSize: '56px', fontWeight: 800, lineHeight: 1.15, marginBottom: '24px' }}>
            Bridging the Gap Between <br />
            <span className="gradient-text">Surplus and Scarcity</span>
          </h1>
          <p className="hero-subtitle">
            Zero Hunger is a modern logistics redistribution network connecting banquet halls, restaurants, and vendors with local NGOs and volunteers to feed communities and reduce landfills.
          </p>
          <div className="hero-buttons">
            <button className="btn btn-primary" onClick={onGetStarted} style={{ padding: '0 32px' }}>
              Access Portal Sign-In →
            </button>
            <a href="#how-it-works" className="btn btn-outline" style={{ textDecoration: 'none' }}>
              Learn How it Works
            </a>
          </div>
        </div>

        {/* Dynamic Impact Calculator Widget */}
        <div className="calc-card float-animation">
          <h3 className="calc-title">Interactive Impact Calculator</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', marginBottom: '20px' }}>
            Drag the slider to see how saving meals impacts the environment and lives.
          </p>

          <div style={{ textAlign: 'center', marginBottom: '16px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase', display: 'block' }}>
              Redistributed Surplus
            </span>
            <span style={{ fontSize: '38px', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'var(--font-display)' }}>
              {mealQuantity} <span style={{ fontSize: '18px', color: 'var(--text-muted)' }}>meals</span>
            </span>
          </div>

          <div className="calc-slider-wrapper">
            <input
              type="range"
              min="50"
              max="2000"
              step="50"
              value={mealQuantity}
              onChange={(e) => setMealQuantity(parseInt(e.target.value))}
              className="calc-slider"
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-light)', marginTop: '8px', fontWeight: 600 }}>
              <span>50 MEALS</span>
              <span>2,000 MEALS</span>
            </div>
          </div>

          <div className="calc-results-grid">
            <div className="calc-result-box">
              <div className="calc-number">{peopleFed}</div>
              <div className="calc-unit">People Fed</div>
            </div>
            <div className="calc-result-box">
              <div className="calc-number">~{co2Saved}</div>
              <div className="calc-unit">kg CO₂e Saved</div>
            </div>
            <div className="calc-result-box">
              <div className="calc-number">{waterSaved}</div>
              <div className="calc-unit">Ltrs Water Saved</div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. STATS BANNER */}
      <section className="stats-banner">
        <div className="stat-item">
          <h3>64,250+</h3>
          <p>Meals Safeguarded</p>
        </div>
        <div className="stat-item">
          <h3>142</h3>
          <p>Verified Banquets & Donors</p>
        </div>
        <div className="stat-item">
          <h3>315</h3>
          <p>Active Logistics Volunteers</p>
        </div>
        <div className="stat-item">
          <h3>160 Metric T.</h3>
          <p>CO₂ Landfill Offset</p>
        </div>
      </section>

      {/* 3. INTERACTIVE ROLE EXPLORER */}
      <section id="how-it-works" className="roles-explorer">
        <div className="section-header">
          <h2>Platform Redistribution Portals</h2>
          <p>Explore the coordinated roles that drive our real-time food-saving pipeline.</p>
        </div>

        {/* Role Tabs */}
        <div className="roles-tabs-nav">
          {Object.keys(roleDetails).map((roleKey) => (
            <button
              key={roleKey}
              onClick={() => setActiveRole(roleKey)}
              className={`role-tab-btn ${activeRole === roleKey ? 'active' : ''}`}
            >
              <span style={{ marginRight: '6px' }}>{roleDetails[roleKey].icon}</span>
              {roleKey}
            </button>
          ))}
        </div>

        {/* Role Detail View */}
        <div className="role-tab-content-card">
          <div style={{ paddingRight: '20px' }}>
            <span className={`role-tag ${roleDetails[activeRole].colorClass}`} style={{ marginBottom: '14px', display: 'inline-block' }}>
              {roleDetails[activeRole].badge}
            </span>
            <h3 style={{ fontSize: '28px', color: 'var(--text-main)', marginBottom: '16px' }}>
              {roleDetails[activeRole].title}
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: 1.6, marginBottom: '24px' }}>
              {roleDetails[activeRole].desc}
            </p>
            <button className="btn btn-primary" onClick={onGetStarted}>
              Join as {activeRole} →
            </button>
          </div>

          <div style={{ borderLeft: '1px solid var(--border-color)', paddingLeft: '30px' }}>
            <h4 style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '20px' }}>
              Simulated Workflow Steps
            </h4>
            <div>
              {roleDetails[activeRole].steps.map((step, idx) => (
                <div className="role-flow-step" key={idx}>
                  <div className="role-flow-icon">{idx + 1}</div>
                  <div className="role-flow-text">
                    <h4>{step.title}</h4>
                    <p>{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 4. CORE FEATURES & TRUST FEATURES */}
      <section className="features-section">
        <div className="section-header" style={{ marginBottom: '50px' }}>
          <h2>Built for Reliability and Safety</h2>
          <p>Our MERN stack architecture includes critical features to ensure regulatory compliance and dispatch safety.</p>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon-badge">🔒</div>
            <h3 style={{ fontSize: '18px', marginBottom: '12px' }}>FSSAI Verification</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.5 }}>
              Compulsory food safety licensing inputs for banquets, establishing strong accountability and safe shelf-life tracking metrics.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-badge">⚡</div>
            <h3 style={{ fontSize: '18px', marginBottom: '12px' }}>Instant Notifications</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.5 }}>
              Real-time synchronization alerts that instantly inform NGOs and volunteers of new surplus availability in their target postal codes.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-badge">📍</div>
            <h3 style={{ fontSize: '18px', marginBottom: '12px' }}>Logistics Route Optimization</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.5 }}>
              Smooth dispatch flow connecting pickup locations to distribution units, allowing active volunteers to claim optimized transport routes.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-badge">📊</div>
            <h3 style={{ fontSize: '18px', marginBottom: '12px' }}>Audit Trail Logging</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.5 }}>
              Full administrative logs tracking listing creations, claims, volunteer pickups, and delivery confirmations to maintain high platform trust.
            </p>
          </div>
        </div>
      </section>

      {/* 5. INTERACTIVE FAQ SECTION */}
      <section className="faq-section">
        <div className="section-header" style={{ marginBottom: '40px' }}>
          <h2>Frequently Asked Questions</h2>
          <p>Quick answers regarding platform operations and security safeguards.</p>
        </div>

        <div className="faq-list">
          {faqs.map((faq, idx) => (
            <div className={`faq-item ${openFaq === idx ? 'active' : ''}`} key={idx}>
              <div className="faq-header" onClick={() => setOpenFaq(openFaq === idx ? null : idx)}>
                <span>{faq.question}</span>
                <span className="faq-chevron">▼</span>
              </div>
              <div className="faq-content">
                {faq.answer}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. CALL TO ACTION & FOOTER */}
      <section style={{
        textAlign: 'center',
        padding: '60px 40px',
        background: 'var(--primary-light)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid rgba(5, 150, 105, 0.1)',
        marginTop: '20px'
      }}>
        <h2 style={{ fontSize: '36px', color: 'var(--primary-hover)', marginBottom: '12px' }}>
          Ready to make a difference?
        </h2>
        <p style={{ color: 'var(--text-muted)', maxWidth: '500px', margin: '0 auto 30px auto', fontSize: '15px' }}>
          Register your organization, banquet, or individual profile to join our active network today.
        </p>
        <button className="btn btn-primary" onClick={onGetStarted} style={{ padding: '0 36px' }}>
          Launch Dashboard Portal
        </button>
      </section>

      <footer className="landing-footer">
        <div>
          <strong>ØH Zero Hunger Platform</strong> - MERN Stack Bootcamp Project
        </div>
        <div>
          © {new Date().getFullYear()} Zero Hunger Network. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
