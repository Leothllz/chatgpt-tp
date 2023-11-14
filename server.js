// Importation des modules nécessaires
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const OpenAI = require('openai');

// Initialisation de l'application Express
const app = express();

// Configuration de body-parser
app.use(bodyParser.urlencoded({ extended: true }));

// Route GET pour la racine
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// Configuration de OpenAI
const openai = new OpenAI({
  apiKey: 'insererlaclé',
});

// Serveur les fichiers statiques
app.use(express.static('public'));

app.post('/traiter_formulaire', async (req, res) => {
  try {
      const { nom, prenom, email, recherche } = req.body;
      console.log("demande a ChatGPT : ", recherche);

      const chatCompletion = await openai.chat.completions.create({
          messages: [{ role: "user", content: recherche }],
          model: "gpt-3.5-turbo",
      });

      const reponseGPT = chatCompletion.choices[0].message.content;;
      console.log("Réponse de ChatGPT : ", reponseGPT);

      let donneesExistantes = [];

      // Vérifiez si le fichier existe et n'est pas vide
      if (fs.existsSync('donnees.json')) {
          const contenuFichier = fs.readFileSync('donnees.json', 'utf8');
          if (contenuFichier) {
              donneesExistantes = JSON.parse(contenuFichier);
          }
      }

      // Assurez-vous que donneesExistantes est un tableau
      if (!Array.isArray(donneesExistantes)) {
          donneesExistantes = [];
      }

      donneesExistantes.push({ nom, prenom, email, recherche, reponse: reponseGPT });

      fs.writeFileSync('donnees.json', JSON.stringify(donneesExistantes, null, 2));

      res.send({ message: "Données traitées avec succès !", reponseGPT });
  } catch (erreur) {
      console.error("Erreur : ", erreur);
      res.status(500).send("Une erreur s'est produite");
  }
});



// Démarrage du serveur
// Démarrage du serveur
const port = 3000;
const host = 'localhost'; // Remplacez par votre adresse IPv4 locale
app.listen(port, host, () => {
    console.log(`Serveur démarré sur http://${host}:${port}`);
});
