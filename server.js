const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const authRouter = require("./routes/auth");
const usersRouter = require("./routes/users");
const recordsRouter = require("./routes/records");
const registerRouter = require("./routes/register");
const searchRouter = require("./routes/search");
const profileRouter = require("./routes/profile");

const app = express();

// ✅ Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Configure CORS properly for Render + Netlify
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

// ✅ Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", environment: process.env.NODE_ENV || "development", timestamp: Date.now() });
});

// ✅ API routes
app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter);
app.use("/api/records", recordsRouter);
app.use("/api/register", registerRouter);
app.use("/api/search", searchRouter);
app.use("/api/profile", profileRouter);

// ✅ Catch-all for unknown API routes
app.all("/api/*", (req, res) => {
  res.status(404).json({
    error: "Endpoint not found",
    path: req.originalUrl,
    method: req.method,
  });
});

// ✅ Optional: Serve static files (if you ever host frontend here)
const clientBuildPath = path.join(__dirname, "frontend", "build");
app.use(express.static(clientBuildPath));

app.get("*", (req, res) => {
  res.sendFile(path.join(clientBuildPath, "index.html"));
});

// ✅ Start server
const port = process.env.PORT || 5001;
app.listen(port, "0.0.0.0", () => {
  console.log(`✅ HealthLedger API listening on port ${port}`);
});
