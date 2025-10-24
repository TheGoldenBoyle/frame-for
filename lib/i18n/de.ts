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
		studio: "Studio",
		tokens: "Tokens"
    },
	dashboard: {
		createNew: "Neue Erinnerung erstellen",
		createDescription:
			"Kombiniere Fotos von geliebten Menschen zu einem schönen Bild",
		viewGallery: "Galerie",
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
		contact: "Kontakt",
	},
	imprint: {
		title: "Impressum",
		contact: "Kontaktinformationen",
		companyName: "BildOro GmbH",
		streetAddress: "Goldrain 5",
		cityPostal: "36088 Hünfeld",
		country: "Deutschland",
		contact_details: "Kontaktdetails",
		phone: "Telefon: +49 1551 022 0025",
		email: "E-Mail: thegoldenboyle@gmail.com",
		legal_representation: "Vertretungsberechtigte",
		ceo: "Geschäftsführer: James Boyle",
		disclaimer: "Haftungsausschluss und Geschäftsbedingungen",
		disclaimer_text: "Wir liefern ausschließlich hochwertige Ergebnisse. Verwendete Token können nicht erstattet werden. Die Qualität der Ergebnisse hängt von den Modellen und Prompts ab. Bei Fragen oder Anliegen kontaktieren Sie uns jederzeit. Unser Ziel ist es, jedem Kunden Wert und Wertschätzung zu bieten.",
		social_media: "Social Media",
		x_account: "X (Twitter): @theGoldenBoyle"
	},
}