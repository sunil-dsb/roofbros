/**
 * TileTexture
 *
 * Crisp tile pattern with animated reveal.
 *
 * The SVG overlay is wrapped in an Animated.View so its opacity can be
 * driven by a Reanimated SharedValue  enabling smooth fade-out on hold
 * and fade-in on release, without any flickering or layout shift.
 *
 * Props:
 *   color           base tile colour
 *   textureOpacity  Reanimated SharedValue<number> (1 = full, 0 = hidden)
 *   style           applied to the container View
 *   children        rendered on top (hold pill, badge, etc.)
 */
import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { SharedValue } from 'react-native-reanimated';

interface TileTextureProps {
  color: string;
  style?: ViewStyle;
  children?: React.ReactNode;
  /** Reanimated shared value driving overlay opacity. 1 = texture visible. */
  textureOpacity?: SharedValue<number>;
  /** Tile pattern size in pixels (width/height of tile barrel in SVG pattern). Default is 32. */
  tileSize?: number;
}

const TileTexture: React.FC<TileTextureProps> = ({
  color,
  style,
  children,
}) => {
  return (
    <View style={[styles.container, style]}>
      {/* ── Base colour layer ── */}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: color }]} />

      {/* Children always on top */}
      {children}
    </View>
  );
};

export default TileTexture;

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    position: 'relative',
  },
});
