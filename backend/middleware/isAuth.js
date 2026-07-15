const jwt = require("jsonwebtoken");
const { promisify } = require("util");

async function isAuth(req, res, next) {
  let token = req.headers.token;
  if (!token) {
    return res.status(400).json({ msg: "you are not authorized, please login first" });
  }

  try {
    let decoded = await promisify(jwt.verify)(token, process.env.SECRET);
    //attach user data to request
    req.user = decoded;
    next();
  } catch (err) {
    console.log(err);
    res
      .status(401)
      .json({ msg: "you are not authorized, try login again", err: err });
  }
}

module.exports = { isAuth };
