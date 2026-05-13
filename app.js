require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));

app.use(express.json());

async function connection_DB() {
    try {
        await mongoose.connect(process.env.DB_URL);
        console.log("Connected to DB")
    } catch (error) {
        console.log(error);
    }
}
connection_DB();

const AuthRoute = require("./routes/AuthRoute");
app.use("/api", AuthRoute);

app.use("/api/products", require("./routes/productRoutes"));

const orderRoutes = require("./routes/orderRoutes");
app.use("/api/order", orderRoutes)

const Dashboard = require("./routes/Dashboard");
app.use("/api", Dashboard)

const port = process.env.PORT || 4000;

app.listen(port, () => {
    console.log(`Server Is Running ${port}`);
})