type InputProps = {
    type?: string
    value: string
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    placeholder?: string
    required?: boolean
    className?: string
}

export function Input({
    type = 'text',
    value,
    onChange,
    placeholder,
    required = false,
    className = '',
}: InputProps) {
    return (
        <input
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            className={`w-full px-4 py-3 border transition-colors focus:outline-none ${className}`}
            style={{
                backgroundColor: 'var(--color-surface)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text)',
                borderRadius: 'var(--radius-md)',
            }}
            onFocus={(e) => e.currentTarget.style.borderColor = 'var(--color-primary)'}
            onBlur={(e) => e.currentTarget.style.borderColor = 'var(--color-border)'}
        />
    )
}