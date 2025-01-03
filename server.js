import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import { PORT, URI } from './Config/index.js';
import Router from './Routes/index.js';

const server = express();

// Połączenie z bazą danych
mongoose.connect(URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('Connected to database'))
.catch(err => console.log(err));

// Konfiguracja CORS z określoną domeną
const corsOptions = {
    origin: '*', // Zmień na URL frontendowy, jeśli inny port
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Dozwolone metody
    allowedHeaders: ['Content-Type', 'Authorization'], // Dozwolone nagłówki
    credentials: true, // Umożliwia przesyłanie ciasteczek
};

// Użycie niestandardowej konfiguracji CORS
server.use(cors(corsOptions));
server.disable('x-powered-by');

// Middleware
server.use(cookieParser());
server.use(express.urlencoded({ extended: false }));
server.use(express.json());

// Middleware logujący
server.use((req, res, next) => {
    console.log(`Received ${req.method} request for ${req.url}`);
    next();
});

// Użycie routera
Router(server);

// Uruchomienie serwera
server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
