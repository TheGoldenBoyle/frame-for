import { ButtonHTMLAttributes, forwardRef } from 'react'

type ButtonVariant = 'primary' | 'ghost' | 'outline'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant
    size?: ButtonSize
}

const variantStyles = {
    primary: 'bg-primary text-white hover:bg-primary-dark disabled:bg-muted shadow-elevated-gold',
    ghost: 'bg-transparent text-text hover:bg-surface disabled:text-muted',
    outline: 'bg-transparent border-2 border-border text-text hover:border-primary disabled:border-muted disabled:text-muted',
}

const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ variant = 'primary', size = 'md', className = '', disabled, children, ...props }, ref) => {
        const baseStyles = 'font-medium rounded-lg transition-all disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer transform hover:scale-105 active:scale-95'

        return (
            <button
                ref={ref}
                disabled={disabled}
                className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
                {...props}
            >
                {children}
            </button>
        )
    }
)

Button.displayName = 'Button'