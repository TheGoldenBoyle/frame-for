export type Locale = "en" | "de"

export type Translations = {
	auth: {
		email: string
		password: string
		login: string
		signup: string
		logout: string
		noAccount: string
		hasAccount: string
		welcome: string
		error: string
	}
	home: {
		title: string
		hero: string
		uploadSoon: string
		dashboard: string
		studio: string
		tokens: string
	}
	landing: {
		// Hero Section
		heroTitle: string
		heroTitleHighlight: string
		heroSubtitle1: string
		heroSubtitle2: string
		tryItFree: string
		followJourney: string
		videoTitle: string

		// How It Works Section
		howItWorksStep1Title: string
		howItWorksStep1Desc: string
		howItWorksStep2Title: string
		howItWorksStep2Desc: string
		howItWorksStep3Title: string
		howItWorksStep3Desc: string
		howItWorksStep4Title: string
		howItWorksStep4Desc: string
		howItWorksStep5Title: string
		howItWorksStep5Desc: string

		// CTA Section
		ctaTitle: string
		ctaSubtitle: string
		ctaButton: string

		// Pricing Section
		pricingTitle: string
		pricingSubtitle: string

		// Pricing Cards
		monthlyTitle: string
		monthlyPrice: string
		monthlyOriginalPrice: string
		monthlyPeriod: string
		monthlyBadge: string
		monthlyFeature1: string
		monthlyFeature2: string
		monthlyFeature3: string
		monthlyFeature4: string
		monthlyFeature5: string
		monthlyButton: string

		onetimeTitle: string
		onetimePrice: string
		onetimeOriginalPrice: string
		onetimePeriod: string
		onetimeFeature1: string
		onetimeFeature2: string
		onetimeFeature3: string
		onetimeFeature4: string
		onetimeFeature5: string
		onetimeButton: string

		// Waitlist Mode
		waitlistTitle: string
		waitlistSubtitle1: string
		waitlistSubtitle2: string
		emailPlaceholder: string
		joinWaitlist: string
		joining: string
		waitlistSuccess: string
		waitlistError: string
		waitlistFailed: string
		questionsContact: string
	}
	dashboard: {
		createNew: string
		createDescription: string
		viewGallery: string
		galleryDescription: string
	}
	playground: {
		title: string
		description: string
		prompt: string
		promptPlaceholder: string
		selectModels: string
		inputImage: string
		inputImageHelp: string
		generate: string
		compare: string
		results: string
		startOver: string
		viewGallery: string
		saveToGallery: string
		saving: string
		saved: string
		errorPrompt: string
		errorModels: string
		errorSomeFailed: string
		tipsTitle: string
		tip1: string
		tip2: string
		tip3: string
		tip4: string
		galleryTitle: string
		galleryEmpty: string
		galleryEmptyDescription: string
		goToPlayground: string
	}
	common: {
		loading: string
		error: string
		success: string
		back: string
		backToDashboard: string
		contact: string
	}
	contact: {
		title: string
		name: string
		email: string
		subject: string
		message: string
		submit: string
		successMessage: string
		errorMessage: string
	}
	imprint: {
		title: string
		contact: string
		companyName: string
		streetAddress: string
		cityPostal: string
		country: string
		contact_details: string
		phone: string
		email: string
		legal_representation: string
		ceo: string
		disclaimer: string
		disclaimer_text: string
		social_media: string
		x_account: string
	}
}