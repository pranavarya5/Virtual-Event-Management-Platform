const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const config = require("../config/config");
const { findUserByEmail, addUser } = require("../data/users");
const { validateRegistration } = require("../utils/validators");

/**
 * Register a new user
 * POST /register
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // Validate input
    const errors = validateRegistration(name, email, password, role);
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    // Check if user already exists
    const existingUser = findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: "User with this email already exists" });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const newUser = {
      id: uuidv4(),
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: role || "attendee", // default role is attendee
      createdAt: new Date().toISOString(),
    };

    addUser(newUser);

    // Generate JWT token
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
      token,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login a user
 * POST /login
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Find user
    const user = findUserByEmail(email.toLowerCase().trim());
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );

    res.status(200).json({
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
};
