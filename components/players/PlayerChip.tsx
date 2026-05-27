import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';

type PlayerChipProps = {
  name: string;
  onRemove: () => void;
};

export function PlayerChip({ name, onRemove }: PlayerChipProps) {
  return (
    <View style={styles.chip}>
      <Text style={styles.name} numberOfLines={1}>
        {name}
      </Text>
      <TouchableOpacity onPress={onRemove} hitSlop={8} style={styles.removeBtn}>
        <Ionicons name="close" size={12} color={Colors.textDim} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface2,
    borderRadius: Radius.full,
    paddingVertical: Spacing.sm,
    paddingLeft: Spacing.md,
    paddingRight: Spacing.sm,
    gap: Spacing.sm,
    maxWidth: 180,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  name: {
    ...Typography.bodyMed,
    color: Colors.text,
    flexShrink: 1,
  },
  removeBtn: {
    width: 20,
    height: 20,
    borderRadius: Radius.full,
    backgroundColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
