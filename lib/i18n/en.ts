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
        title: "AI Image Generation Unleashed",
        hero: "Break free from limitations. Generate without boundaries.",
        uploadSoon: "Explore Unlimited Models",
		dashboard: "Dashboard", 
        studio: "Studio",
		tokens: "Tokens"
    },

	dashboard: {
		createNew: "Create New Memory",
		createDescription:
			"Combine photos of loved ones into one beautiful image",
		viewGallery: "Gallery",
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
		startOver: "Start",
		viewGallery: "View Gallery",
		saveToGallery: "Save to Gallery",
		saving: "Saving...",
		saved: "Saved to playground gallery!",
		errorPrompt: "Please enter a prompt",
		errorModels: "Please select at least one model",
		errorSomeFailed:
			"Some models failed to generate. This can happen due to rate limits or model availability.",
		tipsTitle: "ðŸ'¡ Tips",
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
		contact: "Contact",
	},
	contact: {
		title: "Contact Form",
		name: "Name",
		email: "Email",
		subject: "Subject",
		message: "Message", 
		submit: "Send Message",
		successMessage: "Thank you for your message! We'll get back to you soon.",
		errorMessage: "There was an error sending your message. Please try again later."
	},
	imprint: {
		title: "Imprint",
		contact: "Contact Information",
		companyName: "BildOro GmbH",
		streetAddress: "Goldrain 5",
		cityPostal: "36088 HÃ¼nfeld",
		country: "Germany",
		contact_details: "Contact Details",
		phone: "Phone: +49 1551 022 0025",
		email: "Email: thegoldenboyle@gmail.com",
		legal_representation: "Legal Representation",
		ceo: "Managing Director: James Boyle",
		disclaimer: "Disclaimer and Terms of Service",
		disclaimer_text: "We exclusively deliver top-quality results. Used tokens cannot be refunded. The quality of results depends on the models and prompts. Feel free to contact us at any time with questions or concerns. Our goal is to provide value and make every customer feel valued.",
		social_media: "Social Media",
		x_account: "X (Twitter): @theGoldenBoyle"
	},
}