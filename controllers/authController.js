const jwt = require("jsonwebtoken");

exports.getAdminToken = (req, res) => {
  const { apiKey, apiSecret } = req.body || {};

  if (
    apiKey !== process.env.API_Key ||
    apiSecret !== process.env.API_Secret ||
    !process.env.JWT
  ) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  return res.json({ token: process.env.JWT });
};
