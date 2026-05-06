const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === "admin") {
        next();
    } else {
        res.status(403).json({ msg: "Access Denied: Admin permessions required"});
    }
};
module.exports = isAdmin;