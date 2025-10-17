import { useState } from 'react'
import { Upload, X } from 'lucide-react'

type ImageUploadProps = {
    onImagesChange: (files: File[]) => void
    maxImages?: number
}

export function ImageUpload({ onImagesChange, maxImages = 3 }: ImageUploadProps) {
    const [previews, setPreviews] = useState<string[]>([])
    const [files, setFiles] = useState<File[]>([])

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = Array.from(e.target.files || [])
        const remainingSlots = maxImages - files.length
        const newFiles = selectedFiles.slice(0, remainingSlots)

        if (newFiles.length === 0) return

        const validFiles = newFiles.filter(file => {
            const isImage = file.type.startsWith('image/')
            const isUnder10MB = file.size <= 10 * 1024 * 1024
            return isImage && isUnder10MB
        })

        const newPreviews = validFiles.map(file => URL.createObjectURL(file))

        const updatedFiles = [...files, ...validFiles]
        const updatedPreviews = [...previews, ...newPreviews]

        setFiles(updatedFiles)
        setPreviews(updatedPreviews)
        onImagesChange(updatedFiles)
    }

    const removeImage = (index: number) => {
        URL.revokeObjectURL(previews[index])

        const updatedFiles = files.filter((_, i) => i !== index)
        const updatedPreviews = previews.filter((_, i) => i !== index)

        setFiles(updatedFiles)
        setPreviews(updatedPreviews)
        onImagesChange(updatedFiles)
    }

    const canAddMore = files.length < maxImages

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
                {previews.map((preview, index) => (
                    <div key={index} className="relative overflow-hidden rounded-lg aspect-square bg-stone-100">
                        <img
                            src={preview}
                            alt={`Upload ${index + 1}`}
                            className="object-cover w-full h-full"
                        />
                        <button
                            onClick={() => removeImage(index)}
                            className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-lg hover:bg-stone-50"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ))}

                {canAddMore && (
                    <label className="relative flex flex-col items-center justify-center gap-2 transition-colors border-2 border-dashed rounded-lg cursor-pointer aspect-square border-stone-300 hover:border-stone-400 bg-stone-50 hover:bg-stone-100">
                        <Upload className="w-8 h-8 text-stone-400" />
                        <span className="text-sm text-stone-500">Add Photo</span>
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleFileSelect}
                            className="hidden"
                        />
                    </label>
                )}
            </div>

            <p className="text-xs text-center text-stone-400">
                {files.length} of {maxImages} photos • Max 10MB each
            </p>
        </div>
    )
}