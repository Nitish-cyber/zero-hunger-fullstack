/**
 * ==============================================================================
 * AUTHENTICATION & PORTAL AUTHORIZATION ROUTER
 * ==============================================================================
 * 
 * BOOTCAMP CONCEPTS: Express Routing, JSON Web Tokens (JWT), and Hashed Logins
 * --------------------------------------------------------------------------
 * This module defines our authentication REST API routes using Express Router.
 * 
 * Flow of Secure Login:
 * 1. User submits their email & password.
 * 2. Backend retrieves the user matching that email.
 * 3. We compare the hashed password from the database against the client's password
 *    using bcrypt.
 * 4. If correct, we issue a secure token signed with a server-side secret key (JWT).
 * 5. The client stores this token in localStorage to prove their identity for 
 *    future transactions.
 */

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const dbSim = require('../database_sim');

// The JWT_SECRET is a secure string known ONLY by the backend server.
// It is used to sign tokens to guarantee they cannot be forged or tampered with by clients.
const JWT_SECRET = "zero_hunger_super_jwt_secret_token";

/**
 * --------------------------------------------------------------------------
 * ROUTE: POST /api/auth/register
 * --------------------------------------------------------------------------
 * Receives registration credentials, performs validation, creates the user,
 * and automatically returns a signed authorization token.
 */
router.post('/register', (req, res) => {
    // Destructure required registration attributes from request body
    const { name, email, password, role, ...extra } = req.body;
    
    // Step 1: Input Validation
    if (!name || !email || !password || !role || !extra.securityQuestion || !extra.securityAnswer) {
        // Status Code 400 = Bad Request (Client did not supply required parameters)
        return res.status(400).json({ success: false, message: "Please supply all required register fields, including a security question and answer." });
    }
    
    // Step 2: Check for existing account to avoid duplicates
    const existing = dbSim.getUserByEmail(email);
    if (existing) {
        return res.status(400).json({ success: false, message: "This email account is already registered." });
    }
    
    // Step 3: Register the new user in database
    const newUser = dbSim.addUser({
        name,
        email,
        password, // Encrypted securely inside dbSim.addUser using bcrypt!
        role,
        ...extra
    });
    
    // Step 4: Issue a Signed JSON Web Token (JWT)
    // We embed user details in the token payload so the frontend can decrypt it locally
    const token = jwt.sign(
        { id: newUser.id, role: newUser.role }, 
        JWT_SECRET, 
        { expiresIn: '12h' } // Token automatically expires in 12 hours for security
    );
    
    // Step 5: Send Successful Response (Status Code 201 = Created)
    return res.status(201).json({
        success: true,
        message: "User account created successfully.",
        token,
        user: {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role
        }
    });
});

/**
 * --------------------------------------------------------------------------
 * ROUTE: POST /api/auth/login
 * --------------------------------------------------------------------------
 * Validates credentials, checks hashed password compatibility, and issues JWT.
 */
router.post('/login', (req, res) => {
    const { email, password } = req.body;
    
    // Step 1: Input Validation
    if (!email || !password) {
        return res.status(400).json({ success: false, message: "Please enter your email and password credentials." });
    }
    
    // Step 2: Fetch user matching email address
    const user = dbSim.getUserByEmail(email);
    if (!user) {
        // Security Tip: Keep error message generic to prevent brute-force email enumeration
        return res.status(404).json({ success: false, message: "Incorrect email or password credentials." });
    }
    
    // Step 3: Secure Hashed Password Verification
    // We NEVER compare raw passwords! bcrypt.compareSync hashes the input password
    // using the user's salt and checks if the outputs match.
    const matches = bcrypt.compareSync(password, user.password);
    if (!matches) {
        return res.status(400).json({ success: false, message: "Incorrect email or password credentials." });
    }
    
    // Step 4: Login Success - Sign and issue JWT
    const token = jwt.sign(
        { id: user.id, role: user.role }, 
        JWT_SECRET, 
        { expiresIn: '12h' }
    );
    
    // Step 5: Return JWT and profile credentials to client
    return res.json({
        success: true,
        message: "Logged in successfully.",
        token,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            // Include role-specific profile parameters needed by React dashboard layouts
            hasFssai: user.hasFssai,
            licenseId: user.licenseId,
            targetUnits: user.targetUnits,
            phone: user.phone
        }
    });
});

/**
 * --------------------------------------------------------------------------
 * ROUTE: PUT /api/auth/profile
 * --------------------------------------------------------------------------
 * Receives updated fields from profile modal, updates state, and returns new user card.
 */
router.put('/profile', (req, res) => {
    const { userId, name, email, password, hasFssai, licenseId, targetUnits, phone } = req.body;
    
    if (!userId) {
        return res.status(400).json({ success: false, message: "User reference ID is required to update profile." });
    }
    
    try {
        // Collect only the fields that the client is explicitly updating
        const fieldsToUpdate = {};
        if (name) fieldsToUpdate.name = name;
        if (email) fieldsToUpdate.email = email;
        if (password && password.trim() !== '') fieldsToUpdate.password = password;
        if (hasFssai !== undefined) fieldsToUpdate.hasFssai = hasFssai;
        if (licenseId !== undefined) fieldsToUpdate.licenseId = licenseId;
        if (targetUnits !== undefined) fieldsToUpdate.targetUnits = targetUnits;
        if (phone !== undefined) fieldsToUpdate.phone = phone;
        
        // Update user in datastore
        const updated = dbSim.updateUserProfile(userId, fieldsToUpdate);
        if (!updated) {
            return res.status(404).json({ success: false, message: "User account not found." });
        }
        
        return res.json({
            success: true,
            message: "User profile updated successfully.",
            user: {
                id: updated.id,
                name: updated.name,
                email: updated.email,
                role: updated.role,
                hasFssai: updated.hasFssai,
                licenseId: updated.licenseId,
                targetUnits: updated.targetUnits,
                phone: updated.phone
            }
        });
    } catch (err) {
        // Handles errors thrown by database (e.g. duplicate email addresses)
        return res.status(400).json({ success: false, message: err.message });
    }
});

/**
 * --------------------------------------------------------------------------
 * ROUTE: POST /api/auth/forgot-password-step1
 * --------------------------------------------------------------------------
 * Receives email, checks if user exists, and returns the user's security question.
 */
router.post('/forgot-password-step1', (req, res) => {
    const { email } = req.body;
    
    if (!email) {
        return res.status(400).json({ success: false, message: "Please supply your registered email address." });
    }
    
    const user = dbSim.getUserByEmail(email);
    if (!user) {
        return res.status(404).json({ success: false, message: "No account found with this email address." });
    }
    
    return res.json({
        success: true,
        securityQuestion: user.securityQuestion || "What is your favorite coding topic?"
    });
});

/**
 * --------------------------------------------------------------------------
 * ROUTE: POST /api/auth/forgot-password-step2
 * --------------------------------------------------------------------------
 * Verifies security answer and resets the user's password.
 */
router.post('/forgot-password-step2', (req, res) => {
    const { email, securityAnswer, newPassword } = req.body;
    
    if (!email || !securityAnswer || !newPassword) {
        return res.status(400).json({ success: false, message: "Please provide all required fields." });
    }
    
    const user = dbSim.getUserByEmail(email);
    if (!user) {
        return res.status(404).json({ success: false, message: "No account found with this email address." });
    }
    
    // Check security answer (case-insensitive and trimmed)
    const userAnswer = securityAnswer.trim().toLowerCase();
    const storedAnswer = (user.securityAnswer || "mern").trim().toLowerCase();
    
    if (userAnswer !== storedAnswer) {
        return res.status(400).json({ success: false, message: "Incorrect security answer." });
    }
    
    // Reset password
    const success = dbSim.resetUserPassword(email, newPassword);
    if (success) {
        return res.json({ success: true, message: "Your password has been successfully reset. Please log in." });
    } else {
        return res.status(500).json({ success: false, message: "Failed to reset password." });
    }
});

module.exports = router;
