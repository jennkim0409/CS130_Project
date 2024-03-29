import jwt from "jsonwebtoken";

// Middleware for checking aythentication 
const authenticateMiddleware = (req, res, next) => {
    // Checking if authorization header is present 
    const token = req.header("Authorization");

    if(!token){
        return res.status(401).json({message: "Unauthorized- Missing token"});
    }

    try{
        // Verify token
        const SECRET = "hello"
        const decode = jwt.verify(token, SECRET);

        // Attach user information 
        req.user = decode.username;

        // Directing to next route handler
        next();
    } catch(error){
        return res.status(401).json({message: "Unauthorized- Invalid Token"})
    }
};

export default authenticateMiddleware;