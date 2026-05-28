import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  PanResponder,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import type { FlashMode, CameraType } from 'expo-camera';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useSessionStore } from '@/store/session';

const MAX_ZOOM = 0.5;
const ZOOM_1X = 0;
const ZOOM_2X = 0.12;

export default function CameraScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('back');
  const [flash, setFlash] = useState<FlashMode>('off');
  const [zoom, setZoom] = useState(0);
  const [capturing, setCapturing] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const cameraRef = useRef<CameraView>(null);
  const addMedia = useSessionStore(s => s.addMedia);

  // Refs for pinch — PanResponder closure can't see changing state
  const zoomRef = useRef(0);
  const pinchStart = useRef({ distance: 0, zoom: 0 });

  const applyZoom = (val: number) => {
    const clamped = Math.max(0, Math.min(MAX_ZOOM, val));
    zoomRef.current = clamped;
    setZoom(clamped);
  };

  // Pinch-to-zoom via PanResponder (no extra deps needed)
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: (e) => e.nativeEvent.touches.length >= 2,
      onMoveShouldSetPanResponder: (e) => e.nativeEvent.touches.length >= 2,
      onPanResponderGrant: (e) => {
        const t = e.nativeEvent.touches;
        if (t.length < 2) return;
        const dx = t[0].pageX - t[1].pageX;
        const dy = t[0].pageY - t[1].pageY;
        pinchStart.current = {
          distance: Math.sqrt(dx * dx + dy * dy),
          zoom: zoomRef.current,
        };
      },
      onPanResponderMove: (e) => {
        const t = e.nativeEvent.touches;
        if (t.length < 2 || pinchStart.current.distance === 0) return;
        const dx = t[0].pageX - t[1].pageX;
        const dy = t[0].pageY - t[1].pageY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const scale = dist / pinchStart.current.distance;
        const newZoom = Math.max(
          0,
          Math.min(MAX_ZOOM, pinchStart.current.zoom + (scale - 1) * 0.3)
        );
        zoomRef.current = newZoom;
        setZoom(newZoom);
      },
    })
  ).current;

  const handleCapture = async () => {
    if (!cameraRef.current || capturing) return;
    setCapturing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.75 });
      if (photo?.uri) setPreview(photo.uri);
    } catch {
      // stay on camera if capture fails
    } finally {
      setCapturing(false);
    }
  };

  const handleSave = () => {
    if (preview) addMedia(preview);
    router.back();
  };

  const toggleFacing = () => setFacing(f => (f === 'back' ? 'front' : 'back'));
  const toggleFlash = () => setFlash(f => (f === 'off' ? 'on' : 'off'));

  const activeZoomLabel = zoom < ZOOM_2X / 2 ? '1x' : '2x';

  // ── Permission: loading ──────────────────────────────────────────────────
  if (!permission) {
    return (
      <View style={styles.permBg}>
        <ActivityIndicator color={Colors.accent} />
      </View>
    );
  }

  // ── Permission: permanently denied ──────────────────────────────────────
  if (!permission.granted && !permission.canAskAgain) {
    return (
      <SafeAreaView style={styles.permBg}>
        <TouchableOpacity onPress={() => router.back()} style={styles.permBackBtn}>
          <Ionicons name="close" size={22} color={Colors.textMuted} />
        </TouchableOpacity>
        <View style={styles.permContent}>
          <Ionicons name="camera-outline" size={52} color={Colors.textDim} style={{ marginBottom: Spacing.lg }} />
          <Text style={styles.permTitle}>Camera access denied</Text>
          <Text style={styles.permSub}>
            Go to Settings → PartyDeck and allow camera access to capture moments.
          </Text>
          <TouchableOpacity onPress={() => router.back()} style={styles.permSkip}>
            <Text style={styles.permSkipText}>Back to game</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ── Permission: can ask ──────────────────────────────────────────────────
  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.permBg}>
        <TouchableOpacity onPress={() => router.back()} style={styles.permBackBtn}>
          <Ionicons name="close" size={22} color={Colors.textMuted} />
        </TouchableOpacity>
        <View style={styles.permContent}>
          <View style={styles.permIconWrap}>
            <Ionicons name="camera-outline" size={36} color={Colors.accent} />
          </View>
          <Text style={styles.permTitle}>Capture the moment</Text>
          <Text style={styles.permSub}>
            PartyDeck needs camera access to save party moments to your session recap.
          </Text>
          <TouchableOpacity style={styles.permBtn} onPress={requestPermission} activeOpacity={0.8}>
            <Text style={styles.permBtnText}>Allow Camera</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.back()} style={styles.permSkip}>
            <Text style={styles.permSkipText}>Skip</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ── Preview ──────────────────────────────────────────────────────────────
  if (preview) {
    return (
      <View style={styles.container}>
        <Image source={{ uri: preview }} style={StyleSheet.absoluteFill} resizeMode="cover" />

        {/* Top bar with close + label */}
        <SafeAreaView style={styles.topBar} edges={['top']}>
          <TouchableOpacity onPress={() => router.back()} style={styles.topBtn} activeOpacity={0.8}>
            <Ionicons name="close" size={22} color="#fff" />
          </TouchableOpacity>
          <View style={styles.topLabel}>
            <Text style={styles.topLabelText}>PREVIEW</Text>
          </View>
          <View style={{ width: 44 }} />
        </SafeAreaView>

        {/* Retake / Save */}
        <SafeAreaView style={styles.previewBottom} edges={['bottom']}>
          <TouchableOpacity style={styles.retakeBtn} onPress={() => setPreview(null)} activeOpacity={0.8}>
            <Ionicons name="refresh" size={18} color={Colors.text} />
            <Text style={styles.retakeBtnText}>Retake</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.8}>
            <Ionicons name="checkmark" size={20} color="#0A0908" />
            <Text style={styles.saveBtnText}>Save</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </View>
    );
  }

  // ── Camera active ────────────────────────────────────────────────────────
  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing={facing}
        flash={flash}
        zoom={zoom}
      />

      {/* Bottom controls — all in one area at the bottom */}
      <SafeAreaView style={styles.bottomArea} edges={['bottom']}>

        {/* Zoom toggle */}
        <View style={styles.zoomRow}>
          {([{ label: '1x', value: ZOOM_1X }, { label: '2x', value: ZOOM_2X }] as const).map(
            ({ label, value }) => (
              <TouchableOpacity
                key={label}
                style={[styles.zoomBtn, activeZoomLabel === label && styles.zoomBtnActive]}
                onPress={() => applyZoom(value)}
                activeOpacity={0.75}
              >
                <Text style={[styles.zoomBtnText, activeZoomLabel === label && styles.zoomBtnTextActive]}>
                  {label}
                </Text>
              </TouchableOpacity>
            )
          )}
        </View>

        {/* Main row: flip – shutter – flash */}
        <View style={styles.controlsRow}>
          {/* Flip camera */}
          <TouchableOpacity onPress={toggleFacing} style={styles.sideBtn} activeOpacity={0.8}>
            <Ionicons name="camera-reverse-outline" size={26} color="#fff" />
          </TouchableOpacity>

          {/* Shutter */}
          <TouchableOpacity
            onPress={handleCapture}
            style={styles.captureRing}
            activeOpacity={0.85}
            disabled={capturing}
          >
            {capturing ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <View style={styles.captureDot} />
            )}
          </TouchableOpacity>

          {/* Flash */}
          <TouchableOpacity
            onPress={toggleFlash}
            style={[styles.sideBtn, flash === 'on' && styles.sideBtnLit]}
            activeOpacity={0.8}
          >
            <Ionicons
              name={flash === 'on' ? 'flash' : 'flash-off'}
              size={22}
              color={flash === 'on' ? Colors.accent : '#fff'}
            />
          </TouchableOpacity>
        </View>

        {/* Cancel — subtle, secondary */}
        <TouchableOpacity onPress={() => router.back()} style={styles.cancelRow} activeOpacity={0.6}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },

  // ── Permission screens ───────────────────────────────────────────────────
  permBg: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  permBackBtn: {
    margin: Spacing.lg,
    width: 38,
    height: 38,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  permContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  permIconWrap: {
    width: 80,
    height: 80,
    borderRadius: Radius.full,
    backgroundColor: Colors.accentBg,
    borderWidth: 1,
    borderColor: Colors.accentBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
  },
  permTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.text,
    letterSpacing: -0.5,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  permSub: {
    fontSize: 15,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.xl,
  },
  permBtn: {
    backgroundColor: Colors.accent,
    borderRadius: Radius.xl,
    paddingVertical: 16,
    paddingHorizontal: Spacing.xxl,
    width: '100%',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  permBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0A0908',
  },
  permSkip: {
    paddingVertical: Spacing.md,
  },
  permSkipText: {
    fontSize: 14,
    color: Colors.textDim,
  },

  // ── Camera top bar (preview only) ───────────────────────────────────────
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  topBtn: {
    width: 44,
    height: 44,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(0,0,0,0.48)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topLabel: {
    backgroundColor: 'rgba(0,0,0,0.42)',
    borderRadius: Radius.full,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  topLabelText: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.85)',
    letterSpacing: 1.4,
  },

  // ── Preview bottom ───────────────────────────────────────────────────────
  previewBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  retakeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 60,
    borderRadius: Radius.xl,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  retakeBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  saveBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 60,
    borderRadius: Radius.xl,
    backgroundColor: Colors.accent,
  },
  saveBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0A0908',
  },

  // ── Camera bottom controls ───────────────────────────────────────────────
  bottomArea: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
    // subtle gradient effect via shadow-less bg
    backgroundColor: 'rgba(0,0,0,0.28)',
  },
  zoomRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  zoomBtn: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  zoomBtnActive: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderColor: 'rgba(255,255,255,0.45)',
  },
  zoomBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 0.2,
  },
  zoomBtnTextActive: {
    color: '#fff',
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.sm,
  },
  sideBtn: {
    width: 52,
    height: 52,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(0,0,0,0.42)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  sideBtnLit: {
    borderColor: Colors.accentBorder,
    backgroundColor: Colors.accentBg,
  },
  captureRing: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 3,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureDot: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#fff',
  },
  cancelRow: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xl,
    marginTop: 2,
  },
  cancelText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.38)',
    fontWeight: '500',
    letterSpacing: 0.2,
  },
});
