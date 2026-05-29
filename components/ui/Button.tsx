import { StyleSheet, Text } from 'react-native';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { PressableScale } from '@/components/ui/PressableScale';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

type ButtonProps = {
  label: string;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  disabled?: boolean;
  fullWidth?: boolean;
};

const variantContainer = {
  primary: { backgroundColor: Colors.accent },
  secondary: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: Colors.border },
  ghost: { backgroundColor: 'transparent' },
  danger: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: 'rgba(248, 113, 113, 0.4)' },
} as const;

const variantText = {
  primary: { color: '#0A0908', fontWeight: '700' as const },
  secondary: { color: Colors.text },
  ghost: { color: Colors.textMuted },
  danger: { color: '#F87171' },
} as const;

const sizeContainer = {
  sm: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: Radius.md },
  md: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, borderRadius: Radius.lg },
  lg: { paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md + 2, borderRadius: Radius.xl },
} as const;

const sizeText = {
  sm: { fontSize: 13 },
  md: { fontSize: 15 },
  lg: { fontSize: 16 },
} as const;

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'lg',
  disabled,
  fullWidth,
}: ButtonProps) {
  return (
    <PressableScale
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.78}
      pressedScale={variant === 'ghost' ? 0.99 : 0.97}
      style={[
        styles.base,
        variantContainer[variant],
        sizeContainer[size],
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
      ]}
    >
      <Text style={[styles.text, variantText[variant], sizeText[size]]}>{label}</Text>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.35,
  },
  text: {
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});
