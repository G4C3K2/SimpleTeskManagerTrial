import { validationResult } from "express-validator";

const Validate = (req, res, next) => {
    console.log('Validation Middleware:', req.body); // Logowanie danych żądania

    const errors  = validationResult(req);
    if (!errors.isEmpty()) {
        let error = {};
        errors.array().map((err) => (error[err.param] = err.msg)); // Poprawka: zmiana `para` na `param`
        return res.status(422).json({error});
    }
    next();
};

export default Validate;