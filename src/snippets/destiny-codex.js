export default class Codex {
  constructor(cle) {
    this.api = new ApiBungie(cle);
    this.affichage = new Affichage();

    this.chemins = null; //requete 1
    this.emplacements = []; //requete 2
    this.objets = null; //reuete 3
    this.nomsStats = {}; 
    this.ficheActuelle = null; 
  }

  async demarrer() {
    this.affichage.afficherMessage("Chargement du menu....");

    try {
      this.chemins = await this.api.chercherManifeste();
      const donnees = await this.api.chercherDefinitions(this.chemins.DestinyInventoryBucketDefinition);
      this.emplacements = this.creerEmplacements(donnees);
      this.afficherMenu();
    } catch (erreur) {
      this.affichage.afficherErreur(erreur.message);
    }
  }
  creerEmplacements(donnees) {
    const liste = [];
    for (const hash in donnees) {
      const e = donnees[hash];
      if (e.category === 3 && e.displayProperties && e.displayProperties.name) {
        liste.push(new Emplacement(hash, e));
      }
    }
    liste.sort(function (a, b) {
      return a.ordre - b.ordre;
    });
    return liste;
  }
