const jwt = require("jsonwebtoken");
const auth = async (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    try {
        if (token) {
            jwt.verify(token, "user", (err, decoded) => {
                if (decoded) {
                    req.body.username = decoded.username;
                    req.body.userId = decoded.userId;
                    next();
                }
                else {
                    res.status(201).send({ "message": "You are not authorized", "err": err })
                }
            })
        }
        else {
            res.status(400).send({ "message": "Please Login" })
        }
    } catch (error) {
        res.status(400).send({ "message": "Something went wrong", "err": error })
    }
}
module.exports = { auth };