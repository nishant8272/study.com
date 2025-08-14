const jwt = require("jsonwebtoken");

async function adminAuth(req, res, next) {
    try {
        console.log("AdminAuth middleware triggered");
        let token =req.headers["authorization"] || req.headers["Authorization"];
        console.log("Token received:", token ? "Yes" : "No");

        if (!token) {
            console.log("No token provided");
            return res.status(401).send({ msg: "Please Login First" });
        }

        if (token.startsWith("Bearer ")) {
            token = token.slice(7);
        }

        console.log("JWT_SECRET_ADMIN exists:", !!process.env.JWT_SECRET_ADMIN);
        const decoded = jwt.verify(token, process.env.JWT_SECRET_ADMIN);
        console.log("Token decoded successfully:", !!decoded);
        console.log("Decoded email:", decoded?.email);

        if (decoded) {
            req.email = decoded.email;
            next();
        } else {
            console.log("Token decode failed");
            return res.status(401).send({ msg: "User is invalid or expired" });
        }
    } catch (err) {
        console.error("AdminAuth error:", err.message);
        console.error("AdminAuth error stack:", err.stack);
        return res.status(500).send({ msg: err.message });
    }
}

module.exports = {
    adminAuth
}
