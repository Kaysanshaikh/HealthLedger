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

// ✅ CORS setup
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "*",
    credentials: true,
  })
);

app.use(express.json());

// ✅ Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", environment: "production", timestamp: Date.now() });
});

// ✅ API routes
app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter);
app.use("/api/records", recordsRouter);
app.use("/api/register", registerRouter);
app.use("/api/search", searchRouter);
app.use("/api/profile", profileRouter);

// ✅ Serve React frontend
const frontendPath = path.join(__dirname, "frontend", "build");
app.use(express.static(frontendPath));

app.get("*", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

const port = process.env.PORT || 5001;
app.listen(port, () => {
  console.log(`✅ HealthLedger API + Frontend running on port ${port}`);
});
