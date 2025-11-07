import { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  children: ReactNode
  disabled?: boolean
  className?: string
}

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  disabled = false,
  className = '',
  ...props
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
  
  const variants = {
    primary: 'bg-primary text-white hover:bg-primary-dark active:scale-95 shadow-md hover:shadow-lg',
    secondary: 'bg-surface border border-border text-text hover:bg-surface/80 hover:border-primary/50 active:scale-95',
    ghost: 'bg-transparent text-text hover:bg-surface/50 hover:text-primary active:scale-95',
    danger: 'bg-red-500 text-white hover:bg-red-600 active:scale-95 shadow-md hover:shadow-lg',
  }
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  }
  
  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}