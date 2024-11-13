import express from 'express';
import { Logout, Register } from '../Controllers/Auth.js';
import { Login } from '../Controllers/Auth.js';
import Validate from '../Middleware/validate.js';
import { check } from 'express-validator';

const router = express.Router();

// Register route -- POST request
router.post(
    '/register',
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
        .notEmpty()
        .isLength({ min: 8 })
        .withMessage('Must be at least 8 chars long'),
    Validate,
    Register,
);

router.post(
    '/login',
    check('email')
        .isEmail()
        .withMessage('Enter a valid email address')
        .normalizeEmail(),
    check('password').not().isEmpty(),
    Validate,
    Login,
)

// Test endpoint
router.get('/test', (req, res) => {
    res.status(200).json({ message: 'Test endpoint working!' });
});

router.get('/logout', Logout);

export default router;