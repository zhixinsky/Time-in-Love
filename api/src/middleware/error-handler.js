export function errorHandler(err, _req, res, _next) {
  const status = err.status || 500
  res.status(status).json({
    code: err.code || 'INTERNAL_ERROR',
    message: err.message || '服务器开小差了'
  })
}

export function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)
}
