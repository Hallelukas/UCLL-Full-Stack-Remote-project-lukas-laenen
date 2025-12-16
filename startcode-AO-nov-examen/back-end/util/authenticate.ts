import { verifyJwt } from "./jwt";

const authenticate = (req, res, next) => {
    const token = req.cookies.auth_token;

    if (!token) return res.status(401).json({ message: "Not authenticated" });

    const decoded = verifyJwt(token);
    if (!decoded) return res.status(401).json({ message: "Invalid token" });

    req.user = decoded;
    next();
}

export { authenticate }