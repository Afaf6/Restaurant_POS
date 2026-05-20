// Role hierarchy: Super Admin > Team Leader > Cashier

const ROLES = {
    SUPER_ADMIN:  "super admin",
    TEAM_LEADER:  "team leader",
    CASHIER:      "cashier"
};

// Generic role restrictor
const restrictTo = (...roles) => (req, res, next) => {
    if (!req.auth || !roles.includes(req.auth.role.toLowerCase())) {
        return res.status(403).json({ msg: "Access Denied: You do not have permission" });
    }
    next();
};

// Super Admin only
const isSuperAdmin = restrictTo(ROLES.SUPER_ADMIN);

// Super Admin or Team Leader
const isAdminOrLeader = restrictTo(ROLES.SUPER_ADMIN, ROLES.TEAM_LEADER);

// All authenticated users (just needs protect middleware before it)
const isAuthenticated = (req, res, next) => {
    if (!req.auth) return res.status(403).json({ msg: "Access Denied" });
    next();
};

// Legacy alias kept so existing imports don't break
const isAdmin = isAdminOrLeader;

module.exports = { restrictTo, isSuperAdmin, isAdminOrLeader, isAuthenticated, isAdmin };
