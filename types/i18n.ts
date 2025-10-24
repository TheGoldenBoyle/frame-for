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
		dashboard?: string
		studio: string
		tokens: string
	}
	landing: {
		headline: string
		subheadline: string
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
		contact?: string
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