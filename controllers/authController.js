const jwt = require("jsonwebtoken");

exports.getAdminToken = (req, res) => {
  try {
    const { apiKey, apiSecret } = req.body || {};

    // ✅ Use uppercase variable names for consistency
    if (
      apiKey !== process.env.API_KEY ||
      apiSecret !== process.env.API_SECRET ||
      !process.env.JWT_SECRET
    ) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // ✅ Option 1: Return a pre-generated static token (like you do now)
    // return res.json({ token: process.env.JWT_SECRET });

    // ✅ Option 2 (recommended): Generate a new JWT dynamically
    const token = jwt.sign(
      { user: "admin", issuedAt: Date.now() },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.json({ token });
  } catch (error) {
    console.error("Auth error:", error.message);
    res.status(500).json({ error: "Server error during token generation" });
  }
};
