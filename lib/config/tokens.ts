export const TOKEN_CONFIG = {
	FREE_TOKENS: 5,
	SUBSCRIPTION_TOKENS: 50,
	ONETIME_TOKENS: 100,

	SUBSCRIPTION_PRICE: 4.99,
	ONETIME_PRICE: 9.99,

	COSTS: {
		GENERATE: 1,
		REVISE: 1,
		PLAYGROUND_PER_MODEL: 1,
	},

	CONTACT: {
		platform: "X",
		handle: "@thegoldenboyle",
		url: "https://x.com/thegoldenboyle",
	},
}

export type TokenType = "free" | "subscription" | "onetime"
