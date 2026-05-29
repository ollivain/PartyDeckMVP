import { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/ui/Screen';
import { Button } from '@/components/ui/Button';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { useSessionStore } from '@/store/session';

const GHOST_WIDTHS = [62, 45, 55] as const;

export default function PlayersScreen() {
  const [inputValue, setInputValue] = useState('');
  const [inputFocused, setInputFocused] = useState(false);
  const players = useSessionStore(s => s.players);
  const addPlayer = useSessionStore(s => s.addPlayer);
  const removePlayer = useSessionStore(s => s.removePlayer);

  const handleAdd = () => {
    if (!inputValue.trim()) return;
    if (players.length >= 10) {
      Alert.alert('Max players', 'You can have up to 10 players.');
      return;
    }
    addPlayer(inputValue);
    setInputValue('');
  };

  const canContinue = players.length >= 2;

  return (
    <Screen scroll>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={8} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color={Colors.textMuted} />
        </TouchableOpacity>
        <Text style={styles.stepLabel}>STEP 1 OF 3</Text>
      </View>

      <View style={styles.titleBlock}>
        <Text style={styles.title}>
          <Text style={{ color: Colors.text }}>Who is{'\n'}</Text>
          <Text style={{ color: Colors.accent }}>playing?</Text>
        </Text>
        <Text style={styles.subtitle}>Add at least 2 players to start</Text>
      </View>

      {/* Input row */}
      <View style={styles.inputRow}>
        <TextInput
          style={[styles.input, inputFocused && styles.inputFocused]}
          placeholder="Enter a name..."
          placeholderTextColor={Colors.textDim}
          value={inputValue}
          onChangeText={setInputValue}
          onSubmitEditing={handleAdd}
          onFocus={() => setInputFocused(true)}
          onBlur={() => setInputFocused(false)}
          returnKeyType="done"
          maxLength={20}
          autoCapitalize="words"
          selectionColor={Colors.accent}
          autoFocus
        />
        <TouchableOpacity
          style={[styles.addBtn, !inputValue.trim() && styles.addBtnDisabled]}
          onPress={handleAdd}
          disabled={!inputValue.trim()}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={24} color={inputValue.trim() ? '#0A0908' : Colors.textDim} />
        </TouchableOpacity>
      </View>

      {/* Player list or ghost empty state */}
      {players.length > 0 ? (
        <View style={styles.playerList}>
          <Text style={styles.sectionLabel}>
            {players.length} PLAYER{players.length !== 1 ? 'S' : ''}
          </Text>
          {players.map((p, i) => (
            <View key={p.id} style={[styles.playerRow, i === players.length - 1 && styles.playerRowLast]}>
              <View style={styles.playerIdxCircle}>
                <Text style={styles.playerIdx}>{i + 1}</Text>
              </View>
              <Text style={styles.playerRowName} numberOfLines={1}>{p.name}</Text>
              <TouchableOpacity
                onPress={() => removePlayer(p.id)}
                style={styles.rowRemoveBtn}
                hitSlop={{ top: 12, bottom: 12, left: 16, right: 16 }}
              >
                <Ionicons name="close" size={15} color={Colors.textDim} />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.ghostList}>
          <Text style={styles.ghostHeading}>PLAYERS</Text>
          {GHOST_WIDTHS.map((w, i) => (
            <View key={i} style={[styles.ghostRow, { opacity: 0.52 - i * 0.14 }]}>
              <View style={styles.ghostIdx} />
              <View style={[styles.ghostBar, { width: `${w}%` }]} />
            </View>
          ))}
          <Text style={styles.ghostHint}>Add players above to get started</Text>
        </View>
      )}

      <View style={styles.footer}>
        <Button
          label={!canContinue ? `Need ${2 - players.length} more player${players.length === 1 ? '' : 's'}` : 'Continue →'}
          onPress={() => router.push('/mode')}
          fullWidth
          disabled={!canContinue}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Spacing.md,
    marginBottom: Spacing.xl,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepLabel: {
    ...Typography.label,
    color: Colors.textDim,
  },
  titleBlock: {
    marginBottom: Spacing.xl,
  },
  title: {
    ...Typography.h1,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '400',
    color: Colors.textMuted,
    lineHeight: 22,
  },

  // Input
  inputRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  input: {
    flex: 1,
    height: 56,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    color: Colors.text,
    fontSize: 16,
  },
  inputFocused: {
    borderColor: Colors.accent,
  },
  addBtn: {
    width: 56,
    height: 56,
    borderRadius: Radius.lg,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnDisabled: {
    backgroundColor: Colors.surface2,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },

  // Player list
  playerList: {
    marginBottom: Spacing.xl,
  },
  sectionLabel: {
    ...Typography.label,
    color: Colors.textMuted,
    marginBottom: Spacing.sm,
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderSubtle,
  },
  playerRowLast: {
    borderBottomWidth: 0,
  },
  playerIdxCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playerIdx: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.accent,
  },
  playerRowName: {
    flex: 1,
    fontSize: 17,
    fontWeight: '600',
    color: Colors.text,
    letterSpacing: -0.2,
  },
  rowRemoveBtn: {
    width: 28,
    height: 28,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Ghost empty state
  ghostList: {
    marginBottom: Spacing.xl,
  },
  ghostHeading: {
    ...Typography.label,
    color: Colors.textDim,
    marginBottom: Spacing.sm,
  },
  ghostRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderSubtle,
  },
  ghostIdx: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.surface2,
  },
  ghostBar: {
    height: 12,
    borderRadius: 4,
    backgroundColor: Colors.surface2,
  },
  ghostHint: {
    fontSize: 13,
    color: Colors.textDim,
    textAlign: 'center',
    marginTop: Spacing.lg,
    letterSpacing: 0.1,
  },

  // Footer
  footer: {
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
});
