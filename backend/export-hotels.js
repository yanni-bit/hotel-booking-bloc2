// ============================================================================
// FICHIER : export-hotels.js
// DESCRIPTION : Script utilitaire pour exporter la liste des hôtels en fichier texte
// AUTEUR : Yannick
// DATE : 2025
// ============================================================================
// USAGE : node liste-hotels.js
// SORTIE : Génère le fichier liste-hotels.txt avec tous les hôtels
// ============================================================================

require("dotenv").config();
const db = require("./config/database");
const fs = require("fs");

// ============================================================================
// REQUÊTE SQL - RÉCUPÉRATION DES HÔTELS
// ============================================================================

const query = `
  SELECT nom_hotel, ville_hotel 
  FROM HOTEL 
  ORDER BY ville_hotel, nom_hotel
`;

// ============================================================================
// EXÉCUTION ET GÉNÉRATION DU FICHIER
// ============================================================================

db.query(query, (err, results) => {
  if (err) {
    console.error("Erreur:", err);
    return;
  }

  // Construire le contenu du fichier
  let content = "NOM HOTEL | VILLE\n";
  content += "=".repeat(80) + "\n\n";

  results.forEach((hotel) => {
    content += `${hotel.nom_hotel} | ${hotel.ville_hotel}\n`;
  });

  // Écrire le fichier
  fs.writeFileSync("liste-hotels.txt", content, "utf8");
  console.log(`✅ Fichier créé : liste-hotels.txt (${results.length} hôtels)`);
  process.exit(0);
});
