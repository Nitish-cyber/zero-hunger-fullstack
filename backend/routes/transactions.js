/**
 * ==============================================================================
 * TRANSACTIONS & LOGISTICS ROUTER
 * ==============================================================================
 * 
 * BOOTCAMP CONCEPTS: RESTful State Mutations & Route Parameters
 * -------------------------------------------------------------
 * This router governs the lifecycle of surplus food batches:
 * 1. Available: Posted by Donor (banquet/hotels).
 * 2. Claimed: Locked by an NGO for their specific distribution target.
 * 3. Dispatched: Claimed shipment picked up by a Volunteer logistics driver.
 * 4. Delivered: Volunteer completes hand-over at the NGO units.
 * 
 * Routes use standard HTTP verbs:
 * - GET: Read resources (e.g. read active food listings)
 * - POST: Create new resources (e.g. post new food surplus)
 * - PUT: Update existing resources (e.g. update logistics step)
 */

const express = require('express');
const router = express.Router();
const dbSim = require('../database_sim');

/**
 * --------------------------------------------------------------------------
 * ROUTE: GET /api/transactions/donations
 * --------------------------------------------------------------------------
 * Fetches the complete registry of food batches.
 */
router.get('/donations', (req, res) => {
    return res.json({ success: true, donations: dbSim.getDonations() });
});

/**
 * --------------------------------------------------------------------------
 * ROUTE: POST /api/transactions/donations
 * --------------------------------------------------------------------------
 * Receives food parameters, runs strict safety checks, and registers the surplus.
 */
router.post('/donations', (req, res) => {
    const { item, quantityKgs, hoursRemaining, type, donorName, location } = req.body;
    
    // Step 1: Request Validation
    if (!item || !quantityKgs || !hoursRemaining || !type || !donorName || !location) {
        return res.status(400).json({ success: false, message: "Please supply all required food batch parameters." });
    }
    
    // Step 2: Quality Validation (Weight must be realistic)
    if (quantityKgs <= 0) {
        return res.status(400).json({ success: false, message: "Food quantity must be positive." });
    }
    
    // Step 3: Strict Safety Check (Shelf-Life threshold)
    // Core Platform Rule: If food has under 0.2 hours (~12 minutes) of remaining safe life,
    // it is unsafe to dispatch. The client rejects under 2 hours, but the server maintains
    // this hard validation threshold to enforce health compliance.
    if (hoursRemaining <= 0.2) {
        return res.status(400).json({ success: false, message: "Remaining safe shelf-life is too short for safe transport." });
    }
    
    // Step 4: Write to datastore
    const newDonation = dbSim.addDonation({
        item,
        quantityKgs: parseFloat(quantityKgs),
        hoursRemaining: parseFloat(hoursRemaining),
        type,
        donorName,
        location
    });
    
    return res.status(201).json({ success: true, message: "Food batch listed successfully.", donation: newDonation });
});

/**
 * --------------------------------------------------------------------------
 * ROUTE: PUT /api/transactions/donations/:id/claim
 * --------------------------------------------------------------------------
 * Allows an NGO to lock an available surplus food batch.
 * Note the route parameter ':id' which maps to 'req.params.id'.
 */
router.put('/donations/:id/claim', (req, res) => {
    const { id } = req.params; // Extracts the unique listing ID from the URL path
    const { ngoName } = req.body;
    
    if (!ngoName) {
        return res.status(400).json({ success: false, message: "NGO identifier is required to claim surplus." });
    }
    
    // Step 1: Find food batch
    const donation = dbSim.getDonations().find(d => d.id === id);
    if (!donation) {
        return res.status(404).json({ success: false, message: "Donation batch not found." });
    }
    
    // Step 2: Ensure batch is actually available to prevent race-conditions
    if (donation.status !== "Available") {
        return res.status(400).json({ success: false, message: "This food batch is already claimed or dispatched." });
    }
    
    // Step 3: Perform transaction update
    const updated = dbSim.updateDonationStatus(id, "Claimed", { claimedBy: ngoName });
    return res.json({ success: true, message: "Donation claimed successfully.", donation: updated });
});

/**
 * --------------------------------------------------------------------------
 * ROUTE: PUT /api/transactions/donations/:id/dispatch
 * --------------------------------------------------------------------------
 * Confirms a volunteer has picked up the claimed food and is in transit.
 */
router.put('/donations/:id/dispatch', (req, res) => {
    const { id } = req.params;
    const { volunteerName, phone } = req.body;
    
    if (!volunteerName || !phone) {
        return res.status(400).json({ success: false, message: "Volunteer logistics details are required to dispatch." });
    }
    
    const donation = dbSim.getDonations().find(d => d.id === id);
    if (!donation) {
        return res.status(404).json({ success: false, message: "Donation batch not found." });
    }
    
    // Safety check: Can only dispatch food that is Available or Claimed
    if (donation.status !== "Available" && donation.status !== "Claimed") {
        return res.status(400).json({ success: false, message: "This food batch is not in an available or claimed state." });
    }
    
    const updated = dbSim.updateDonationStatus(id, "Dispatched", {
        assignedVolunteer: volunteerName,
        volunteerPhone: phone
    });
    return res.json({ success: true, message: "Logistics dispatch active. Delivery routed.", donation: updated });
});

/**
 * --------------------------------------------------------------------------
 * ROUTE: PUT /api/transactions/donations/:id/deliver
 * --------------------------------------------------------------------------
 * Confirms delivery completion to end the redistribution lifecycle.
 */
router.put('/donations/:id/deliver', (req, res) => {
    const { id } = req.params;
    
    const donation = dbSim.getDonations().find(d => d.id === id);
    if (!donation) {
        return res.status(404).json({ success: false, message: "Donation batch not found." });
    }
    
    // Safety check: Can only mark as delivered if currently in dispatch/transit state
    if (donation.status !== "Dispatched") {
        return res.status(400).json({ success: false, message: "This food batch has not been dispatched yet." });
    }
    
    const updated = dbSim.updateDonationStatus(id, "Delivered");
    return res.json({ success: true, message: "Donation successfully delivered to NGO units.", donation: updated });
});

/**
 * --------------------------------------------------------------------------
 * ROUTE: GET /api/transactions/logs
 * --------------------------------------------------------------------------
 * Fetches the backend state logs (Admin Core audit trail).
 */
router.get('/logs', (req, res) => {
    return res.json({ success: true, logs: dbSim.getLogs() });
});

module.exports = router;
