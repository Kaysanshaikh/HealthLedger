// routes/auth.js
const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// ✅ POST route (for token generation)
router.post("/token", authController.getAdminToken);

// ✅ NEW: Simple GET route (for browser testing)
router.get("/login", (_req, res) => {
  res.json({
    message: "Auth route active. Use POST /api/auth/token to get your admin token.",
  });
});

module.exports = router;
