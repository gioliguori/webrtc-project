import express from 'express';
import https from 'https';
import { Server } from 'socket.io';
import fs from 'fs';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid'; // Usa uuid per generare ID univoci per le stanze

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

interface Rooms {
    [key: string]: string[]; // Ogni stanza è identificata da una stringa (roomId), e contiene un array di stringhe (gli utenti)
}

// Oggetto per tenere traccia delle stanze e dei partecipanti
const rooms: Rooms = {};

io.on('connection', (socket) => {
    console.log(`✅ Utente connesso: ${socket.id}`);

    // Creazione di una nuova stanza
    socket.on('createRoom', () => {
        const roomId = uuidv4(); // Genera un ID unico per la stanza
        rooms[roomId] = []; // Crea la stanza e la aggiunge all'oggetto rooms
        console.log(`🛠 Stanza ${roomId} creata`);

        socket.emit('roomCreated', roomId); // Invia l'ID della stanza al client

        // Gestione della richiesta di unione a una stanza
        socket.on('join', () => {
            if (rooms[roomId].length < 2) {
                rooms[roomId].push(socket.id); // Aggiungi l'utente alla stanza
                socket.join(roomId);  // Unisce il socket alla stanza
                console.log(`🚪 Utente ${socket.id} si è unito alla stanza ${roomId}`);
                socket.emit('joined', roomId, socket.id);

                // Invia notifica agli altri partecipanti
                socket.to(roomId).emit('other-joined', roomId, socket.id);
            } else {
                console.log(`❌ La stanza ${roomId} è piena!`);
                socket.emit('full', roomId);  // Notifica che la stanza è piena
            }
        });
    });

    // Gestione dei messaggi tra peer
    socket.on('message', (message) => {
        console.log(`📨 Messaggio ricevuto da ${socket.id}: ${message.type}`);
        socket.to(message.room).emit('message', message);  // Invia il messaggio agli altri membri della stanza
    });

    // Gestione della disconnessione
    socket.on('disconnect', () => {
        console.log(`❌ Utente disconnesso: ${socket.id}`);
        // Rimuove l'utente dalla stanza e notifica gli altri partecipanti
        for (const roomId in rooms) {
            if (rooms.hasOwnProperty(roomId)) {
                // La logica che usi per iterare sulla stanza
                rooms[roomId] = rooms[roomId].filter(id => id !== socket.id);
                socket.to(roomId).emit('peer-disconnected', socket.id);
            }
        }

    });
});

// Avvio del server HTTPS
server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server di signaling avviato su https://localhost:${PORT}`);
});
