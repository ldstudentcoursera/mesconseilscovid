import actions from '../actions.js'
import affichage from '../affichage.js'
import injection from '../injection.js'
import { AlgorithmeOrientation } from '../algorithme/orientation.js'
import { AlgorithmeSuivi } from '../algorithme/suivi.js'

function page(element, app) {
    // Hide all conseils that might have been made visible on previous runs.
    affichage.hideSelector(element, '.visible')

    // Make sure we (re-)show profile-specific text.
    affichage.showMeOrThem(element, app.profil)

    // Use custom illustration if needed.
    var extraClass = getCustomIllustrationName(app.profil)
    if (extraClass) {
        element.querySelector('#conseils-block').classList.add(extraClass)
    }

    var algoOrientation = new AlgorithmeOrientation(app.profil)

    // Activer / désactiver l’auto-suivi pour ce profil ?
    if (algoOrientation.recommandeAutoSuivi() && !app.profil.suivi_active) {
        app.profil.suivi_active = true
        app.enregistrerProfilActuel()
    } else if (app.profil.suivi_active && !app.profil.hasSuiviStartDate()) {
        app.profil.suivi_active = false
        app.enregistrerProfilActuel()
    }

    // Display appropriate conseils.
    showRelevantBlocks(element, app.profil, algoOrientation)

    if (app.profil.hasSuiviStartDate() && app.profil.hasHistorique()) {
        // Afficher le bloc de résultats de l’auto-suivi
        var algoSuivi = new AlgorithmeSuivi(app.profil)
        affichage.displayElementById(element, 'suivi')
        showRelevantSuiviBlocks(element, algoSuivi)
        showRelevantEvolutionsRecap(element, algoSuivi)

        // Cacher le bloc de statut si on est en auto-suivi.
        affichage.hideSelector(element, '#conseils-statut')

        // Cacher le bloc de recommandation de l’auto-suivi
        // si on l’a déjà démarré.
        affichage.hideSelector(element, '.conseil-autosuivi')
    }

    // Dynamic data injections.
    showRelevantAnswersRecap(element, app.profil, algoOrientation)

    // Show instructions to install PWA (iOS) or add bookmark (others).
    if (isMobileSafari()) {
        const isPWA = navigator.standalone
        if (!isPWA) {
            affichage.showElement(element.querySelector('.browser-mobile-safari'))
        }
    } else {
        affichage.showElement(element.querySelector('.browser-other'))
    }

    // Make the buttons clickable with appropriated actions.
    actions.bindImpression(element)
    if (app.profil.hasSuiviStartDate()) {
        actions.bindCalendar(element, app.profil)
    }
}

function getCustomIllustrationName(profil) {
    if (profil.symptomes_actuels) {
        return 'symptomes-actuels'
    }
    if (profil.symptomes_passes) {
        return 'symptomes-passes'
    }
    if (profil.contact_a_risque) {
        return 'contact-a-risque'
    }
}

function showRelevantSuiviBlocks(element, algoSuivi) {
    var blockNames = [algoSuivi.graviteBlockNameToDisplay()]
    if (algoSuivi.psy !== 0) {
        blockNames.push(algoSuivi.psyBlockNameToDisplay())
    }
    if (algoSuivi.profil.hasHistorique()) {
        blockNames.push('conseil-autosuivi-historique')
    }
    affichage.displayBlocks(element, blockNames)
}

function showRelevantBlocks(element, profil, algoOrientation) {
    var blockNames = statutBlockNamesToDisplay(algoOrientation)
    blockNames = blockNames.concat(
        algoOrientation.conseilsPersonnelsBlockNamesToDisplay()
    )
    blockNames = blockNames.concat(algoOrientation.departementBlockNamesToDisplay())
    blockNames = blockNames.concat(algoOrientation.activiteProBlockNamesToDisplay())
    blockNames = blockNames.concat(algoOrientation.foyerBlockNamesToDisplay())
    blockNames = blockNames.concat(
        algoOrientation.caracteristiquesAntecedentsBlockNamesToDisplay()
    )
    affichage.displayBlocks(element, blockNames)
}

function showRelevantEvolutionsRecap(element, algoSuivi) {
    var blockNames = algoSuivi.evolutionsBlockNamesToDisplay()
    if (blockNames.length) {
        affichage.showElement(element.querySelector('.reponse'))
        affichage.displayBlocks(element, blockNames)
    }
}

function showRelevantAnswersRecap(element, profil, algoOrientation) {
    injection.titreConseils(element.querySelector('#conseils-block-titre'), profil)
    injection.departement(element.querySelector('#nom-departement'), profil.departement)
    var lienPrefecture = element.querySelector('#lien-prefecture')
    if (lienPrefecture) {
        injection.lienPrefecture(lienPrefecture, profil.departement)
    }

    // We need to target more specifically given there are two similar ids.
    var selector
    if (algoOrientation.symptomesActuelsReconnus) {
        selector = '#conseils-personnels-symptomes-actuels'
    } else {
        selector = '#conseils-caracteristiques'
    }
    var subElement = element.querySelector(selector)
    if (!subElement) return
    var nomCaracteristiquesARisques = subElement.querySelector(
        '#nom-caracteristiques-a-risques'
    )
    if (nomCaracteristiquesARisques) {
        injection.caracteristiquesARisques(nomCaracteristiquesARisques, algoOrientation)
    }
    var nomAntecedents = subElement.querySelector('#nom-antecedents')
    if (nomAntecedents) {
        injection.antecedents(nomAntecedents, algoOrientation)
    }
    var nomSymptomesActuels = subElement.querySelector('#nom-symptomesactuels')
    if (nomSymptomesActuels) {
        injection.symptomesactuels(nomSymptomesActuels, algoOrientation)
    }
}

function statutBlockNamesToDisplay(algoOrientation) {
    return ['statut-' + algoOrientation.statut]
}

function isMobileSafari() {
    const ua = window.navigator.userAgent
    const isIPad = !!ua.match(/iPad/i)
    const isIPhone = !!ua.match(/iPhone/i)
    const isIOS = isIPad || isIPhone
    const isWebkit = !!ua.match(/WebKit/i)
    const isChrome = !!ua.match(/CriOS/i)
    return isIOS && isWebkit && !isChrome
}

module.exports = {
    page,
    showRelevantBlocks,
    showRelevantAnswersRecap,
}
