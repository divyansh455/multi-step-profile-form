// backend/middleware/errorMiddleware.js
// Basic error handling middleware

// Middleware for handling "Not Found" errors (404)
const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error); // Pass the error to the next middleware (errorHandler)
};

// General error handler middleware
const errorHandler = (err, req, res, next) => {
  // Determine the status code: use the response status code if it's not 200, otherwise default to 500 (Internal Server Error)
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);

  // Send a JSON response with the error message
  // Include the stack trace only in development mode for debugging purposes
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};

export { notFound, errorHandler };
