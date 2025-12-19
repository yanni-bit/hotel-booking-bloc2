require('dotenv').config();
const db = require('./config/database');
const fs = require('fs');

const query = `
  SELECT nom_hotel, ville_hotel 
  FROM HOTEL 
  ORDER BY ville_hotel, nom_hotel
`;

db.query(query, (err, results) => {
  if (err) {
    console.error('Erreur:', err);
    return;
  }
  
  let content = 'NOM HOTEL | VILLE\n';
  content += '='.repeat(80) + '\n\n';
  
  results.forEach(hotel => {
    content += `${hotel.nom_hotel} | ${hotel.ville_hotel}\n`;
  });
  
  fs.writeFileSync('liste-hotels.txt', content, 'utf8');
  console.log(`✅ Fichier créé : liste-hotels.txt (${results.length} hôtels)`);
  process.exit(0);
});