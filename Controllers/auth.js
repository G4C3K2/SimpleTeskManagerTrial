import User from "../Models/User.js";
import bcrypt from "bcrypt";
import Blacklist from "../Models/Blacklist.js";

export async function Login(req, res) {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email }).select("+password");
        console.log("User found:", user);
        if (!user){
            console.log("User not found");
            return res.status(401).json({
                status: "failed",
                data: [],
                message: "Invalid email or password",
        })};

        const isPasswordValid = await bcrypt.compare(
            `${req.body.password}`,
            user.password
        );

        console.log("Password valid:", isPasswordValid);

        if (!isPasswordValid)
            return res.status(401).json({
                status: "failed",
                data: [],
                message: "Invalid email or password",
            });
        
        const token = user.generateAccessJWT();    
        console.log("Generated token:", token);

        let options = {
            expiresIn: "20m",
            maxAge: 20 * 60 * 1000,
            httpOnly: true,
            secure: false,
            sameSite: "Lax",
        };

        
        res.cookie("SessionID", token, options);
        console.log("Cookie set");

        const user_data = { id: user._id, email: user.email };

        res.status(200).json({
            status: "success",
            data: [user_data],
            message: "You have successfully logged in.",
        });
    } catch (err) {
        console.error("Error during login:", err);
        res.status(500).json({
            status: "error",
            code: 500,
            data: [],
            message: "Controllers Auth Error",
        });
    }
    res.end();
}

export async function Logout(req, res) {
    try {
      const authHeader = req.headers['cookie']; // get the session cookie from request header
      if (!authHeader) return res.sendStatus(204); // No content
      const cookie = authHeader.split('=')[1]; // If there is, split the cookie string to get the actual jwt token
      const accessToken = cookie.split(';')[0];
      const checkIfBlacklisted = await Blacklist.findOne({ token: accessToken }); // Check if that token is blacklisted
      // if true, send a no content response.
      if (checkIfBlacklisted) return res.sendStatus(204);
      // otherwise blacklist token
      const newBlacklist = new Blacklist({
        token: accessToken,
      });
      await newBlacklist.save();
      // Also clear request cookie on client
      res.setHeader('Clear-Site-Data', '"cookies"');
      res.status(200).json({ message: 'You are logged out!' });
    } catch (err) {
      res.status(500).json({
        status: 'error',
        message: 'Internal Server Error',
      });
    }
    res.end();
  }


export async function Register(req, res) {
    // Debug: Log request body
    console.log("Request Body:", req.body);

    const { first_name, last_name, email, password } = req.body;

    // Check, if all demanded data exists
    if (!first_name || !last_name || !email || !password) {
        console.error("Missing required fields:", { first_name, last_name, email, password });
        return res.status(400).json({
            status: "failed",
            data: [],
            message: "Wszystkie pola są wymagane.",
        });
    }

    try {
        console.log("Received Data:", { first_name, last_name, email });

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.log("Existing user found:", existingUser);
            return res.status(400).json({
                status: "failed",
                data: [],
                message: "Wygląda na to, że już masz konto. Zaloguj się.",
            });
        }

        console.log("Creating new user...");
        // Create an instance of a user
        const newUser = new User({
            first_name,
            last_name,
            email,
            password,
        });

        // Save new user into the database
        const savedUser = await newUser.save();

        console.log("New user saved:", savedUser);

        // Remove sensitive data before sending a response
        const { password: hashedPassword, role, ...user_data } = savedUser._doc;

        console.log("Response Data:", user_data);

        res.status(200).json({
            status: "success",
            data: [user_data],
            message:
                "Thank you for registering with us. Your account has been successfully created.",
        });
    } catch (err) {
        console.error("Error during registration:", err);

        res.status(500).json({
            status: "error",
            code: 500,
            data: [],
            message: "Internal Server Error",
        });
    }

    console.log("Register function completed.");
    res.end();
}
