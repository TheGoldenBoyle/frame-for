export class FormDataError extends Error {
	constructor(message: string) {
		super(message)
		this.name = 'FormDataError'
	}
}

export function getString(formData: FormData, key: string): string {
	const value = formData.get(key)
	
	if (!value) {
		throw new FormDataError(`Missing required field: ${key}`)
	}
	
	if (typeof value !== 'string') {
		throw new FormDataError(`Field ${key} must be a string`)
	}
	
	return value
}

export function getOptionalString(formData: FormData, key: string): string | undefined {
	const value = formData.get(key)
	
	if (!value) {
		return undefined
	}
	
	if (typeof value !== 'string') {
		throw new FormDataError(`Field ${key} must be a string`)
	}
	
	return value
}

export function getFile(formData: FormData, key: string): File {
	const value = formData.get(key)
	
	if (!value) {
		throw new FormDataError(`Missing required file: ${key}`)
	}
	
	if (!(value instanceof File)) {
		throw new FormDataError(`Field ${key} must be a file`)
	}
	
	return value
}

export function getOptionalFile(formData: FormData, key: string): File | undefined {
	const value = formData.get(key)
	
	if (!value) {
		return undefined
	}
	
	if (!(value instanceof File)) {
		throw new FormDataError(`Field ${key} must be a file`)
	}
	
	return value
}

export function getFiles(formData: FormData, key: string): File[] {
	const entries = formData.getAll(key)
	const files: File[] = []
	
	for (const entry of entries) {
		if (!(entry instanceof File)) {
			throw new FormDataError(`All ${key} entries must be files`)
		}
		files.push(entry)
	}
	
	return files
}