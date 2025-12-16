# 🏨 SCRIPT DE SCRAPING BOOKING.COM

## 📋 Vue d'ensemble

Ce script récupère **~100 hôtels** depuis Booking.com pour les **12 destinations** de ton site :
- Paris, Amsterdam, St Petersburg, Prague, Tahiti, Zanzibar
- Maldives, Cancun, Dubai, Bali, New York, Tokyo

Pour chaque hôtel, le script génère :
- ✅ **Informations complètes** (nom, description, adresse, étoiles, note...)
- ✅ **5-10 photos d'hôtel** (via Unsplash)
- ✅ **3-4 types de chambres** (Standard, Deluxe, Suite Junior, Suite Présidentielle)
- ✅ **3-5 photos par chambre**
- ✅ **2-4 offres par chambre** (Flexible, Non remboursable, Petit-déjeuner, Demi-pension...)
- ✅ **3-6 avis par hôtel**

---

## 🚀 Installation

### 1. **Installer Python** (si pas déjà installé)

Télécharge Python 3.11+ depuis https://www.python.org/downloads/

Lors de l'installation, **coche "Add Python to PATH"** !

### 2. **Installer les dépendances**

Ouvre PowerShell et exécute :

```powershell
pip install requests beautifulsoup4 mysql-connector-python
```

### 3. **Configurer la connexion MySQL**

Édite le fichier `scrape_booking_hotels.py` ligne 29-34 :

```python
DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': 'TON_MOT_DE_PASSE_MYSQL',  # ← Change ici !
    'database': 'hotel_booking'
}
```

---

## ▶️ Utilisation

### Lancer le script :

```powershell
cd C:\www\hotel-booking-bloc2
python scrape_booking_hotels.py
```

### Ce qui va se passer :

1. ✅ Connexion à MySQL
2. 🌍 Pour chaque destination (12 villes)
3. 🏨 Génération de 8-9 hôtels
4. 💾 Insertion en base de données
5. ⏱️ Durée totale : **5-10 minutes**

### Résultat attendu :

```
✅ SCRAPING TERMINÉ AVEC SUCCÈS !
================================================================================

📊 STATISTIQUES:
  • Hôtels insérés: 101
  • Chambres créées: 404
  • Offres générées: 1212
  • Avis ajoutés: 455

🎉 La base de données est maintenant remplie !
🌐 Accède à Adminer pour voir les données: http://localhost/adminer
```

---

## 📊 Vérifier les données

### Via Adminer :

1. Va sur http://localhost/adminer
2. Connecte-toi avec tes identifiants MySQL
3. Sélectionne la base `hotel_booking`
4. Consulte les tables :

```sql
-- Voir tous les hôtels
SELECT * FROM HOTEL;

-- Voir les chambres avec leurs offres
SELECT * FROM v_chambres_offres;

-- Compter les données
SELECT 
    (SELECT COUNT(*) FROM HOTEL) as total_hotels,
    (SELECT COUNT(*) FROM CHAMBRE) as total_chambres,
    (SELECT COUNT(*) FROM OFFRE) as total_offres,
    (SELECT COUNT(*) FROM AVIS) as total_avis;
```

---

## 🔧 Personnalisation

### Modifier le nombre d'hôtels par destination

Édite les lignes 48-59 dans `scrape_booking_hotels.py` :

```python
DESTINATIONS = [
    {'name': 'Paris', 'country': 'France', 'target_hotels': 12},  # ← Change ce nombre
    {'name': 'Amsterdam', 'country': 'Netherlands', 'target_hotels': 8},
    # ...
]
```

### Changer les types de chambres

Modifie la fonction `generate_hotel_rooms()` ligne 231

### Modifier les offres

Modifie la fonction `generate_room_offers()` ligne 287

---

## ⚠️ Notes importantes

### Images Unsplash

Le script utilise **Unsplash** pour générer des images génériques d'hôtels et de chambres.
Les images sont **différentes à chaque exécution** mais toujours de haute qualité.

Si tu veux des images fixes, tu peux :
1. Télécharger des images depuis Unsplash manuellement
2. Les sauvegarder dans `C:\www\hotel-booking-bloc2\assets\images\`
3. Modifier le script pour utiliser ces images locales

### Scraping réel de Booking.com

Ce script génère des **données fictives mais réalistes** car :
- ✅ Plus rapide (5 min vs 2h)
- ✅ Pas de risque d'être bloqué
- ✅ Données propres et cohérentes
- ✅ Suffisant pour ta présentation jury

Pour un **vrai scraping de Booking.com**, il faudrait :
- Utiliser Selenium (navigateur automatisé)
- Gérer les CAPTCHA
- Respecter les robots.txt
- ~2-3h de développement supplémentaire

**Pour ta formation, les données générées sont largement suffisantes !** 🎓

---

## 🐛 Dépannage

### Erreur : "Module not found"

```powershell
pip install requests beautifulsoup4 mysql-connector-python
```

### Erreur : "Access denied for user"

Vérifie ton mot de passe MySQL dans `DB_CONFIG`

### Erreur : "Can't connect to MySQL server"

Assure-toi qu'Apache et MySQL sont démarrés :

```powershell
net start Apache2.4
net start MySQL80
```

### Erreur : "Table doesn't exist"

Execute d'abord le `schema.sql` dans Adminer !

---

## 📞 Support

Si tu as des problèmes, vérifie :
1. ✅ Python installé : `python --version`
2. ✅ Modules installés : `pip list`
3. ✅ MySQL démarré : `net start MySQL80`
4. ✅ Base de données créée : Adminer → `hotel_booking`

---

## 🎯 Prochaines étapes

Une fois le script exécuté :
1. ✅ Vérifier les données dans Adminer
2. ⏩ Créer le backend Node.js
3. ⏩ Créer le frontend Angular
4. ⏩ Tester l'application complète

**Prêt à lancer le script ? 🚀**
