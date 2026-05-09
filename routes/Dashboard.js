
const express = require("express");
const router = express.Router();
const protected = require("../middleware/authMiddleware");

const {getData} = require("../controllers/Dashboard");
const { route } = require("./AuthRoute");

router.get("/showDashboard", protected, getData);

module.exports = router;