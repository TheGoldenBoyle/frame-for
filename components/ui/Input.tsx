import { InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    error?: boolean
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ error, className = '', ...props }, ref) => {
        const baseStyles = 'w-full px-4 py-3 rounded-lg border bg-surface text-text transition-colors focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60 disabled:cursor-not-allowed'
        const errorStyles = error ? 'border-red-500' : 'border-border'

        return (
            <input
                ref={ref}
                className={`${baseStyles} ${errorStyles} ${className}`}
                {...props}
            />
        )
    }
)