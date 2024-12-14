const express = require('express');
const cors = require('cors');
const state = require('./state');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());


app.use('/api/auth', authRoutes);


// API per visualizzare gli utenti attivi (debug)
app.get('/active-users', (req, res) => {
  res.json(state.activeUsers);
});

// Avvio del server
app.listen(PORT, () => {
  console.log(`Server in ascolto su http://localhost:${PORT}`);
});
