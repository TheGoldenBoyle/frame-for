import { TextInput, TextInputProps } from 'react-native'
import { styled } from 'nativewind'

const StyledTextInput = styled(TextInput)

type InputProps = TextInputProps & {
    className?: string
}

export function Input({ className = '', ...props }: InputProps) {
    return (
        <StyledTextInput
            {...props}
            className={`w-full px-4 py-3 bg-surface border border-border text-text rounded-lg ${className}`}
            placeholderTextColor="#a8a29e"
        />
    )
}