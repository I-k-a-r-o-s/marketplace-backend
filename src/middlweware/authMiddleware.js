import jwt from "jsonwebtoken";

export const protectedRoute = (req, res, next) => {
  const token = req.cookies["auth-token"];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized!",
    });
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    return next();
  } catch (error) {
    console.log("Error in protectedRoute!:", error);
    return res.status(401).json({
      success: false,
      message: "Unauthorized!",
    });
  }
};
