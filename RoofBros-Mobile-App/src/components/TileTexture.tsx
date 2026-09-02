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
import Svg, {
  Defs,
  LinearGradient,
  Stop,
  Pattern,
  Rect,
} from 'react-native-svg';
import Animated, {
  useAnimatedStyle,
  SharedValue,
} from 'react-native-reanimated';

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
  textureOpacity,
  tileSize = 32,
}) => {
  const barrelW = tileSize;
  const bodyH = tileSize;
  const shadowH = Math.max(1, Math.round(tileSize * (6 / 32)));
  const cellH = bodyH + shadowH;
  const valleyF = 3 / barrelW;

  const ridgeId = `ridge-${tileSize}`;
  const tilesId = `tiles-${tileSize}`;

  const animStyle = useAnimatedStyle(() => ({
    opacity: textureOpacity ? textureOpacity.value : 1,
  }));

  return (
    <View style={[styles.container, style]}>
      {/* ── Base colour layer ── */}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: color }]} />

      {/* ── Animated SVG tile overlay ── */}
      <Animated.View style={[StyleSheet.absoluteFill, animStyle]}>
        <Svg style={StyleSheet.absoluteFill} width="100%" height="100%">
          <Defs>
            <LinearGradient
              id={ridgeId}
              x1="0"
              y1="0"
              x2={barrelW}
              y2="0"
              gradientUnits="userSpaceOnUse"
            >
              <Stop offset="0" stopColor="#000000" stopOpacity="0.25" />
              <Stop
                offset={`${valleyF}`}
                stopColor="#000000"
                stopOpacity="0.25"
              />
              <Stop
                offset={`${valleyF}`}
                stopColor="#000000"
                stopOpacity="0.00"
              />
              <Stop offset="0.40" stopColor="#000000" stopOpacity="0.00" />
              <Stop offset="0.50" stopColor="#ffffff" stopOpacity="0.10" />
              <Stop offset="0.60" stopColor="#000000" stopOpacity="0.00" />
              <Stop
                offset={`${1 - valleyF}`}
                stopColor="#000000"
                stopOpacity="0.00"
              />
              <Stop
                offset={`${1 - valleyF}`}
                stopColor="#000000"
                stopOpacity="0.25"
              />
              <Stop offset="1" stopColor="#000000" stopOpacity="0.25" />
            </LinearGradient>

            <Pattern
              id={tilesId}
              x="0"
              y="0"
              width={barrelW}
              height={cellH}
              patternUnits="userSpaceOnUse"
            >
              <Rect
                x="0"
                y="0"
                width={barrelW}
                height={1}
                fill="#000000"
                fillOpacity="0.20"
              />
              <Rect
                x="0"
                y="0"
                width={barrelW}
                height={bodyH}
                fill={`url(#${ridgeId})`}
              />
              <Rect
                x="0"
                y={bodyH}
                width={barrelW}
                height={shadowH}
                fill="#000000"
                fillOpacity="0.28"
              />
            </Pattern>
          </Defs>

          <Rect width="100%" height="100%" fill={`url(#${tilesId})`} />
        </Svg>
      </Animated.View>

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
