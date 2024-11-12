const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');
const User = require('../models/User'); // Now importing SQLite model
require('dotenv').config();

const router = express.Router();

// 1. User Signup (POST)
router.post(
  '/signup',
  [
    check('username', 'Username is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password must be at least 6 characters').isLength({ min: 6 })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password } = req.body;

    try {
      // Check if the user already exists
      User.findUserByEmail(email, (err, user) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }
        if (user) {
          return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password before saving
        bcrypt.genSalt(10, (err, salt) => {
          if (err) throw err;

          bcrypt.hash(password, salt, (err, hashedPassword) => {
            if (err) throw err;

            // Create new user
            User.createUser(username, email, hashedPassword, (err, newUser) => {
              if (err) {
                return res.status(500).json({ error: 'Error creating user' });
              }

              // Generate JWT token
              const payload = { id: newUser.id };
              const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

              res.status(201).json({ token });
            });
          });
        });
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// 2. User Login (POST)
router.post(
  '/login',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      // Check if the user exists
      User.findUserByEmail(email, (err, user) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }
        if (!user) {
          return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Validate password
        bcrypt.compare(password, user.password, (err, isMatch) => {
          if (err) throw err;
          if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
          }

          // Generate JWT token
          const payload = { id: user.id };
          const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

          res.json({ token });
        });
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

module.exports = router;
