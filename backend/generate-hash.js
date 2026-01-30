// ============================================================================
// FICHIER : generate-hash.js
// DESCRIPTION : Script utilitaire pour générer des hash bcrypt de mots de passe
// AUTEUR : Yannick
// DATE : 2025
// ============================================================================
// USAGE : node generate-hash.js
// SORTIE : Affiche les hash bcrypt pour les mots de passe de test
// ============================================================================

const bcrypt = require("bcrypt");

// ============================================================================
// FONCTION - GÉNÉRATION DE HASH
// ============================================================================

/**
 * Génère un hash bcrypt pour un mot de passe
 * @async
 * @function generateHash
 * @param {string} password - Mot de passe en clair à hasher
 * @returns {Promise<string>} Hash bcrypt du mot de passe
 */
async function generateHash(password) {
  const saltRounds = 10;
  const hash = await bcrypt.hash(password, saltRounds);
  return hash;
}

// ============================================================================
// FONCTION PRINCIPALE - EXÉCUTION
// ============================================================================

/**
 * Génère et affiche les hash pour les mots de passe de test
 * @async
 * @function main
 * @returns {Promise<void>}
 */
async function main() {
  console.log("\n=== GÉNÉRATION DES HASH BCRYPT ===\n");

  // Admin : admin123
  const adminHash = await generateHash("admin123");
  console.log("Admin (admin123):");
  console.log(adminHash);

  // Client : client123
  const clientHash = await generateHash("client123");
  console.log("\nClient (client123):");
  console.log(clientHash);

  console.log("\n=== FIN ===\n");
}

main();
