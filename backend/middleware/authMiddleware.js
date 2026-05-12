/**
 * AUTHENTICATION MIDDLEWARE
 * Verifies the JWT token from the request headers and attaches the user to the request.
 * 
 * NOTE: Currently configured with a bypass for development convenience.
 */

const Auth = require("../models/Auth");
const jwt = require("jsonwebtoken");

/**
 * Protects routes from unauthorized access.
 * If a valid token is found, it populates req.user.
 * If no token is found, it defaults to a Guest Admin role (Development Mode).
 */
const protect = async (req, res, next) => {
    let token; 
    
    // Check for token in Authorization header
    if (req.headers && req.headers.authorization && 
        req.headers.authorization.startsWith("Bearer")
    ) {
        try {
            // Extract token from "Bearer <token>" string
            token = req.headers.authorization.split(" ")[1];
            
            // Verify token using secret key
            const decoded = jwt.verify(
                token, process.env.JWT_SECRET
            );

            // Fetch user details from database (excluding password)
            req.user = await Auth.findById(decoded.id).select("-password");
            
            if (!req.user) {
                // If token is valid but user no longer exists, allow as guest admin for dev
                req.user = { 
                    _id: "000000000000000000000000",
                    userName: "Guest Admin", 
                    role: "Admin", 
                    email: "guest@dev.com" 
                };
            }

            next();

        } catch (error) {
            console.error("Auth Middleware Error:", error.message);
            
            // DEVELOPMENT BYPASS: Even on token error, allow access as guest admin
            req.user = { 
                _id: "000000000000000000000000",
                userName: "Guest Admin", 
                role: "Admin", 
                email: "guest@dev.com" 
            };
            next();
        }
    } else {
        // DEVELOPMENT BYPASS: Allow access without a token
        // No token? No problem! Treating as Guest Admin for development
        req.user = { 
            _id: "000000000000000000000000",
            userName: "Guest Admin", 
            role: "Admin", 
            email: "guest@dev.com" 
        };
        next();
    }
};

module.exports = protect;