const attachCompanyId = (req, res, next) => {
  try {
    if (req.user.role === "admin") {
      req.companyId = req.user.id;
    } else if (req.user.role === "employee") {
      req.companyId = req.user.companyId;
    } else if (req.user.role === "superadmin") {
      req.companyId = null;
    }
    next();
  } catch (err) {
    res.status(500).json({ message: "Company attach error" });
  }
};

module.exports = attachCompanyId;
