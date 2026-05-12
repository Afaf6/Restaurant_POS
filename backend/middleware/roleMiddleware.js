const isAdmin = (req, res, next) => {
    if (req.user && req.user.role.toLowerCase() === "admin") {
        next();
    } else {
        res.status(403).json({ msg: "Access Denied: Admin permissions required"});
    }
};

// Flexible role-based middleware
const restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.map(r => r.toLowerCase()).includes(req.user.role.toLowerCase())) {
            return res.status(403).json({ 
                success: false,
                message: "Access Denied: You do not have permission to perform this action" 
            });
        }
        next();
    };
};

module.exports = { isAdmin, restrictTo };