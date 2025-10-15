import { View } from 'react-native'
import { styled } from 'nativewind'

const StyledView = styled(View)

type CardProps = {
    children: React.ReactNode
    className?: string
}

export function Card({ children, className = '' }: CardProps) {
    return (
        <StyledView className={`bg-surface border border-border rounded-xl p-8 ${className}`}>
            {children}
        </StyledView>
    )
}