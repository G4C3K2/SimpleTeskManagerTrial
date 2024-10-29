import express from 'express';
import Auth from './auth.js'; // Import routera Auth

const router = express.Router();

const Router = (server) => {
    server.get("/task-manager", (req, res) => {
        try {
            res.status(200).json({
                status: "success",
                data: [],
                message: "Welcome to our Web App homepage",
            });
        } catch (err) {
            res.status(500).json({
                status: "error",
                message: "Internal Server Error",
            });
        }
    });

    // Użycie routera Auth z prefiksem '/task-manager/auth'
    server.use('/task-manager/auth', Auth);
};

Router(router); // Użycie routera

export default Router;