/**
 * RESTAURANT POS BACKEND
 * Main entry point for the Express server.
 * Handles database connection, middleware setup, and route registration.
 */

require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

// Initialize Express application
const app = express();

// ========== GLOBAL MIDDLEWARE ==========

// Enable CORS (Cross-Origin Resource Sharing) to allow frontend access
app.use(cors());

// Parse incoming JSON requests
app.use(express.json());

// ========== DATABASE CONNECTION ==========

/**
 * Connects to MongoDB using connection string from environment variables.
 */
async function connection_DB() {
    try {
        await mongoose.connect(process.env.DB_URL);
        console.log("Connected to MongoDB Database")
    } catch (error) {
        console.error("Database Connection Error:", error);
    }
}
connection_DB();

// ========== ROUTES ==========

// Authentication Routes (Login/Register)
const AuthRoute = require("./routes/AuthRoute");
app.use("/api", AuthRoute);

// Product Management Routes
app.use("/api/products", require("./routes/productRoutes"));

// Order Management Routes
app.use("/api/orders", require("./routes/orderRoutes"));

// Inventory Management Routes
const inventoryRoutes = require("./routes/inventoryRoutes");
app.use("/api/inventory", inventoryRoutes);

// ========== SERVER INITIALIZATION ==========

const port = process.env.PORT || 4000;

app.listen(port, () => {
    console.log(`Server Is Running on port ${port}`);
});