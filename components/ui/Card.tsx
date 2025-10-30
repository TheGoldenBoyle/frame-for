import { HTMLAttributes } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
    padding?: 'none' | 'sm' | 'md' | 'lg'
}

const paddingStyles = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-4 md:p-8',
}

export function Card({ padding = 'lg', className = '', children, ...props }: CardProps) {
    return (
        <div
            className={`bg-surface border border-border rounded-lg shadow-elevated transition-all hover:shadow-elevated-gold hover:-translate-y-1 ${paddingStyles[padding]} ${className}`}
            {...props}
        >
            {children}
        </div>
    )
}