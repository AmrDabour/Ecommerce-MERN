function isAdmin(req, res, next) {
  //check if user role is admin
  if (req.user.role !== "admin") {
    return res.status(403).json({ msg: "access denied, admin only" });
  }
  next();
}

module.exports = { isAdmin };
