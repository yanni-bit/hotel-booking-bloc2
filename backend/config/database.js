// ============================================================================
// FICHIER : database.js
// DESCRIPTION : Configuration et connexion à la base de données MySQL
// AUTEUR : Yannick
// DATE : 2025
// ============================================================================
// CONFIGURATION :
//   - Utilise les variables d'environnement (.env)
//   - Base de données : hotel_booking
//   - Gérée avec phpMyAdmin
//
// VARIABLES D'ENVIRONNEMENT REQUISES :
//   - DB_HOST     : Hôte de la base de données
//   - DB_USER     : Nom d'utilisateur MySQL
//   - DB_PASSWORD : Mot de passe MySQL
//   - DB_NAME     : Nom de la base de données
// ============================================================================

require("dotenv").config();
const mysql = require("mysql2");

// ============================================================================
// CONFIGURATION DE LA CONNEXION
// ============================================================================

/**
 * Connexion à la base de données MySQL
 * Utilise les variables d'environnement pour la configuration
 * @type {mysql.Connection}
 */
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// ============================================================================
// TEST DE LA CONNEXION
// ============================================================================

connection.connect((err) => {
  if (err) {
    console.error("❌ Erreur de connexion MySQL:", err.message);
    process.exit(1);
  }
  console.log("✅ Connecté à MySQL - Base de données:", process.env.DB_NAME);
});

// ============================================================================
// EXPORT DU MODULE
// ============================================================================
module.exports = connection;
