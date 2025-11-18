require("dotenv").config(); // load .env first
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Use env variables
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("❌ ERROR: MONGO_URI is missing in .env");
  process.exit(1);
}

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB connected!"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

app.get("/", (req, res) => res.send("Backend running!"));

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
