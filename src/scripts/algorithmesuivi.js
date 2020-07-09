class AlgorithmeSuivi {
    constructor(profil) {
        this.suivi = profil.suivi
        this.dernierEtat = profil.dernierEtat()
    }

    get gravite() {
        let gravite = 0
        if (
            this.dernierEtat.essoufflement === 'pire' ||
            this.dernierEtat.etatGeneral === 'pire'
        ) {
            gravite = 2
        }
        if (
            this.dernierEtat.essoufflement === 'critique' ||
            this.dernierEtat.etatGeneral === 'critique'
        ) {
            gravite = 3
        }
        return gravite
    }

    graviteBlockNameToDisplay() {
        return `suivi-gravite-${this.gravite}`
    }
}

module.exports = {
    AlgorithmeSuivi,
}
