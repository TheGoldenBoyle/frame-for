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
		heroTitle1: string
		heroTitle2: string
		heroSubtitle1: string
		heroSubtitle2: string
		startFree: string
		tryPlayground: string
		videoPlaceholder: string
		
		// Why Section
		whyTitle: string
		freeTokensTitle: string
		freeTokensDesc: string
		neverExpireTitle: string
		neverExpireDesc: string
		topQualityTitle: string
		topQualityDesc: string
		aiPromptTitle: string
		aiPromptDesc: string
		oneStopTitle: string
		oneStopDesc: string
		yourChoiceTitle: string
		yourChoiceDesc: string
		
		// Models Section
		modelsTitle: string
		modelsSubtitle: string
		
		// Pricing Section
		pricingTitle: string
		pricingSubtitle: string
		
		// Final CTA
		ctaTitle: string
		ctaSubtitle: string
		getStartedFree: string
		
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
		
		// Legacy (keeping for backwards compatibility)
		headline1: string
		headline2: string
		subheadline1: string
		subheadline2: string
		subheadline3: string
		cta: string
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