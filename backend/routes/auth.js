const express = require('express');
const state = require('../state');

const router = express.Router();

// Login
router.post('/login', (req, res) => {
  const {nickname} = req.body;

  // Controlla se ci sono slot disponibili
  if (state.activeUsers.length >= 2) {
    return res.status(403).json({
      message: 'Gioco pieno! Aspetta che si liberi uno slot.',
    });
  }

  // Assegna uno slot (1 o 2)
  const newId = state.activeUsers.find((user) => user.id === 1) ? 2 : 1;

  // Aggiungi l'utente a quelli attivi
  state.activeUsers.push({id: newId, nickname});
  res.json({playerId: newId});
});

// Logout
router.post('/logout', (req, res) => {
  const {playerId} = req.body;

  // Rimuovi l'utente da quelli attivi
  state.activeUsers = state.activeUsers.filter((user) => user.id !== playerId);
  res.json({message: 'Utente rimosso.'});
});


module.exports = router;