import React, { useEffect, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Animated,
  Easing,
  StyleSheet,
  View,
} from 'react-native';
import { useSelector } from 'react-redux';

import AppText from '../AppText';
import { colors } from '../../themes/colors';
import fontSizes from '../../themes/fontSizes';
import { fontFamily } from '../../assets/fontFamily';

const LOADER_W = 90;
const LOADER_H = 103;
const BOX_W = 52; // .loader div
const BOX_H = 31;
const BAR_W = 4; // .loader div div span
const COLOR = colors.accent; // #7D1017  maroon, matches --accent in reference CSS

const BOX_LEFT = (LOADER_W - BOX_W) / 2; // 20
const BOX_TOP = (LOADER_H - BOX_H) / 2; // 36

const H4_LEN = 44; // Matches inner width: BOX_W (52) - 2 * BAR_W (4)
const H4_SLIDE = 37 - 10; // 27

const DURATION = 3200;
const P_GROW = 0.06944444444; // first keyframe stop
const P_HOLD = 0.5; // second
const P_SHRINK = 0.59944444443; // third

const SEG_GROW = DURATION * P_GROW; // 222.2ms
const SEG_HOLD = DURATION * (P_HOLD - P_GROW); // 1377.8ms
const SEG_SHRINK = DURATION * (P_SHRINK - P_HOLD); // 318.2ms
const SEG_REST = DURATION * (1 - P_SHRINK); // 1281.8ms

const EASE = Easing.bezier(0.25, 0.1, 0.25, 1);

function useLoadCycle(delay: number, enabled: boolean) {
  const v = useRef(new Animated.Value(0)).current;
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!enabled) return undefined;

    const hold = (to: number, duration: number) =>
      Animated.timing(v, {
        toValue: to,
        duration,
        easing: Easing.linear,
        useNativeDriver: true,
      });

    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(v, {
          toValue: 1,
          duration: SEG_GROW,
          easing: EASE,
          useNativeDriver: true,
        }),
        hold(1, SEG_HOLD),
        Animated.timing(v, {
          toValue: 2,
          duration: SEG_SHRINK,
          easing: EASE,
          useNativeDriver: true,
        }),
        hold(2, SEG_REST),
        hold(0, 0),
      ]),
      { resetBeforeIteration: false },
    );

    const id = setTimeout(() => {
      setStarted(true);
      anim.start();
    }, delay);

    return () => {
      clearTimeout(id);
      anim.stop();
      v.setValue(0);
      setStarted(false);
    };
  }, [delay, enabled, v]);

  return { v, started };
}

type BarProps = {
  delay: number;
  anchor: 'top' | 'bottom';
  animate: boolean;
  style?: any;
};

function Bar({ delay, anchor, animate, style }: BarProps) {
  const { v, started } = useLoadCycle(delay, animate);

  if (!animate) {
    return <View style={[styles.bar, style]} />;
  }

  const half = BOX_H / 2;
  const scaleY = v.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [0, 1, 0],
  });
  const translateY = v.interpolate({
    inputRange: [0, 1, 2],
    outputRange: anchor === 'bottom' ? [half, 0, -half] : [-half, 0, half],
  });

  return (
    <Animated.View
      style={[
        styles.bar,
        style,
        { opacity: started ? 1 : 0, transform: [{ translateY }, { scaleY }] },
      ]}
    />
  );
}

type BarH4Props = {
  animate: boolean;
};

function BarH4({ animate }: BarH4Props) {
  const { v, started } = useLoadCycle(1000, animate);

  if (!animate) {
    return (
      <View
        style={[styles.bar, styles.h4, { transform: [{ rotate: '90deg' }] }]}
      />
    );
  }

  const scaleY = v.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [1, 1, 0],
  });
  const translateY = v.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [H4_SLIDE, 0, -H4_LEN / 2],
  });

  return (
    <Animated.View
      style={[
        styles.bar,
        styles.h4,
        {
          opacity: started ? 1 : 0,
          // Applied right-to-left: scale in local space, rotate, then shift
          // on screen  same as CSS `transform: translateY() rotate() scaleY()`.
          transform: [{ translateY }, { rotate: '90deg' }, { scaleY }],
        },
      ]}
    />
  );
}

type LoaderProps = {
  color?: string;
  scale?: number;
  label?: string;
};

export default function Loader({
  color = colors.accent,
  scale = 1,
  label = 'Loading',
}: LoaderProps) {
  const { isLoading } = useSelector((state: any) => state.global);
  const [animate, setAnimate] = useState(true);
  const [visible, setVisible] = useState(isLoading);

  const fadeAnim = useRef(new Animated.Value(isLoading ? 1 : 0)).current;
  const scaleAnim = useRef(new Animated.Value(isLoading ? 1 : 0.9)).current;

  useEffect(() => {
    if (isLoading) {
      setVisible(true);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 220,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 220,
          easing: Easing.out(Easing.back(1.2)),
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.9,
          duration: 200,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        if (finished) {
          setVisible(false);
        }
      });
    }
  }, [isLoading, fadeAnim, scaleAnim]);

  useEffect(() => {
    let alive = true;
    AccessibilityInfo.isReduceMotionEnabled().then(reduced => {
      if (alive) setAnimate(!reduced);
    });
    const sub = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      reduced => setAnimate(!reduced),
    );
    return () => {
      alive = false;
      sub?.remove();
    };
  }, []);

  if (!visible) return null;

  const tint = { backgroundColor: color };

  return (
    <Animated.View style={[styles.screen, { opacity: fadeAnim }]}>
      <Animated.View
        accessible
        accessibilityRole="progressbar"
        accessibilityLabel={label}
        style={[
          styles.loader,
          {
            transform: [{ scale: scale }, { scale: scaleAnim }],
          },
        ]}
      >
        {/* div 1  no rotation: h6 (left edge) + h3 (right edge) */}
        <View style={styles.box}>
          <View style={styles.inner}>
            <Bar
              delay={1300}
              anchor="bottom"
              animate={animate}
              style={[styles.left, tint]}
            />
            <Bar
              delay={800}
              anchor="top"
              animate={animate}
              style={[styles.right, tint]}
            />
          </View>
        </View>

        {/* div 2  rotate(60deg): h1 */}
        <View style={[styles.box, styles.rot60]}>
          <View style={styles.inner}>
            <Bar
              delay={0}
              anchor="bottom"
              animate={animate}
              style={[styles.left, tint]}
            />
          </View>
        </View>

        {/* div 3  rotate(-60deg): h2 */}
        <View style={[styles.box, styles.rotNeg60]}>
          <View style={styles.inner}>
            <Bar
              delay={400}
              anchor="top"
              animate={animate}
              style={[styles.right, tint]}
            />
          </View>
        </View>

        {/* div 4  no rotation: h4 (bottom edge) */}
        <View style={styles.box}>
          <View style={styles.inner}>
            <BarH4 animate={animate} />
          </View>
        </View>
      </Animated.View>
      <AppText style={styles.label}>One moment…</AppText>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  screen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.ground,
    zIndex: 9999,
  },
  loader: {
    width: LOADER_W,
    height: LOADER_H,
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    position: 'absolute',
    left: BOX_LEFT,
    top: BOX_TOP,
    width: BOX_W,
    height: BOX_H,
  },
  rot60: { transform: [{ rotate: '60deg' }] },
  rotNeg60: { transform: [{ rotate: '-60deg' }] },
  inner: { width: '100%', height: '100%' },
  bar: {
    position: 'absolute',
    width: BAR_W,
    height: BOX_H,
    backgroundColor: COLOR,
  },
  left: { left: 0 },
  right: { right: 0 },
  h4: { top: 10, left: 24, height: H4_LEN },
  label: {
    marginTop: 26,
    fontSize: fontSizes.f15,
    fontFamily: fontFamily.regular,
    color: colors.muted,
    textAlign: 'center',
  },
});
