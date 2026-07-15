function logger(req, res, next) {
  console.log("info about this request is ", req.method, req.url);
  next();
}

module.exports = { logger };
