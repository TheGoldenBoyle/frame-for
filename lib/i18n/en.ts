import { Translations } from "@/types/i18n"

export const en: Translations = {
	auth: {
		email: "Email",
		password: "Password",
		login: "Login",
		signup: "Sign Up",
		logout: "Logout",
		noAccount: "Don't have an account? Sign up",
		hasAccount: "Already have an account? Login",
		welcome: "Welcome",
		error: "Authentication error",
	},
    landing: {
        headline: "AI Image Generation. Made Simple.",
        subheadline: "No more gatekeeping. No more restrictions. Your models. Your way. Sign in and try it out. First 3 generations are on us.",
        cta: "Start Generating",
    },

    home: {
        title: "BildOro - AI Image Generation Unleashed",
        hero: "Break free from limitations. Generate without boundaries.",
        uploadSoon: "Explore Unlimited Models",
        studio: "Studio",
		tokens: "Tokens"
    },

	dashboard: {
		createNew: "Create New Memory",
		createDescription:
			"Combine photos of loved ones into one beautiful image",
		viewGallery: "View Gallery",
		galleryDescription: "See all your created memories",
	},
	playground: {
		title: "Playground",
		description: "Experiment with the latest AI image generation models",
		prompt: "Prompt",
		promptPlaceholder:
			"A serene mountain landscape at sunset with vibrant colors...",
		selectModels: "Select Models",
		inputImage: "Input Image (Optional)",
		inputImageHelp:
			"Add an image for image-to-image generation, or leave empty for text-to-image",
		generate: "Generate Image",
		compare: "Compare {count} Models",
		results: "Results",
		startOver: "Start Over",
		viewGallery: "View Gallery",
		saveToGallery: "Save to Gallery",
		saving: "Saving...",
		saved: "Saved to playground gallery!",
		errorPrompt: "Please enter a prompt",
		errorModels: "Please select at least one model",
		errorSomeFailed:
			"Some models failed to generate. This can happen due to rate limits or model availability.",
		tipsTitle: "💡 Tips",
		tip1: "Select multiple models to compare their outputs side-by-side",
		tip2: "Nano Banana requires an input image for editing",
		tip3: "Be specific in your prompts for better results",
		tip4: "Save your favorite results to the playground gallery",
		galleryTitle: "Playground Gallery",
		galleryEmpty: "No experiments yet",
		galleryEmptyDescription:
			"Start creating in the playground to see your work here",
		goToPlayground: "Go to Playground",
	},
	common: {
		loading: "Loading...",
		error: "Something went wrong",
		success: "Success!",
		back: "Back",
		backToDashboard: "Back to Dashboard",
	},
}
