type ButtonProps = {
    children: React.ReactNode
    onClick?: () => void
    type?: 'button' | 'submit'
    variant?: 'primary' | 'secondary' | 'ghost'
    disabled?: boolean
    className?: string
}

export function Button({
    children,
    onClick,
    type = 'button',
    variant = 'primary',
    disabled = false,
    className = '',
}: ButtonProps) {
    const baseClasses = 'px-6 py-3 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed'

    const variantClasses = {
        primary: 'text-white hover:opacity-90',
        secondary: 'border hover:opacity-90',
        ghost: 'hover:opacity-70',
    }

    const variantStyles = {
        primary: { backgroundColor: 'var(--color-primary)', borderRadius: 'var(--radius-md)' },
        secondary: {
            backgroundColor: 'var(--color-surface)',
            color: 'var(--color-text)',
            borderColor: 'var(--color-border)',
            borderRadius: 'var(--radius-md)'
        },
        ghost: {
            backgroundColor: 'transparent',
            color: 'var(--color-text-muted)',
            borderRadius: 'var(--radius-md)'
        },
    }

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`${baseClasses} ${variantClasses[variant]} ${className}`}
            style={variantStyles[variant]}
        >
            {children}
        </button>
    )
}