import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import { PORT, URI } from './Config/index.js';
import Router from './Routes/index.js'; // Importuj router

const server = express();

server.use(cors());
server.disable('x-powered-by');
server.use(cookieParser());
server.use(express.urlencoded({ extended: false }));
server.use(express.json());

// Middleware logujący
server.use((req, res, next) => {
    console.log(`Received ${req.method} request for ${req.url}`); // Logowanie metody i ścieżki zapytania
    next();
});

mongoose.connect(URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('Connected to database'))
.catch(err => console.log(err));

// Użycie routera
Router(server);

// Uruchomienie serwera
server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));