/**
 * =====================================================
 * app.js
 * -----------------------------------------------------
 * Purpose:
 * This file configures the Express application.
 *
 * Responsibilities:
 *
 * 1. Create Express application
 * 2. Register built-in middleware
 * 3. Register custom middleware
 * 4. Register API routes
 * 5. Handle unknown routes (404)
 * 6. Handle application errors
 * 7. Export configured app
 * =====================================================
 */

// Import Express framework
const express = require("express");

// Import CORS (Cross-Origin Resource Sharing)
const cors = require("cors");

// Create Express application
const app = express();

/**
 * =====================================================
 * 1. BUILT-IN MIDDLEWARE
 * =====================================================
 */

// Enable CORS for all routes (MUST come before routes)
app.use(cors());

// Allows Express to read JSON data
app.use(express.json());

// Allows receiving form data
app.use(express.urlencoded({ extended: true }));

/**
 * =====================================================
 * 2. CUSTOM LOGGER MIDDLEWARE
 * =====================================================
 */
const logger = require("./middleware/loggerMiddleware");
app.use(logger);

/**
 * =====================================================
 * 3. ROUTES
 * =====================================================
 */
const studentRoutes = require("./routes/studentRoutes");
const departmentRoutes = require("./routes/departmentRoutes");
const courseRoutes = require("./routes/courseRoutes");

app.use("/api/students", studentRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/courses", courseRoutes);

/**
 * =====================================================
 * 4. ROOT ROUTE
 * =====================================================
 */
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Welcome to Student Management API"
    });
});

/**
 * =====================================================
 * 5. 404 NOT FOUND MIDDLEWARE
 * =====================================================
 */
const notFound = require("./middleware/notFoundMiddleware");
app.use(notFound);

/**
 * =====================================================
 * 6. GLOBAL ERROR HANDLER
 * =====================================================
 */
const errorHandler = require("./middleware/errorMiddleware");
app.use(errorHandler);

module.exports = app;