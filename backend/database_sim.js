/**
 * ==============================================================================
 * ZERO HUNGER DATABASE SIMULATION ENGINE (TRAINING & BOOTCAMP EDITION)
 * ==============================================================================
 * 
 * CONCEPT: In-Memory Datastore Simulation
 * ---------------------------------------
 * In a real production application, you would connect to a database like MongoDB 
 * using Mongoose, or PostgreSQL using Sequelize.
 * 
 * To make this training app run immediately without requiring local database setup
 * or complex installations, we simulate our collections (users, donations, logs)
 * inside a simple, global JS object ('state'). All operations (create, read, update)
 * mimic actual asynchronous database transactions.
 */

// Import the 'bcryptjs' package to securely hash user passwords.
// Security Rule: NEVER store raw text passwords in databases!
const bcrypt = require('bcryptjs');

// This state object simulates database tables/collections.
const state = {
    // 1. Users Table: Stores registered actors (Donors, NGOs, Volunteers, Vendors, Admins)
    users: [],
    
    // 2. Donations Table: Stores surplus food listings and their redistribution status
    donations: [
        {
            id: "DON-101",
            item: "Chicken Curry & Naan",
            quantityKgs: 15,
            hoursRemaining: 1.5,
            type: "Non-Veg",
            status: "Available",
            donorName: "Grand Taj Banquet Noida",
            location: "Sector 62, Noida"
        },
        {
            id: "DON-102",
            item: "Mixed Vegetable Pulav",
            quantityKgs: 30,
            hoursRemaining: 4,
            type: "Veg",
            status: "Available",
            donorName: "Grand Taj Banquet Noida",
            location: "Sector 18, Noida"
        },
        {
            id: "DON-103",
            item: "Paneer Masala Boxes",
            quantityKgs: 10,
            hoursRemaining: 0.8,
            type: "Veg",
            status: "Available",
            donorName: "Grand Taj Banquet Noida",
            location: "Sector 50, Noida"
        }
    ],
    
    // 3. System Logs Table: Audit trail logging actions for administrator oversight
    logs: [
        { timestamp: new Date().toLocaleTimeString(), activity: "Simulated Database Engine Initialized." }
    ]
};

/**
 * PASSWORD ENCRYPTION BOOTCAMP CONCEPT: Salting & Hashing
 * ------------------------------------------------------
 * 1. salt: Random string appended to the password before hashing to defend against rainbow table attacks.
 * 2. hash: Mathematical one-way function that turns input password into a fixed-length string.
 */
const salt = bcrypt.genSaltSync(10);
const defaultHash = bcrypt.hashSync('password123', salt); // Preseeded password is 'password123'

// Seed initial mockup data so the platform is ready-to-test out of the box!
state.users = [
    { id: "USR-001", name: "Grand Taj Banquet Noida", email: "donor@zerohunger.org", password: defaultHash, role: "Donor", hasFssai: true, licenseId: "FSSAI-123456789", securityQuestion: "What is your favorite coding topic?", securityAnswer: "mern" },
    { id: "USR-002", name: "Feed The Children Foundation NGO", email: "ngo@zerohunger.org", password: defaultHash, role: "NGO", targetUnits: "Noida Sector 62", securityQuestion: "What is your favorite coding topic?", securityAnswer: "mern" },
    { id: "USR-003", name: "Ravi Kumar Logistics", email: "volunteer@zerohunger.org", password: defaultHash, role: "Volunteer", phone: "9876543210", securityQuestion: "What is your favorite coding topic?", securityAnswer: "mern" },
    { id: "USR-004", name: "Metro Commercial Kitchens", email: "vendor@zerohunger.org", password: defaultHash, role: "Vendor", discountOffers: [], securityQuestion: "What is your favorite coding topic?", securityAnswer: "mern" },
    { id: "USR-005", name: "System Administrator Core", email: "admin@zerohunger.org", password: defaultHash, role: "Admin", securityQuestion: "What is your favorite coding topic?", securityAnswer: "mern" }
];

// Helper to push system events into our audit logs
const logActivity = (activity) => {
    state.logs.push({
        timestamp: new Date().toLocaleTimeString(),
        activity
    });
};

/**
 * PUBLIC DATABASE METHOD EXPORTS
 * -----------------------------
 * These match common CRUD queries you would run via a Database ORM/driver.
 */
module.exports = {
    // READ: Retrieve all users
    getUsers: () => state.users,
    
    // CREATE: Register a new user securely
    addUser: (user) => {
        const newUser = {
            id: `USR-${Math.floor(10000 + Math.random() * 90000)}`, // Generate random 5-digit user ID
            ...user,
            password: bcrypt.hashSync(user.password, salt) // Securely encrypt client's password
        };
        state.users.push(newUser);
        logActivity(`Registered user: ${newUser.name} (${newUser.role})`);
        return newUser;
    },
    
    // READ: Find a single user by email (used inside login auth route)
    getUserByEmail: (email) => state.users.find(u => u.email.toLowerCase() === email.toLowerCase()),
    
    // READ: Retrieve all surplus listings
    getDonations: () => state.donations,
    
    // CREATE: Post a new food surplus batch
    addDonation: (donation) => {
        const newDonation = {
            id: `DON-${Math.floor(100 + Math.random() * 900)}`, // Generate random 3-digit listing ID
            status: "Available", // All food listings start as 'Available'
            ...donation
        };
        state.donations.push(newDonation);
        logActivity(`Food donation posted: ${newDonation.item} (${newDonation.quantityKgs}kg) by ${newDonation.donorName}`);
        return newDonation;
    },
    
    // UPDATE: Update a donation's logistics/assignment status (Claimed, Dispatched, Delivered)
    updateDonationStatus: (donationId, status, extraFields = {}) => {
        let updated = null;
        state.donations = state.donations.map(don => {
            if (don.id === donationId) {
                updated = { ...don, status, ...extraFields };
                return updated;
            }
            return don;
        });
        if (updated) {
            logActivity(`Donation ${donationId} status updated to ${status}`);
        }
        return updated;
    },
    
    // UPDATE: Update profile attributes from Edit Profile dialog box
    updateUserProfile: (userId, updatedFields) => {
        let updatedUser = null;
        state.users = state.users.map(u => {
            if (u.id === userId) {
                // Validation: Prevent updating to an email address already registered by someone else
                if (updatedFields.email && updatedFields.email !== u.email) {
                    const emailExists = state.users.some(other => other.id !== userId && other.email.toLowerCase() === updatedFields.email.toLowerCase());
                    if (emailExists) {
                        throw new Error("This email is already in use by another account.");
                    }
                }
                updatedUser = { ...u, ...updatedFields };
                // If a new password was typed, hash it before writing to database
                if (updatedFields.password && updatedFields.password.trim() !== '') {
                    updatedUser.password = bcrypt.hashSync(updatedFields.password, salt);
                }
                return updatedUser;
            }
            return u;
        });
        if (updatedUser) {
            logActivity(`Updated user profile: ${updatedUser.name} (${updatedUser.role})`);
        }
        return updatedUser;
    },
    
    // READ: Retrieve global audit logs (Admins only)
    getLogs: () => state.logs,
    
    // CREATE: Manually write custom transaction events to the audit trail
    logSystemEvent: (event) => logActivity(event),

    // UPDATE: Reset user password by email
    resetUserPassword: (email, newPassword) => {
        const user = state.users.find(u => u.email.toLowerCase() === email.toLowerCase());
        if (user) {
            user.password = bcrypt.hashSync(newPassword, salt);
            logActivity(`Reset password for user: ${user.name} (${user.role})`);
            return true;
        }
        return false;
    }
};
