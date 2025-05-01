const axios = require("axios");
const mongoose = require("mongoose");
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const app = express();
const PORT = 3000;
const JWT_SECRET = "ggiz6ywn6yali2p6qa1belilujvn4lsv"; // Change this in production!

app.use(express.json());
app.use(cors());

// MongoDB Connection
const MONGO_URI = "mongodb+srv://QliShad251:Cuong25120022020@qlishad251.w8hfh.mongodb.net/Weather?retryWrites=true&w=majority&appName=QliShad251";

mongoose.connect(MONGO_URI)
    .then(() => console.log("✅ Connected to MongoDB Atlas"))
    .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// User Schema
const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});
const User = mongoose.model("User", UserSchema);

// Telemetry Schema
const TelemetrySchema = new mongoose.Schema({
    key: String,
    value: mongoose.Schema.Types.Mixed,
    timestamp: { type: Date, default: Date.now }
});
const Telemetry = mongoose.model("Telemetry", TelemetrySchema);

// 🔐 Register
app.post("/api/register", async (req, res) => {
    const { email, password } = req.body;

    try {
        const existing = await User.findOne({ email });
        if (existing) return res.status(400).json({ error: "User already exists" });

        const hashed = await bcrypt.hash(password, 10);
        const newUser = new User({ email, password: hashed });
        await newUser.save();
        res.status(201).json({ message: "User registered successfully" });
    } catch (err) {
        res.status(500).json({ error: "Registration failed" });
    }
});

// 🔐 Login
app.post("/api/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ error: "Invalid credentials" });

        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(400).json({ error: "Invalid credentials" });

        const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: "2h" });
        res.json({ token });
    } catch (err) {
        res.status(500).json({ error: "Login failed" });
    }
});

// 🔐 Middleware: Authenticate JWT
const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "No token provided" });

    const token = authHeader.split(" ")[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ error: "Invalid token" });
    }
};

// 📡 Protected route: Get latest telemetry data
app.get("/api/latest-data", authMiddleware, async (req, res) => {
    try {
        const latestData = await Telemetry.aggregate([
            { $sort: { timestamp: -1 } },
            {
                $group: {
                    _id: "$key",
                    latest: { $first: "$$ROOT" }
                }
            }
        ]);
        const formatted = {};
        latestData.forEach(doc => {
            formatted[doc._id.toLowerCase().replace(/\s|:/g, "")] = [{
                value: doc.latest.value
            }];
        });

        res.json(formatted);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch data" });
    }
});

// 📥 Fetch ThingsBoard telemetry data
const THINGSBOARD_URL = "https://app.coreiot.io";
const DEVICE_ID = "b40a0c40-0ecc-11f0-a887-6d1a184f2bb5";
const JWT_TOKEN = "Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJ0aGluaC5uZ3V5ZW4uMTgwMUBoY211dC5lZHUudm4iLCJ1c2VySWQiOiI4YzRlMGU3MC1mZGFkLTExZWYtYTg4Ny02ZDFhMTg0ZjJiYjUiLCJzY29wZXMiOlsiQ1VTVE9NRVJfVVNFUiJdLCJzZXNzaW9uSWQiOiJiOWViNjdkZi1hMzY2LTRkYTktYTM1Yy1hNDA1ZjVhNjFmNDUiLCJleHAiOjE3NDYxMDkyMjcsImlzcyI6ImNvcmVpb3QuaW8iLCJpYXQiOjE3NDYxMDAyMjcsImZpcnN0TmFtZSI6IlRo4buLbmgiLCJsYXN0TmFtZSI6Ik5ndXnhu4VuIiwiZW5hYmxlZCI6dHJ1ZSwiaXNQdWJsaWMiOmZhbHNlLCJ0ZW5hbnRJZCI6ImJiOGMyZmEwLWRkNTUtMTFlZi1hYjAzLTA5YWExNWUyNmZmYiIsImN1c3RvbWVySWQiOiIwMzYwYThkMC1mYTg3LTExZWYtYTg4Ny02ZDFhMTg0ZjJiYjUifQ.wiyLX1DEowKn6hh-j153PE8jicrqyxyBzZecDmOglTyLcQW7X517axFQEpvLiC8b-V8nLsFrxG5K6IIs_DHXPw";

const fetchAndStoreTelemetry = async () => {
    try {
        const response = await axios.get(
            `${THINGSBOARD_URL}/api/plugins/telemetry/DEVICE/${DEVICE_ID}/values/timeseries`,
            { headers: { "X-Authorization": `Bearer ${JWT_TOKEN}` } }
        );

        const telemetryData = response.data;
        for (const key in telemetryData) {
            const newData = new Telemetry({
                key: key,
                value: telemetryData[key][0].value,
                timestamp: new Date(telemetryData[key][0].ts)
            });
            await newData.save();
        }

        console.log("✅ Telemetry saved to DB.");
    } catch (err) {
        console.error("❌ Telemetry fetch error:", err.message);
    }
};

// ⏱ Fetch every 5 mins
setInterval(fetchAndStoreTelemetry, 300000);
fetchAndStoreTelemetry();

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
