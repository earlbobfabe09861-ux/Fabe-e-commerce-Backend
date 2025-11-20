require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require('jsonwebtoken'); 
const path = require('path'); 

const app = express();
app.use(cors());
app.use(express.json());

// 🔥 FIX: Serve static files (images, frontend assets) from the 'public' directory.
// If your frontend builds to 'build' or 'dist', change 'public' below.
app.use(express.static(path.join(__dirname, 'public')));

// Models
const User = require('./models/User.js'); 
const Product = require('./models/Product.js');
const Order = require('./models/Order.js');

// JWT Token Generator
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// Middleware: General Authentication Check (Protect routes for logged-in users)
const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select('-password'); 
            
            if (!req.user) return res.status(404).json({ message: 'User not found.' });
            
            next();
        } catch (error) {
            res.status(401).json({ message: 'Not authorized, token failed or expired' });
        }
    } else {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

// Middleware: Admin Check (Extends general protection)
const isAdmin = (req, res, next) => {
    if (req.user && req.user.isAdmin) {
        next();
    } else {
        res.status(403).json({ message: 'Forbidden: Not an administrator' });
    }
};

// Seeding Function: Creates Admin if one doesn't exist
const seedAdminUser = async () => {
    const adminEmail = "admin123@gmail.com";
    const adminPassword = "admin345";

    const adminUser = await User.findOne({ email: adminEmail });

    if (!adminUser) {
        console.log('⏳ Creating default admin user...');
        const newAdmin = new User({
            name: 'Main Admin',
            email: adminEmail,
            password: adminPassword,
            isAdmin: true
        });
        await newAdmin.save();
        console.log(`✅ Default Admin Created! Login: ${adminEmail} / ${adminPassword}`);
    } else {
        if (!adminUser.isAdmin) {
             adminUser.isAdmin = true;
             await adminUser.save();
             console.log('Existing user updated to Admin capability.');
        }
        console.log('Admin user already exists. Skipping creation.');
    }
};

// Database Connection
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
    .then(async () => {
        console.log('✅ Database connected successfully!');
        await seedAdminUser();
        app.listen(PORT, () => console.log(`🌍 Server running on port ${PORT}`));
    })
    .catch((error) => {
        console.error('❌ MongoDB Connection Error:', error.message);
        process.exit(1); 
    });

// -------------------- AUTH & USER ROUTES --------------------

// Admin Login
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email }).select('+password');

        if (user && (await user.matchPassword(password))) {
            if (!user.isAdmin) return res.status(403).json({ message: 'Access Denied: Not an administrator' });

            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create User 
app.post('/api/users', async (req, res) => {
    try {
        const { name, email, password } = req.body; 
        const newUser = new User({ name, email, password }); 
        const savedUser = await newUser.save();
        res.status(201).json({ 
            _id: savedUser._id, 
            name: savedUser.name, 
            email: savedUser.email,
            token: generateToken(savedUser._id), 
        });
    } catch (error) {
        if (error.code === 11000) return res.status(400).json({ message: 'Email already in use.' });
        res.status(400).json({ message: error.message });
    }
});

// Read All Users (Admin) 
app.get('/api/users', protect, isAdmin, async (req, res) => {
    try {
        const users = await User.find().select('-password'); 
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete User (Admin) 
app.delete('/api/users/:id', protect, isAdmin, async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'Deleted User' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// -------------------- PRODUCTS ROUTES --------------------

// Read All Products
app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find({});
        res.json(products);
    } catch (error) {
        console.error("Failed to load products:", error);
        res.status(500).json({ 
            message: 'Error loading products.',
            error: error.message
        });
    }
});

// Create Product (Admin) 
app.post('/api/products', protect, isAdmin, async (req, res) => {
    try {
        const newProduct = new Product(req.body); 
        const savedProduct = await newProduct.save();
        res.status(201).json(savedProduct);
    } catch (error) {
        if (error.code === 11000) return res.status(400).json({ message: 'Product name already exists.' });
        res.status(400).json({ message: 'Failed to create product.', details: error.message });
    }
});

// Update Product (Admin) 
app.put('/api/products/:id', protect, isAdmin, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        
        if (product) {
            // Update fields here...
            product.name = req.body.name || product.name;
            product.price = req.body.price || product.price;
            product.stock = req.body.stock || product.stock;
            product.description = req.body.description || product.description;
            product.image = req.body.image || product.image;
            product.category = req.body.category || product.category;

            const updatedProduct = await product.save();
            res.json(updatedProduct);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(400).json({ message: 'Failed to update product.', details: error.message });
    }
});

// Delete Product (Admin)
app.delete('/api/products/:id', protect, isAdmin, async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.json({ message: 'Product successfully deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete product.', details: error.message });
    }
});

// -------------------- ORDER/BUY ROUTES --------------------

// Create New Order
app.post('/api/orders', protect, async (req, res) => {
    const {
        orderItems,
        shippingAddress,
        totalPrice,
    } = req.body;

    if (orderItems && orderItems.length === 0) {
        res.status(400).json({ message: 'No order items' });
        return;
    }

    try {
        const order = new Order({
            user: req.user._id, 
            orderItems,
            shippingAddress,
            totalPrice,
        });

        const createdOrder = await order.save();
        res.status(201).json(createdOrder);
    } catch (error) {
        res.status(400).json({ message: 'Error creating order.', details: error.message });
    }
});