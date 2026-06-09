/**
 * ==============================================================================
 * VENDOR SURPLUS CENTER COMPONENT (VendorDashboard.jsx)
 * ==============================================================================
 * 
 * REACT TRAINING CONCEPTS:
 * ------------------------
 * 1. Array State Insertion: Using the spread operator `[newOffer, ...offers]` 
 *    to add items to a local React array state without mutating previous state records directly.
 * 2. Cross-Field Math Validation: Enforcing that the discounted "wastage price" 
 *    is strictly less than the normal retail price to guarantee authentic NGO savings.
 * 3. Side-by-Side Dual Column Panels: Structured cleanly so form registrations and 
 *    active stock inventories sit adjacent to one another.
 */

import React, { useState } from 'react';

function VendorDashboard({ user }) {
  // Input fields state hooks
  const [item, setItem] = useState('');
  const [quantity, setQuantity] = useState('');
  const [normalPrice, setNormalPrice] = useState('');
  const [discountPrice, setDiscountPrice] = useState('');
  
  // Local array state seeded with realistic surplus commercial items
  const [offers, setOffers] = useState([
    { id: "OFF-201", item: "Whole Wheat Bread Bundles", quantity: "20 Loaves", normalPrice: 800, discountPrice: 200, status: "Active" },
    { id: "OFF-202", item: "Surplus Buffet Rice Packs", quantity: "15 Packs", normalPrice: 1500, discountPrice: 450, status: "Sold Out" }
  ]);
  
  // UX Alerts
  const [statusMsg, setStatusMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Form publisher handler
  const handlePostOffer = (e) => {
    e.preventDefault();
    setErrorMsg('');
    setStatusMsg('');

    // Cross-field price threshold validation
    if (parseFloat(discountPrice) >= parseFloat(normalPrice)) {
      setErrorMsg("Discounted price must be strictly lower than normal price.");
      return;
    }

    // Assemble new record with a randomized tracking ID
    const newOffer = {
      id: `OFF-${Math.floor(200 + Math.random() * 800)}`,
      item,
      quantity,
      normalPrice: parseFloat(normalPrice),
      discountPrice: parseFloat(discountPrice),
      status: "Active"
    };

    // React state rule: Always treat state as immutable! Create a new array reference.
    setOffers([newOffer, ...offers]);
    
    setStatusMsg("Discount surplus bundle published successfully for NGOs!");
    
    // Clear inputs upon publishing
    setItem('');
    setQuantity('');
    setNormalPrice('');
    setDiscountPrice('');
    
    setTimeout(() => setStatusMsg(''), 4000);
  };

  return (
    <div className="dashboard-grid">
      
      {/* Left Column: Register Discount Offer */}
      <div className="glass-panel" style={{ padding: '30px', height: 'fit-content', border: '1px solid var(--border-color)' }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', marginBottom: '8px', color: 'var(--primary)' }}>
          Publish Discount Surplus
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '20px' }}>
          Sell fresh leftover food packages at deep discounts so local NGOs can easily acquire high-grade commercial inventory.
        </p>

        {errorMsg && <div className="alert-box danger">{errorMsg}</div>}
        {statusMsg && <div className="alert-box">{statusMsg}</div>}

        <form onSubmit={handlePostOffer}>
          <div className="form-group">
            <label className="form-label">Food Bundle / Product</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="e.g., Croissants & Sweet Rolls" 
              value={item}
              onChange={(e) => setItem(e.target.value)}
              required 
            />
          </div>

          <div className="form-group">
            <label className="form-label">Total Quantity / Volume</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="e.g., 25 Boxes" 
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required 
            />
          </div>

          <div className="form-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label className="form-label">Normal Price (INR)</label>
              <input 
                type="number" 
                className="form-input" 
                placeholder="1000" 
                value={normalPrice}
                onChange={(e) => setNormalPrice(e.target.value)}
                required 
              />
            </div>
            <div>
              <label className="form-label">Wastage Price (INR)</label>
              <input 
                type="number" 
                className="form-input" 
                placeholder="300" 
                value={discountPrice}
                onChange={(e) => setDiscountPrice(e.target.value)}
                required 
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px', borderRadius: '8px' }}>
            List Discount Offer
          </button>
        </form>
      </div>

      {/* Right Column: Historical / Active Listings */}
      <div>
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '26px' }}>Discount Stock Inventory</h2>
          <p style={{ color: 'var(--text-muted)' }}>Help NGOs acquire discounted freshly prepared items to mitigate total vendor wastage</p>
        </div>

        <div className="card-grid">
          {offers.map((off) => (
            <div key={off.id} className="dashboard-card" style={{ transition: 'var(--transition)' }}>
              <div className="card-header">
                <span className={`status-badge ${off.status === 'Active' ? 'available' : 'danger'}`}>
                  {off.status}
                </span>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-light)' }}>{off.id}</span>
              </div>

              <h4 style={{ fontSize: '18px', marginBottom: '12px', color: 'var(--text-main)' }}>{off.item}</h4>
              
              <div className="param-list">
                <div className="param-item">
                  <span className="param-label">Pack size:</span>
                  <span className="param-value">{off.quantity}</span>
                </div>
                <div className="param-item">
                  <span className="param-label">Regular Price:</span>
                  <span className="param-value" style={{ textDecoration: 'line-through', color: 'var(--danger)' }}>
                    ₹{off.normalPrice}
                  </span>
                </div>
                <div className="param-item">
                  <span className="param-label">Wastage Price:</span>
                  <span className="param-value" style={{ color: 'var(--primary)', fontSize: '16px', fontWeight: 700 }}>
                    ₹{off.discountPrice}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

export default VendorDashboard;
