/// <reference types="nativewind/types" />

import type {
  ViewProps as RNViewProps,
  TextProps as RNTextProps,
  TextInputProps as RNTextInputProps,
  TouchableOpacityProps as RNTouchableOpacityProps,
  ScrollViewProps as RNScrollViewProps,
  SafeAreaViewProps as RNSafeAreaViewProps,
  KeyboardAvoidingViewProps as RNKeyboardAvoidingViewProps,
} from 'react-native';

declare module 'react-native' {
  interface ViewProps extends RNViewProps {
    className?: string;
  }

  interface TextProps extends RNTextProps {
    className?: string;
  }

  interface TextInputProps extends RNTextInputProps {
    className?: string;
  }

  interface TouchableOpacityProps extends RNTouchableOpacityProps {
    className?: string;
  }

  interface ScrollViewProps extends RNScrollViewProps {
    className?: string;
    contentContainerClassName?: string;
  }

  interface SafeAreaViewProps extends RNSafeAreaViewProps {
    className?: string;
  }

  interface KeyboardAvoidingViewProps extends RNKeyboardAvoidingViewProps {
    className?: string;
  }
}

declare module 'react-native-safe-area-context' {
  import type { SafeAreaViewProps as RNSafeAreaViewProps } from 'react-native-safe-area-context';

  interface SafeAreaViewProps extends RNSafeAreaViewProps {
    className?: string;
  }
}
