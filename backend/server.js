const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Stato degli utenti attivi
let activeUsers = [];

// API per login
app.post('/login', (req, res) => {
  const {nickname} = req.body;

  // Controlla se ci sono slot disponibili
  if (activeUsers.length >= 2) {
    return res.status(403).json(
        {message: 'Gioco pieno! Aspetta che si liberi uno slot.'});
  }

  // Assegna uno slot (1 o 2)
  const newId = activeUsers.find((user) => user.id === 1) ? 2 : 1;

  // Aggiungi l'utente allo stato
  activeUsers.push({id: newId, nickname});
  res.json({playerId: newId});
});

// API per logout
app.post('/logout', (req, res) => {
  const {playerId} = req.body;

  // Rimuovi l'utente dallo stato
  activeUsers = activeUsers.filter((user) => user.id !== playerId);
  res.json({message: 'Utente rimosso.'});
});

// API per visualizzare gli utenti attivi (debug)
app.get('/active-users', (req, res) => {
  res.json(activeUsers);
});

// Avvio del server
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server in ascolto su http://localhost:${PORT}`);
});
