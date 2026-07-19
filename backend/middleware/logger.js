const { winstonLogger } = require('../utils/logger.js');

function logger(req, res, next) {
  winstonLogger.info(`${req.method} ${req.url} - ${req.ip}`);
  next();
}

module.exports = { logger };
