const Auth = require("../models/Auth");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {registerValid,loginValid} = require ("./validation/AuthValid");

const register = async (req, res) => {
    try {
        const {error} = registerValid.validate(req.body, {abortEarly: false});

        if (error) {
            return res.status(400).json({
                message: error.details.map(d => d.message)
            });
        };

        const {userName, email, password} = req.body;

        const existUser =  await Auth.findOne({email});

        if (existUser) return res.status(400).json({
            message: "This Email already taken"
        });

        const hashingPassword = await bcrypt.hash(password, 10);

        const user = await Auth.create({
            userName,
            email,
            password : hashingPassword,
        });

        res.status(201).json({
            message: "Create Account Successfly",
            data: {
                id: user._id,
                userName: user.userName,
                email: user.email
            }
        })
         

    } catch (error) {
        res.status(500).json({
         msg: error.message
        })
    }
}

const loginAuth = async(req, res) => {
    try {
        const {email, password} = req.body;

        const {error} = loginValid.validate(req.body, {abortEarly: false});

        
        
        const auth = await Auth.findOne({email});

        if(!auth) {
            return res.status(400).json({
                message: "Account not found. Please create an account."});
        }

        const matchPassword = await bcrypt.compare(password, auth.password);

        if(!matchPassword) {
            return res.status(400).json({
                message: "Incorrect Password"
            });
        };

        const token = jwt.sign(
            {
                id: auth._id,
                role: "Admin", // Forced Admin role for development
                email: auth.email
            },
             process.env.JWT_SECRET, 
            {
                expiresIn: "1d"
            })

        res.status(200).json({
            message: "Login Success",
            token,
        })

    } catch (error) {

    console.error(error);

    return res.status(500).json({
        msg: "Login Failed"
    });
}
};


module.exports = { 
    register,
    loginAuth,
}