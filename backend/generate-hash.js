// ============================================================================
// GENERATE-HASH.JS - Génération de hash bcrypt pour mots de passe
// ============================================================================

const bcrypt = require('bcrypt');

async function generateHash(password) {
  const saltRounds = 10;
  const hash = await bcrypt.hash(password, saltRounds);
  return hash;
}

async function main() {
  console.log('\n=== GÉNÉRATION DES HASH BCRYPT ===\n');
  
  // Admin : admin123
  const adminHash = await generateHash('admin123');
  console.log('Admin (admin123):');
  console.log(adminHash);
  
  // Client : client123
  const clientHash = await generateHash('client123');
  console.log('\nClient (client123):');
  console.log(clientHash);
  
  console.log('\n=== FIN ===\n');
}

main();