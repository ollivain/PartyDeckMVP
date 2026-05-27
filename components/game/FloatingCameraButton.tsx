import { Alert, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius } from '@/constants/theme';

type FloatingCameraButtonProps = {
  bottomInset?: number;
};

export function FloatingCameraButton({ bottomInset = 24 }: FloatingCameraButtonProps) {
  const handlePress = () => {
    Alert.alert('📸 Camera', 'Camera is coming in the next update!', [{ text: 'Got it' }]);
  };

  return (
    <TouchableOpacity
      style={[styles.button, { bottom: bottomInset }]}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <Ionicons name="camera" size={22} color="#0A0908" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    right: 24,
    width: 52,
    height: 52,
    borderRadius: Radius.full,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 8,
  },
});
