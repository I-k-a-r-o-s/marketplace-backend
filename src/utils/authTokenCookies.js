import jwt from "jsonwebtoken";

const oneHour = 60 * 60 * 1000;

export const cookiesOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  path: "/",
  maxAge: oneHour,
};

const setCookie = (res, token) => {
  res.cookie("auth-token", token, cookiesOptions);
};

export const generateToken = (res, payload) => {
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });
  setCookie(res, token);
};
