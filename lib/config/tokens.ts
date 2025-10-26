export const TOKEN_CONFIG = {
	FREE_TOKENS: 5,
	SUBSCRIPTION_TOKENS: 50,
	ONETIME_TOKENS: 100,

	SUBSCRIPTION_PRICE: 4.99,
	ONETIME_PRICE: 9.99,

	STRIPE_PRICE_IDS: {
		SUBSCRIPTION: "prod_TH9FEPbX9t28mm",
		ONETIME: "prod_TH9Ga0Jiuww0GO",
	},

	COSTS: {
		GENERATE: 1,
		REVISE: 1,
		PLAYGROUND_PER_MODEL: 1,
		PRO_STUDIO_PER_IMAGE: 3,
		PRO_STUDIO_REVISION: 2,
	},

	CONTACT: {
		platform: "X",
		handle: "@thegoldenboyle",
		url: "https://x.com/thegoldenboyle",
	},
}

export type TokenType = "free" | "subscription" | "onetime"