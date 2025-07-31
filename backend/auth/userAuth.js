const jwt = require("jsonwebtoken");

async function userAuth(req, res, next) {
    try {
        let token = req.body.token || req.query.token || req.headers["authorization"];
        if (!token) {
            return res.status(401).send({ msg: "Please Login First" });
        }
      
        if (token.startsWith("Bearer ")) {
            token = token.slice(7);
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET_USER);
        if (decoded && decoded.email) {
            req.email= decoded.email;
            next();
        } else {
            return res.status(401).send({ msg: "User is invalid or expired" });
        }
    } catch (err) {
        return res.status(500).send({ msg: err.message });
    }
}

module.exports = {
    userAuth
}