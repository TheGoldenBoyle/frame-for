import { HTMLAttributes } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: 'none' | 'sm' | 'md' | 'lg'
  animate?: boolean
}

const paddingStyles = {
  none: '',
  sm: 'p-2',
  md: 'p-4',
  lg: 'p-4 md:p-8',
}

export function Card({
  padding = 'lg',
  animate = true,
  className = '',
  children,
  ...props
}: CardProps) {
  // When animate=false, explicitly remove all animation & transition styles
  const noAnimateStyles = !animate
    ? 'animate-none transition-none transform-none motion-reduce:transition-none motion-reduce:transform-none'
    : 'animate-fade-in-up transition-all hover:shadow-elevated-gold hover:-translate-y-1'

  return (
    <div
      className={`bg-surface border border-border rounded-lg shadow-elevated ${noAnimateStyles} ${paddingStyles[padding]} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
