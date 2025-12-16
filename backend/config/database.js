// ============================================================================
// DATABASE.JS - CONFIGURATION MYSQL
// Gère la connexion à la base de données hotel_booking
// ============================================================================

require('dotenv').config();  // ← Charge les variables .env
const mysql = require('mysql2');

// Configuration de la connexion avec variables d'environnement
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

// Tester la connexion
connection.connect((err) => {
  if (err) {
    console.error('❌ Erreur de connexion MySQL:', err.message);
    process.exit(1);
  }
  console.log('✅ Connecté à MySQL - Base de données:', process.env.DB_NAME);
});

// Exporter la connexion
module.exports = connection;
