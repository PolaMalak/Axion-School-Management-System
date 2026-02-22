module.exports = ({ meta, config, managers }) => {
  return ({ req, res, next }) => {
    const start = Date.now();
    res.on('finish', () => {
      const ms = Date.now() - start;
      const status = res.statusCode;
      const method = req.method;
      const url = req.originalUrl || req.url;
      console.log(`${method} ${url} ${status} - ${ms}ms`);
    });
    next();
  };
};
