declare module "*.globals.css";

export type PlaygroundResult = {
  modelId: string
  modelName: string
  imageUrl: string | null
  error?: string
}

export type ComparisonResult = {
  modelId: string
  modelName: string
  imageUrl: string
}

export function toComparisonResult(result: PlaygroundResult): ComparisonResult | null {
  if (result.imageUrl) {
    return {
      modelId: result.modelId,
      modelName: result.modelName,
      imageUrl: result.imageUrl
    }
  }
  return null
}

export type Locale = 'en' | 'de'

export type User = {
  id: string
  email: string
}

export type TokenBalanceType = {
	tokens: number
	tokenType: 'free' | 'subscription' | 'onetime'
	subscriptionStatus: string
}

export type Photo = {
  id: string
  generatedUrl: string
  createdAt: string
}

export type PlaygroundPhoto = {
  id: string
  prompt: string
  originalUrl: string | null
  results: PlaygroundResult[]
  createdAt: string
}

export type PresetConfig = {
  id: string
  label: string
  description: string
}

export type Theme = 'light' | 'dark'