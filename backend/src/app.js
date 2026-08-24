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
    ...(process.env.NODE_ENV === "production" ? [] : [
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ])
].filter(Boolean);

app.use(helmet({
    frameguard: { action: "deny" },
    noSniff: true,
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    hsts: process.env.NODE_ENV === "production" ? {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
    } : false,
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            imgSrc: ["'self'", "data:", "https:"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            connectSrc: ["'self'", "http://localhost:5000", "http://localhost:3000"],
            objectSrc: ["'none'"],
            upgradeInsecureRequests: process.env.NODE_ENV === "production" ? [] : null,
            reportUri: ["/api/security/csp-report"]
        }
    },
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use((req, res, next) => {
    res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=()");
    next();
});

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
            return;
        }
        callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post("/api/security/csp-report", express.json({ type: ["application/csp-report", "application/reports+json"] }), (req, res) => {
    const report = req.body?.['csp-report'] || req.body;
    console.warn("CSP violation reported", {
        documentUri: report?.documentURI || report?.documentURL,
        violatedDirective: report?.violatedDirective,
        blockedUri: report?.blockedURI,
    });
    return res.status(204).send();
});

/**
 * =====================================================
 * 2. CUSTOM LOGGER MIDDLEWARE
 * =====================================================
 */
const logger = require("./middleware/loggerMiddleware");
const apiGateway = require("./middleware/apiGatewayMiddleware");
app.use(apiGateway);
app.use(logger);

app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.get('/live', (req, res) => res.json({ status: 'alive' }));
app.get('/ready', async (req, res) => {
    const { pool } = require('./config/db');
    const { redisHealth } = require('./config/redis');
    try {
        const connection = await pool.getConnection();
        connection.release();
        const redis = await redisHealth();
        if (redis.configured && !redis.healthy) return res.status(503).json({ status: 'not ready' });
        return res.json({ status: 'ready' });
    } catch (error) {
        return res.status(503).json({ status: 'not ready' });
    }
});

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

app.use("/api/auth", authRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/protected", protectedRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/teachers", teacherRoutes);
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