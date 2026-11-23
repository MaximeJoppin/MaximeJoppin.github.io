export default class ApiBungie {
  constructor(cle) {
    this.cle = cle;
    this.adresse = "https://www.bungie.net";
    this.langue = "fr";
  }

  // manifeste pour avoir tous les chemins des tables 
  async chercherManifeste() {
    const reponse = await fetch(this.adresse + "/Platform/Destiny2/Manifest/", {
      headers: { "X-API-Key": this.cle },
    });

    if (!reponse.ok) {
      throw new Error("Erreur sur le manifeste : " + reponse.status);
    }

    const donnees = await reponse.json();
    return donnees.Response.jsonWorldComponentContentPaths[this.langue];
  }

  // a partir du chemin on vient récupérer le contenu de la table
  async chercherDefinitions(chemin) {
    const reponse = await fetch(this.adresse + chemin);

    if (!reponse.ok) {
      throw new Error("Erreur sur " + chemin + " : " + reponse.status);
    }

    const donnees = await reponse.json();
    return donnees;
  }

  async chercherParHash(table, hash) {
    const adresse = this.adresse + "/Platform/Destiny2/Manifest/" + table + "/" + hash + "/?lc=" + this.langue;
    const reponse = await fetch(adresse, {
      headers: { "X-API-Key": this.cle },
    });

    if (!reponse.ok) {
      throw new Error("Erreur sur " + table + " " + hash + " : " + reponse.status);
    }

    const donnees = await reponse.json();
    return donnees.Response;
  }
}