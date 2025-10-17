type CardProps = {
    children: React.ReactNode
    className?: string
}

export function Card({ children, className = '' }: CardProps) {
    return (
        <div
            className={`border p-8 ${className}`}
            style={{
                backgroundColor: 'var(--color-surface)',
                borderColor: 'var(--color-border)',
                borderRadius: 'var(--radius-lg)',
            }}
        >
            {children}
        </div>
    )
}