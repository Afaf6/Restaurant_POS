const Auth = require("../models/Auth");
const jwt = require("jsonwebtoken");

const protect = async (req, res) => {
    let token; 
    if (req.header.authorization && 
        req.header.authorization.startsWith("Bearer")
    ) {
    try {
        toke = req.header.authorization.split(" ")[1];
        

        const decoded = jwt.verify(
            token, process.env.JWT_SECRET
        );

        req.auth = await Auth.findById(decoded.id).select("-password")
        next();

    } catch (error) {
        res.status(401).json({
            msg: "Not Authorized"
        });
    }
   } else {
    res.status(401).json({
        msg: "Not Token"
    })
   }
};

module.exports = protect;