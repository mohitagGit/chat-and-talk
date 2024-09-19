const unknownEndpoint = (req, res) => {
  res.status(404).json({ error: "Unknown API endpoint" });
};

const errorHandler = (err, req, res, next) => {
  return res
    .status(res.statusCode)
    .json({ error: err.message, stack: err.stack });
};

module.exports = { unknownEndpoint, errorHandler };
