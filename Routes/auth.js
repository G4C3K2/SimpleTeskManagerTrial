import express from 'express';
import { Logout, Register, Login, AddGroup, GetGroups, deleteGroup } from '../Controllers/auth.js';
import Validate from '../Middleware/validate.js';
import { check } from 'express-validator';

const router = express.Router();

// Register route -- POST request
router.post(
    '/register',
    [
        check('email')
            .isEmail()
            .withMessage('Enter a valid email address')
            .normalizeEmail(),
        check('first_name')
            .not()
            .isEmpty()
            .withMessage('Your first name is required')
            .trim()
            .escape(),
        check('last_name')
            .not()
            .isEmpty()
            .withMessage('Your last name is required')
            .trim()
            .escape(),
        check('password')
            .isLength({ min: 8 })
            .withMessage('Password must be at least 8 characters long'),
    ],
    Validate, // Middleware for validation errors
    async (req, res, next) => {
        try {
            await Register(req, res);
        } catch (error) {
            console.error('Error in Register route:', error.message);
            res.status(500).json({
                status: 'error',
                message: 'Internal Server Error',
                error: error.message,
            });
        }
    },
);

// Login route -- POST request
router.post(
    '/login',
    [
        check('email')
            .isEmail()
            .withMessage('Enter a valid email address')
            .normalizeEmail(),
        check('password')
            .not()
            .isEmpty()
            .withMessage('Password is required'),
    ],
    Validate,
    async (req, res, next) => {
        try {
            await Login(req, res);
        } catch (error) {
            console.error('Error in Login route:', error.message);
            res.status(500).json({
                status: 'error',
                message: 'Internal Server Error',
                error: error.message,
            });
        }
    },
);

// Add Group route -- POST request
router.post(
    '/add-group',
    [
        check('name')
            .not()
            .isEmpty()
            .withMessage('Group name is required')
            .trim()
            .escape(),
        check('description')
            .optional()
            .trim()
            .escape(),
    ],
    Validate,
    async (req, res, next) => {
        try {
            await AddGroup(req, res);
        } catch (error) {
            console.error('Error in AddGroup route:', error.message);
            res.status(500).json({
                status: 'error',
                message: 'Internal Server Error',
                error: error.message,
            });
        }
    },
);

router.delete('/auth/delete-group/:id', async (req, res) => {
    try {
        const groupId = req.params.id;
        const userId = req.user.id; // Zakładamy, że middleware uwierzytelniania dodaje req.user

        const result = await deleteGroup(groupId, userId);
        res.status(200).json(result);
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: error.message });
    }
});

// Test endpoint
router.get('/test', (req, res) => {
    res.status(200).json({ status: 'success', message: 'Test endpoint working!' });
});

// Logout route -- GET request
router.get('/logout', async (req, res) => {
    try {
        await Logout(req, res);
    } catch (error) {
        console.error('Error in Logout route:', error.message);
        res.status(500).json({
            status: 'error',
            message: 'Internal Server Error',
            error: error.message,
        });
    }
});

router.get('/groups', GetGroups);

export default router;
