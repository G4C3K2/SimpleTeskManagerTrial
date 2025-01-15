import User from "../Models/User.js";
import bcrypt from "bcrypt";
import Group from "../Models/Group.js";
import Blacklist from "../Models/Blacklist.js";
import jwt from "jsonwebtoken"; // Dodanie importu dla JWT

export async function Login(req, res) {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email }).select("+password");
        if (!user) {
            return res.status(401).json({
                status: "failed",
                data: [],
                message: "Invalid email or password",
            });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({
                status: "failed",
                data: [],
                message: "Invalid email or password",
            });
        }

        const token = user.generateAccessJWT();

        const options = {
            expiresIn: "20m",
            maxAge: 20 * 60 * 1000,
            httpOnly: false,
            secure: false, // jeśli nie używasz HTTPS
            sameSite: "Lax",
            domain: undefined,
            credentials: true,
            // Usuwamy domain
        };
        
        console.log("Setting cookie with options:", options);  // Logowanie ustawień ciasteczka

        res.cookie("SessionID", token, options);

        const user_data = { id: user._id, email: user.email };

        res.status(200).json({
            status: "success",
            data: [user_data],
            message: "You have successfully logged in.",
        });
    } catch (err) {
        console.error("Error during login:", {
            message: err.message,
            stack: err.stack,
        });
        res.status(500).json({
            status: "error",
            code: 500,
            data: [],
            message: "Controllers Auth Error. Please try again later.",
            error: err.message,
        });
    }
}

export async function AddGroup(req, res) {
    const { name, description } = req.body;
    const token = req.cookies.SessionID;

    if (!name) {
        return res.status(400).json({
            status: "failed",
            data: [],
            message: "Group name is required.",
        });
    }

    if (!token) {
        return res.status(401).json({
            status: "failed",
            data: [],
            message: "Unauthorized. No session token provided.",
        });
    }

    try {
        // Weryfikacja JWT
        console.log("Otrzymane ciasteczka:", req.cookies);
        console.log("Token JWT z ciasteczka:", req.cookies.SessionID);

        const decoded = jwt.verify(token, process.env.SECRET_ACCESS_TOKEN);
        const userId = decoded.id;

        // Znajdź użytkownika na podstawie ID
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                status: "failed",
                data: [],
                message: "User not found.",
            });
        }

        // Utwórz nową grupę
        const newGroup = new Group({
            name,
            description,
            owner: [userId],
            members: [userId],
        });

        // Zapisz grupę w bazie danych
        const savedGroup = await newGroup.save();

        res.status(201).json({
            status: "success",
            data: savedGroup,
            message: "Group created successfully.",
        });
    } catch (err) {
        console.error("Error while creating group:", {
            message: err.message,
            stack: err.stack,
            details: err,
        });
        res.status(500).json({
            status: "error",
            data: [],
            message: "Internal server error. Please try again later.",
            error: err.message,
        });
    }
}

export async function deleteGroup(groupId, userId) {
    // Sprawdź, czy grupa istnieje
    const group = await Group.findById(groupId);
    if (!group) {
        throw new Error('Grupa nie istnieje');
    }

    // Sprawdź, czy użytkownik jest właścicielem grupy
    if (group.owner.toString() !== userId) {
        throw new Error('Brak uprawnień do usunięcia tej grupy');
    }

    // Usuń grupę
    await Group.findByIdAndDelete(groupId);
    return { message: 'Grupa została usunięta' };
}

export async function GetGroups(req, res) {
    try {
        const groups = await Group.find(); // Pobierz wszystkie grupy z bazy danych
        res.status(200).json({
            status: "success",
            data: groups,
            message: "Groups fetched successfully.",
        });
    } catch (err) {
        console.error("Error fetching groups:", err);
        res.status(500).json({
            status: "error",
            message: "Internal Server Error",
        });
    }
}

export async function Logout(req, res) {
    try {
        const authHeader = req.headers['cookie'];
        if (!authHeader) return res.sendStatus(204);

        const cookie = authHeader.split('=')[1];
        const accessToken = cookie.split(';')[0];

        const checkIfBlacklisted = await Blacklist.findOne({ token: accessToken });
        if (checkIfBlacklisted) return res.sendStatus(204);

        const newBlacklist = new Blacklist({ token: accessToken });
        await newBlacklist.save();

        res.setHeader('Clear-Site-Data', '"cookies"');
        res.status(200).json({ message: 'You are logged out!' });
    } catch (err) {
        console.error("Error during logout:", {
            message: err.message,
            stack: err.stack,
        });
        res.status(500).json({
            status: 'error',
            message: 'Internal Server Error. Please try again later.',
            error: err.message,
        });
    }
}

export async function Register(req, res) {
    console.log("Request Body:", req.body);

    const { first_name, last_name, email, password } = req.body;

    if (!first_name || !last_name || !email || !password) {
        return res.status(400).json({
            status: "failed",
            data: [],
            message: "All fields are required.",
        });
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                status: "failed",
                data: [],
                message: "User already exists. Please log in.",
            });
        }

        const newUser = new User({
            first_name,
            last_name,
            email,
            password,
        });

        const savedUser = await newUser.save();

        const { password: hashedPassword, role, ...user_data } = savedUser._doc;

        res.status(200).json({
            status: "success",
            data: [user_data],
            message: "Account created successfully.",
        });
    } catch (err) {
        console.error("Error during registration:", {
            message: err.message,
            stack: err.stack,
        });
        res.status(500).json({
            status: "error",
            code: 500,
            data: [],
            message: "Internal Server Error. Please try again later.",
            error: err.message,
        });
    }
}
