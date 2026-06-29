import jwt from "jsonwebtoken";

const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

export const protectedRoute = (req, res, next) => {
  const token = req.cookies["auth-token"];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized!",
    });
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    return next();
  } catch (error) {
    console.log("Error in protectedRoute!:", error);
    return res.status(401).json({
      success: false,
      message: "Unauthorized!",
    });
  }
};
