import React, { useEffect, useMemo, useState, useRef } from 'react';
import { View, Image, StyleSheet, Animated as RNAnimated } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { colors } from '../themes/colors';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type Bounds = {
  minLng: number;
  minLat: number;
  maxLng: number;
  maxLat: number;
};

export type LngLat = [number, number];

export interface RoofGeometry {
  type: 'Polygon';
  coordinates: LngLat[][];
}

interface RoofOverlayProps {
  /** Full absolute URL of the satellite image */
  imageUrl: string;
  /**
   * Geographic bounds of the satellite image as returned by the API:
   * "minLng,minLat,maxLng,maxLat"
   */
  bbox: string;
  /** geometry object from the API response */
  geometry: RoofGeometry;
  /** Container width in px */
  imageWidth: number;
  /** Container height in px */
  imageHeight: number;
}

// ---------------------------------------------------------------------------
// Pure helpers (taken from the reference code you provided)
// ---------------------------------------------------------------------------

/**
 * Linear projection from EPSG:4326 → canvas pixels.
 * Matches the reference implementation exactly.
 */
function project(
  coordinates: LngLat[],
  bounds: Bounds,
  width: number,
  height: number,
): { x: number; y: number }[] {
  const lngSpan = bounds.maxLng - bounds.minLng;
  const latSpan = bounds.maxLat - bounds.minLat;

  return coordinates.map(([lng, lat]) => ({
    x: ((lng - bounds.minLng) / lngSpan) * width,
    // lat increases northward; y increases downward → invert
    y: ((bounds.maxLat - lat) / latSpan) * height,
  }));
}

function pointsToPath(pts: { x: number; y: number }[]): string {
  if (!pts.length) return '';
  return (
    `M ${pts[0].x} ${pts[0].y} ` +
    pts
      .slice(1)
      .map(p => `L ${p.x} ${p.y}`)
      .join(' ') +
    ' Z'
  );
}

function approxPathLength(pts: { x: number; y: number }[]): number {
  let len = 0;
  for (let i = 1; i < pts.length; i++) {
    const dx = pts[i].x - pts[i - 1].x;
    const dy = pts[i].y - pts[i - 1].y;
    len += Math.sqrt(dx * dx + dy * dy);
  }
  return len;
}

/**
 * Parse "minLng,minLat,maxLng,maxLat" → Bounds
 */
function parseBbox(bbox: string): Bounds {
  const [minLng, minLat, maxLng, maxLat] = bbox.split(',').map(Number);
  return { minLng, minLat, maxLng, maxLat };
}

/**
 * When resizeMode="contain", the image is scaled uniformly to fit the
 * container and centred. This returns the pixel rect where the image
 * actually lands so the SVG can be offset accordingly.
 */
function computeContainRect(
  intrinsicW: number,
  intrinsicH: number,
  containerW: number,
  containerH: number,
) {
  const scale = Math.min(containerW / intrinsicW, containerH / intrinsicH);
  const renderedW = intrinsicW * scale;
  const renderedH = intrinsicH * scale;
  return {
    x: (containerW - renderedW) / 2,
    y: (containerH - renderedH) / 2,
    width: renderedW,
    height: renderedH,
  };
}

// ---------------------------------------------------------------------------
// Animated Path
// ---------------------------------------------------------------------------

const AnimatedPath = Animated.createAnimatedComponent(Path);

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const ShimmerLoader = () => {
  const opacity = useRef(new RNAnimated.Value(0.3)).current;

  useEffect(() => {
    RNAnimated.loop(
      RNAnimated.sequence([
        RNAnimated.timing(opacity, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        RNAnimated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [opacity]);

  return (
    <RNAnimated.View
      style={[
        StyleSheet.absoluteFill,
        { backgroundColor: colors.muted, opacity },
      ]}
    />
  );
};

const RoofOverlay: React.FC<RoofOverlayProps> = ({
  imageUrl,
  bbox,
  geometry,
  imageWidth,
  imageHeight,
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  // 1. Parse bbox → Bounds (matches reference code's Bounds type)
  const imageBounds = useMemo(() => parseBbox(bbox), [bbox]);

  // 2. Fetch intrinsic image dimensions so we can compute the "contain" rect
  const [intrinsicSize, setIntrinsicSize] = useState<{
    w: number;
    h: number;
  } | null>(null);

  useEffect(() => {
    Image.getSize(
      imageUrl,
      (w, h) => setIntrinsicSize({ w, h }),
      () => {
        // Fallback: assume square  overlay will still render
        setIntrinsicSize({ w: imageWidth, h: imageHeight });
      },
    );
  }, [imageUrl, imageWidth, imageHeight]);

  // 3. Compute the pixel rect where the image lands inside the container
  const containRect = useMemo(() => {
    if (!intrinsicSize) return null;
    return computeContainRect(
      intrinsicSize.w,
      intrinsicSize.h,
      imageWidth,
      imageHeight,
    );
  }, [intrinsicSize, imageWidth, imageHeight]);

  // 4. Project polygon vertices into the rendered image rect
  const exteriorRing = geometry.coordinates[0];

  const points = useMemo(() => {
    if (!containRect) return [];

    // Project into the image's rendered dimensions
    const projected = project(
      exteriorRing,
      imageBounds,
      containRect.width,
      containRect.height,
    );

    // Shift by the contain offset so the polygon sits over the image
    return projected.map(p => ({
      x: p.x + containRect.x,
      y: p.y + containRect.y,
    }));
  }, [exteriorRing, imageBounds, containRect]);

  const svgPath = useMemo(() => pointsToPath(points), [points]);
  const totalLen = useMemo(() => approxPathLength(points), [points]);

  // ---------------------------------------------------------------------------
  // Animations
  // ---------------------------------------------------------------------------

  // strokeDashoffset: totalLen → 0  (draw-on effect)
  const dashOffset = useSharedValue(0);
  // fill opacity: 0 → 0.35 (fades in after stroke completes)
  const fillOpacity = useSharedValue(0);

  useEffect(() => {
    if (totalLen <= 0) return;

    // Reset before animating (handles re-renders)
    dashOffset.value = totalLen;
    fillOpacity.value = 0;

    // Draw stroke over 1.3 s
    dashOffset.value = withTiming(0, {
      duration: 1300,
      easing: Easing.out(Easing.cubic),
    });

    // Fade fill in after stroke is nearly done
    fillOpacity.value = withDelay(
      1100,
      withTiming(0.35, {
        duration: 500,
        easing: Easing.out(Easing.quad),
      }),
    );
  }, [totalLen]);

  const animatedStrokeProps = useAnimatedProps(() => ({
    strokeDashoffset: dashOffset.value,
    strokeDasharray: [totalLen, totalLen] as any,
  }));

  const animatedFillProps = useAnimatedProps(() => ({
    fillOpacity: fillOpacity.value,
  }));

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <View
      style={[styles.container, { width: imageWidth, height: imageHeight }]}
    >
      {/* resizeMode="contain" keeps aspect ratio – matches the reference code */}
      <Image
        source={{ uri: imageUrl }}
        style={styles.image}
        resizeMode="contain"
        onLoad={() => setImageLoaded(true)}
      />

      {!imageLoaded && <ShimmerLoader />}

      {/* Only render SVG once we know the rendered image rect */}
      {containRect && svgPath.length > 0 && (
        <Svg
          width={imageWidth}
          height={imageHeight}
          style={StyleSheet.absoluteFill}
        >
          {/* Semi-transparent fill  fades in after stroke draws */}
          <AnimatedPath
            d={svgPath}
            fill="rgb(125, 16, 23)"
            stroke="transparent"
            animatedProps={animatedFillProps}
          />

          {/* Stroke draw-on animation */}
          <AnimatedPath
            d={svgPath}
            fill="transparent"
            stroke="rgb(125, 16, 23)"
            strokeWidth={3}
            strokeLinejoin="round"
            strokeLinecap="round"
            animatedProps={animatedStrokeProps}
          />
        </Svg>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.panel,
  },
  image: {
    width: '100%',
    height: '100%',
  },
});

export default RoofOverlay;
