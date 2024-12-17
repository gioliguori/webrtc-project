import express from 'express';
import https from 'https';
import { Server } from 'socket.io';
import fs from 'fs';
import dotenv from 'dotenv';

// Carica le variabili di ambiente dal file .env
dotenv.config();

const keyPath = process.env.SSL_KEY_PATH;
const certPath = process.env.SSL_CRT_PATH;

if (!keyPath || !certPath) {
    throw new Error("❌ Le variabili d'ambiente SSL_KEY_PATH e SSL_CRT_PATH non sono definite.");
}

const app = express();
const PORT = 3001;

// Carica il certificato SSL dai percorsi definiti in .env
const options = {
    key: fs.readFileSync(keyPath),
    cert: fs.readFileSync(certPath),
};

// Crea il server HTTPS
const server = https.createServer(options, app);

// Inizializza Socket.IO passando il server HTTPS
const io = new Server(server);

const room = 'test-room';  // Nome della stanza unica

io.on('connection', (socket) => {
    console.log(`✅ Utente connesso: ${socket.id}`);

    // Gestione connessione alla stanza unica
    socket.on('join', () => {
        const clients = Array.from(io.sockets.adapter.rooms.get(room) || []);
        console.log(`🛠 Utente ${socket.id} richiede di entrare nella stanza unica`);

        if (clients.length < 2) {
            socket.join(room);
            console.log(`🚪 Utente ${socket.id} si è unito alla stanza unica`);
            socket.emit('joined', room, socket.id);

            // Notifica agli altri peer che un utente si è unito
            socket.to(room).emit('other-joined', room, socket.id);
        } else {
            console.log(`❌ Stanza unica piena!`);
            socket.emit('full', room);
        }
    });

    // Gestione dei messaggi di signaling
    socket.on('message', (message) => {
        console.log(`📨 Messaggio ricevuto da ${socket.id}: ${message.type}`);
        socket.to(room).emit('message', message);  // Inoltra il messaggio agli altri peer
    });

    // Gestione disconnessione
    socket.on('disconnect', () => {
        console.log(`❌ Utente disconnesso: ${socket.id}`);
        socket.to(room).emit('peer-disconnected', socket.id);
    });
});

// Avvio del server HTTPS
server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server di signaling avviato su https://localhost:${PORT}`);
});
