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
const helmet = require("helmet");
const cors = require("cors");

// Create Express application
const app = express();

const allowedOrigins = [
    process.env.FRONTEND_URL,
    "http://localhost:3000",
    "http://127.0.0.1:3000"
].filter(Boolean);

app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            imgSrc: ["'self'", "data:", "https:"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            connectSrc: ["'self'", "http://localhost:5000", "http://localhost:3000"],
            objectSrc: ["'none'"],
            upgradeInsecureRequests: []
        }
    },
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(cors({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());
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
const teacherRoutes = require("./routes/teacherRoutes");
const departmentRoutes = require("./routes/departmentRoutes");
const courseRoutes = require("./routes/courseRoutes");
const authRoutes = require("./routes/authRoutes");
const announcementRoutes = require("./routes/announcementRoutes");
const protectedRoutes = require("./routes/protectedRoutes");

const studentPortalRoutes = require("./routes/studentPortalRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/protected", protectedRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/teachers", teacherRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/student", studentPortalRoutes);

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