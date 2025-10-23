import { useState } from 'react'
import { Upload, X } from 'lucide-react'

type ImageUploadProps = {
    onImagesChange: (files: File[]) => void
    maxImages?: number
    disabled?: boolean
    label?: string
}

export function ImageUpload({ onImagesChange, maxImages = 3, disabled = false, label = "" }: ImageUploadProps) {
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
    const gridColumns = files.length === 0 ? 1 : (files.length <= 3 ? 2 : 3)

    return (
        <div className="space-y-4">
            <div className={`grid grid-cols-${gridColumns} gap-4`}>
                {previews.map((preview, index) => (
                    <div key={index} className="relative overflow-hidden rounded-lg aspect-square bg-surface">
                        <img
                            src={preview}
                            alt={`Upload ${index + 1}`}
                            className="object-cover w-full h-full"
                        />
                        <button
                            onClick={() => removeImage(index)}
                            className="absolute top-2 right-2 p-1.5 bg-surface rounded-full shadow-lg hover:bg-border transition-colors"
                        >
                            <X className="w-4 h-4 text-text" />
                        </button>
                    </div>
                ))}

                {canAddMore && !disabled && (
                    <label className={`
                        relative 
                        flex 
                        flex-col 
                        items-center 
                        justify-center 
                        gap-2 
                        transition-colors 
                        border-2 
                        border-dashed 
                        rounded-lg 
                        cursor-pointer 
                        py-6
                        border-border 
                        hover:border-primary 
                        bg-surface 
                        hover:bg-background
                        ${files.length === 0 ? 'col-span-full' : ''}
                    `}>
                        <Upload className="w-8 h-8 text-muted" />
                        <span>{label}</span>
                        <span className="text-sm text-muted">Add Photo</span>
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleFileSelect}
                            disabled={disabled}
                            className="hidden"
                        />
                    </label>
                )}

                {disabled && (
                    <p className="text-xs text-center text-muted col-span-full">
                        Image upload is currently disabled
                    </p>
                )}
            </div>

            <p className="text-xs text-center text-muted">
                {files.length} of {maxImages} photos • Max 10MB each
            </p>
        </div>
    )
}