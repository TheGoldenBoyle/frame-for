import { TouchableOpacity, Text, TouchableOpacityProps } from 'react-native'

type ButtonProps = TouchableOpacityProps & {
  children: React.ReactNode
  onPress?: () => void
  variant?: 'primary' | 'secondary' | 'ghost'
  disabled?: boolean
}

export function Button({
  children,
  onPress,
  variant = 'primary',
  disabled = false,
  className = '',
  ...props
}: ButtonProps) {
  const variants = {
    primary: 'bg-primary active:bg-primary-dark',
    secondary: 'bg-surface border border-border active:bg-background',
    ghost: 'bg-transparent active:bg-background',
  }

  const textVariants = {
    primary: 'text-white',
    secondary: 'text-text',
    ghost: 'text-text-muted',
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      className={`px-6 py-3 rounded-lg ${variants[variant]} ${disabled ? 'opacity-50' : ''} ${className}`}
      {...props}
    >
      <Text className={`text-center font-medium ${textVariants[variant]}`}>
        {children}
      </Text>
    </TouchableOpacity>
  )
}