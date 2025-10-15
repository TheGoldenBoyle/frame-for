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
		hero?: string
		uploadSoon: string
	}
	common: {
		loading: string
		error: string
		success: string
	}
}