export const TOKEN_CONFIG = {
	FREE_TOKENS: 5,
	SUBSCRIPTION_TOKENS: 50,
	ONETIME_TOKENS: 100,

	SUBSCRIPTION_PRICE: 4.99,
	ONETIME_PRICE: 9.99,

	STRIPE_PRICE_IDS: {
		SUBSCRIPTION: process.env.STRIPE_SUBSCRIPTION_PRICE_ID!,
		ONETIME: process.env.STRIPE_ONETIME_PRICE_ID!,
	},

	COSTS: {
		GENERATE: 1,
		REVISE: 1,
		PLAYGROUND_PER_MODEL: 1,
		PLAYGROUND_REVISE: 0.5,
		PRO_STUDIO_PER_IMAGE: 3,
		PRO_STUDIO_REVISION: 2,
		IMAGE_PLAYGROUND: 1,
	},

	CONTACT: {
		platform: "X",
		handle: "@thegoldenboyle",
		url: "https://x.com/thegoldenboyle",
	},
}

export type TokenType = "free" | "subscription" | "onetime"