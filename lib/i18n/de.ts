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
		// Hero Section
		heroTitle: "Deine Ideen,",
		heroTitleHighlight: "Sofort Perfektioniert",
		heroSubtitle1: "Generiere, vergleiche und verfeinere kreative Ergebnisse mit Leichtigkeit.",
		heroSubtitle2: "Speichere deine Einstellungen, komme jederzeit zurück und baue ohne Einschränkungen weiter.",
		tryItFree: "Kostenlos Ausprobieren",
		followJourney: "Folge der Reise",
		videoTitle: "Bildoro.app Promo Video",

		// How It Works Section
		howItWorksStep1Title: "Alle Neuesten Modelle",
		howItWorksStep1Desc: "Greife auf die besten KI-Modelle an einem Ort zu und lass sie parallel laufen. Kein Jonglieren mit Tools, keine Kompatibilitätsprobleme – nur sofortige, garantierte Ergebnisse.",
		howItWorksStep2Title: "System-Prompts Überschreiben",
		howItWorksStep2Desc: "Lass die App für dich arbeiten. Generiere, gehe weg und komme zurück – deine Einstellungen sind bereit. Perfekt für Kreative, die konsistent hochwertige Ergebnisse wollen.",
		howItWorksStep3Title: "Kostenloser KI-Prompt-Verbesserer",
		howItWorksStep3Desc: "Hole das Beste aus deinen Modellen mit KI-gestützten Vorschlägen und Verfeinerungen heraus. Mache deine Prompts sofort effektiver.",
		howItWorksStep4Title: "Modelle Schnell Vergleichen",
		howItWorksStep4Desc: "Seite-an-Seite-Vergleich, um schnell dein perfektes Asset zu finden. Wähle das beste Ergebnis für dein Projekt ohne zwischen mehreren Tabs zu wechseln.",
		howItWorksStep5Title: "Mit Präzision Überarbeiten & Verbessern",
		howItWorksStep5Desc: "Verfeinere und verbessere Ergebnisse mit Genauigkeit. Mache jede Generierung genau so, wie du es willst.",

		// CTA Section
		ctaTitle: "Folge der Reise. Gestalte den Traum.",
		ctaSubtitle: "Ich bin ein Vater, der den guten Kampf kämpft, ein Träumer, der BildOro in Echtzeit aufbaut. Frühe Nutzer formen das Produkt – erzähle mir deinen Anwendungsfall, und wir bauen ihn gemeinsam.",
		ctaButton: "Kostenlos Testen",

		// Pricing Section
		pricingTitle: "Frühzugang & Premium-Tools",
		pricingSubtitle: "Frühe Abonnenten helfen, das Produkt zu formen. Wir konzentrieren uns auf Wert und Qualität – deine ersten 5 Generierungen gehen auf uns. Teste es kostenlos und sieh, wie wir die Dinge anders machen. Deine Modelle, auf deine Art!",
		
		// Pricing Cards
		monthlyTitle: "Monatlich",
		monthlyPrice: "€4,99",
		monthlyOriginalPrice: "€7,99",
		monthlyPeriod: "/Monat",
		monthlyBadge: "BESTER WERT",
		monthlyFeature1: "50 Token/Monat",
		monthlyFeature2: "Automatische Verlängerung",
		monthlyFeature3: "Jederzeit kündbar",
		monthlyFeature4: "KI-Optimierungen inklusive",
		monthlyFeature5: "Individuelle System-Prompts inklusive",
		monthlyButton: "Abonnieren",

		onetimeTitle: "Einmalig",
		onetimePrice: "€9,99",
		onetimeOriginalPrice: "€14,99",
		onetimePeriod: "einmalig",
		onetimeFeature1: "100 Token",
		onetimeFeature2: "Laufen nie ab",
		onetimeFeature3: "Keine Verpflichtung",
		onetimeFeature4: "KI-Optimierungen inklusive",
		onetimeFeature5: "Individuelle System-Prompts inklusive",
		onetimeButton: "Token Kaufen",

		// Waitlist Mode
		waitlistTitle: "Kapazität Erreicht",
		waitlistSubtitle1: "🎯 Aktuell im Test mit einer kleinen Gruppe von Kreativen.",
		waitlistSubtitle2: "Trage dich in die Warteliste ein für frühen Zugang und hilf mit, die nächste Generation der KI-Erstellung zu formen.",
		emailPlaceholder: "E-Mail eingeben",
		joinWaitlist: "Zur Warteliste",
		joining: "Wird hinzugefügt...",
		waitlistSuccess: "✓ Du bist auf der Liste! Position #{position}",
		waitlistError: "Etwas ist schiefgelaufen",
		waitlistFailed: "Fehler beim Beitritt zur Warteliste",
		questionsContact: "Fragen? Kontakt:",
	},
	home: {
		title: "KI-Bildgenerierung Ohne Grenzen",
		hero: "Befreie dich von Einschränkungen. Generiere ohne Grenzen.",
		uploadSoon: "Unbegrenzte Modelle Erkunden",
		dashboard: "Erstellen",
		studio: "Studio",
		tokens: "Tokens",
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
		startOver: "Anfang",
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
	contact: {
		title: "Kontaktformular",
		name: "Name",
		email: "E-Mail",
		subject: "Betreff",
		message: "Nachricht",
		submit: "Absenden",
		successMessage:
			"Vielen Dank für deine Nachricht! Wir werden uns bald bei dir melden.",
		errorMessage:
			"Es gab einen Fehler beim Senden der Nachricht. Bitte versuche es später erneut.",
	},
	imprint: {
		title: "Impressum",
		contact: "Kontaktinformationen",
		companyName: "BildOro.app",
		streetAddress: "Goldrain 5",
		cityPostal: "36088 Hunfeld",
		country: "Deutschland",
		contact_details: "Kontaktdetails",
		phone: "Telefon: +49 1551 022 0025",
		email: "E-Mail: thegoldenboyle@gmail.com",
		legal_representation: "Vertretungsberechtigte",
		ceo: "Geschäftsführer: James Boyle",
		disclaimer: "Haftungsausschluss und Geschäftsbedingungen",
		disclaimer_text:
			"Wir liefern ausschließlich hochwertige Ergebnisse. Verwendete Token können nicht erstattet werden. Die Qualität der Ergebnisse hängt von den Modellen und Prompts ab. Bei Fragen oder Anliegen kontaktiere uns jederzeit. Unser Ziel ist es, jedem Kunden Wert und Wertschätzung zu bieten.",
		social_media: "Social Media",
		x_account: "X (Twitter): @theGoldenBoyle",
	},
}