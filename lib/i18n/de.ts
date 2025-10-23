import { Translations } from "@/types/i18n"

export const de: Translations = {
	auth: {
		email: "E-Mail",
		password: "Passwort",
		login: "Anmelden",
		signup: "Registrieren",
		logout: "Abmelden",
		noAccount: "Noch kein Konto? Registrieren",
		hasAccount: "Bereits ein Konto? Anmelden",
		welcome: "Willkommen",
		error: "Authentifizierungsfehler",
	},
    landing: {
        headline: "KI-Bildgenerierung. Ganz Einfach.",
        subheadline: "Keine Einschränkungen mehr. Keine Barrieren. Deine Modelle. Deine Art. Melde dich an und probiere es aus. Die ersten 3 Generierungen gehen auf uns.",
        cta: "Jetzt Generieren",
    },

    home: {
        title: "BildOro - KI-Bildgenerierung Ohne Grenzen",
        hero: "Befreie dich von Einschränkungen. Generiere ohne Grenzen.",
        uploadSoon: "Unbegrenzte Modelle Erkunden",
        dashboard: "Erstellen",
		studio: "Studio"
    },
	dashboard: {
		createNew: "Neue Erinnerung erstellen",
		createDescription:
			"Kombiniere Fotos von geliebten Menschen zu einem schönen Bild",
		viewGallery: "Galerie ansehen",
		galleryDescription: "Alle deine erstellten Erinnerungen ansehen",
	},
	playground: {
		title: "Spielplatz",
		description:
			"Experimentiere mit den neuesten KI-Bildgenerierungsmodellen",
		prompt: "Prompt",
		promptPlaceholder:
			"Eine ruhige Berglandschaft bei Sonnenuntergang mit lebendigen Farben...",
		selectModels: "Modelle auswählen",
		inputImage: "Eingabebild (Optional)",
		inputImageHelp:
			"Füge ein Bild für Bild-zu-Bild-Generierung hinzu oder lasse es leer für Text-zu-Bild",
		generate: "Bild generieren",
		compare: "{count} Modelle vergleichen",
		results: "Ergebnisse",
		startOver: "Neu starten",
		viewGallery: "Galerie ansehen",
		saveToGallery: "In Galerie speichern",
		saving: "Speichern...",
		saved: "In Playground-Galerie gespeichert!",
		errorPrompt: "Bitte gib einen Prompt ein",
		errorModels: "Bitte wähle mindestens ein Modell aus",
		errorSomeFailed:
			"Einige Modelle konnten nicht generieren. Dies kann aufgrund von Ratenbegrenzungen oder Modellverfügbarkeit auftreten.",
		tipsTitle: "💡 Tipps",
		tip1: "Wähle mehrere Modelle aus, um ihre Ausgaben nebeneinander zu vergleichen",
		tip2: "Nano Banana benötigt ein Eingabebild zur Bearbeitung",
		tip3: "Sei spezifisch in deinen Prompts für bessere Ergebnisse",
		tip4: "Speichere deine Lieblingsergebnisse in der Playground-Galerie",
		galleryTitle: "Playground-Galerie",
		galleryEmpty: "Noch keine Experimente",
		galleryEmptyDescription:
			"Beginne im Playground zu erstellen, um deine Arbeit hier zu sehen",
		goToPlayground: "Zum Playground",
	},
	common: {
		loading: "Lädt...",
		error: "Etwas ist schief gelaufen",
		success: "Erfolg!",
		back: "Zurück",
		backToDashboard: "Zurück zum Dashboard",
	},
}
