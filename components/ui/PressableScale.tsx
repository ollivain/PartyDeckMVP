import { TouchableOpacity, type TouchableOpacityProps } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

type PressableScaleProps = TouchableOpacityProps & {
  pressedScale?: number;
};

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export function PressableScale({
  activeOpacity = 0.86,
  disabled,
  onPressIn,
  onPressOut,
  pressedScale = 0.96,
  style,
  ...props
}: PressableScaleProps) {
  const scale = useSharedValue(1);
  const reduceMotion = useReducedMotion();

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const setPressed = (pressed: boolean) => {
    scale.value = reduceMotion
      ? 1
      : withTiming(pressed && !disabled ? pressedScale : 1, { duration: 100 });
  };

  return (
    <AnimatedTouchableOpacity
      {...props}
      activeOpacity={activeOpacity}
      disabled={disabled}
      onPressIn={event => {
        onPressIn?.(event);
        setPressed(true);
      }}
      onPressOut={event => {
        onPressOut?.(event);
        setPressed(false);
      }}
      style={[style, animatedStyle]}
    />
  );
}
