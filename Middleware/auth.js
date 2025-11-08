const jwt = require("jsonwebtoken");
const userTbl = require("../Modals/User");

module.exports = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token)
      return res.status(401).json({ success: false, message: "No token provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // ✅ this must include companyId from JWT

    // (Optional: fetch user details)
    const dbUser = await userTbl.findById(decoded.id);
    if (!dbUser)
      return res.status(404).json({ success: false, message: "User not found" });

    req.user.role = dbUser.role;
    req.user.email = dbUser.email;
    req.user.name = dbUser.name;
    req.user.companyId = dbUser.companyId || decoded.companyId; // ✅ ensures it exists
    next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};
