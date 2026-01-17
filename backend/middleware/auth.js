import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config.js";

export default function (req, res, next) {
  let token = req.header("Authorization");

  if (!token) return res.status(401).json({ message: "No token" });

  // Accept tokens prefixed with 'Bearer '
  if (token.startsWith("Bearer ")) token = token.slice(7);

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    // don't leak the token, but log a short debug hint
    console.debug("Auth failed for token (first 8 chars):", token?.slice(0, 8));
    res.status(401).json({ message: "Invalid token" });
  }
}
