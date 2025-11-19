// This is your complete and final server.js file

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

// Your existing database connection - THIS IS GOOD
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB connected!"))
  .catch(err => console.error("❌ MongoDB connection error:", err));


// =================================================================
// PASTE THE NEW CODE HERE
// This is the new part that adds the API for users
// =================================================================

// First, get the User model you created in models/User.js
const User = require('./models/User.js');

// 1. CREATE a new user (for your 'Add User' button)
app.post('/api/users', async (req, res) => {
  try {
    const newUser = new User({
      name: req.body.name,
      email: req.body.email,
    });
    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 2. READ all users (to display the list on your page)
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 3. READ a single user by ID (useful for later)
app.get('/api/users/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'Cannot find user' });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 4. UPDATE a user by ID (for an 'Edit' button)
app.put('/api/users/:id', async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true } // This option returns the updated document
    );
    res.json(updatedUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 5. DELETE a user by ID (for a 'Delete' button)
app.delete('/api/users/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted User' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// =================================================================
// END OF NEW CODE
// =================================================================


// Your existing server start code - THIS IS GOOD
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));