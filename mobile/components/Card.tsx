import { View, ViewProps } from 'react-native'

type CardProps = ViewProps & {
    children: React.ReactNode
}

export function Card({ children, className = '', ...props }: CardProps) {
    return (
        <View className={`bg-surface border border-border rounded-xl p-8 ${className}`} {...props}>
            {children}
        </View>
    )
}