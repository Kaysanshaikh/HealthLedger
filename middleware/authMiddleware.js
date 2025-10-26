module.exports = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header) {
    return res.status(401).json({ error: "Authorization header required" });
  }

  const token = header.replace(/^Bearer\s+/i, "");
  if (!process.env.JWT || token !== process.env.JWT) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }

  req.user = { token };
  return next();
};
