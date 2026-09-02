import React, { useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import AppText from '../AppText';
import { colors } from '../../themes/colors';
import { fontFamily } from '../../assets/fontFamily';
import fontSizes from '../../themes/fontSizes';
import { routesConstants } from '../../navigations/routeConstants';
import JobsIcon from '../../assets/icons/jobsIcon';
import PlusIcon from '../../assets/icons/plusIcon';
import ColoursIcon from '../../assets/icons/coloursIcon';
import ProfileIcon from '../../assets/icons/profileIcon';
import { spacing, width } from '../../themes/spacing';
import { navigate } from '../../navigations/navigationServices';

const ICON_SIZE = 26;

const TAB_CONFIG: Record<
  string,
  { label: string; Icon: React.FC<{ color?: string; size?: number }> }
> = {
  [routesConstants.jobs]: { label: 'Jobs', Icon: JobsIcon },
  ['NewTab']: { label: 'New', Icon: PlusIcon },
  [routesConstants.colours]: { label: 'Colours', Icon: ColoursIcon },
  [routesConstants.profile]: { label: 'Profile', Icon: ProfileIcon },
};

interface TabButtonProps {
  route: any;
  isFocused: boolean;
  descriptors: any;
  navigation: any;
}

const AnimatedTabButton = ({
  route,
  isFocused,
  descriptors,
  navigation,
}: TabButtonProps) => {
  const { options } = descriptors[route.key];
  const label =
    options.tabBarLabel !== undefined
      ? options.tabBarLabel
      : options.title !== undefined
      ? options.title
      : route.name;

  const config = TAB_CONFIG[route.name] || {
    label: route.name,
    Icon: JobsIcon,
  };
  const { Icon } = config;
  const iconColor = isFocused ? colors.accent : colors.ink;

  const scale = useSharedValue(isFocused ? 1.12 : 1);
  const pressScale = useSharedValue(1);

  useEffect(() => {
    scale.value = withSpring(isFocused ? 1.12 : 1, {
      damping: 12,
      stiffness: 200,
    });
  }, [isFocused, scale]);

  const onPressIn = () => {
    pressScale.value = withSpring(0.9, { damping: 15, stiffness: 300 });
  };

  const onPressOut = () => {
    pressScale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value * pressScale.value }],
  }));

  const onPress = () => {
    const event = navigation.emit({
      type: 'tabPress',
      target: route.key,
      canPreventDefault: true,
    });

    if (!isFocused && !event.defaultPrevented) {
      navigate({ name: route.name, merge: true });
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      style={styles.tabButton}
      activeOpacity={0.7}
      hitSlop={20}
    >
      <Animated.View style={[styles.animatedContainer, animatedStyle]}>
        <Icon color={iconColor} size={ICON_SIZE} />
        <AppText style={styles.label}>{label}</AppText>
      </Animated.View>
    </TouchableOpacity>
  );
};

const BottomBar = ({ state, descriptors, navigation }: any) => {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        { paddingBottom: insets.bottom + width * 0.03 },
      ]}
    >
      {state.routes.map((route: any, index: number) => {
        const isFocused = state.index === index;
        return (
          <AnimatedTabButton
            key={route.key}
            route={route}
            isFocused={isFocused}
            descriptors={descriptors}
            navigation={navigation}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.ground,
    borderTopWidth: 0.5,
    borderTopColor: colors.ink,
    paddingTop: spacing.xs,
    justifyContent: 'space-between',
    paddingHorizontal: width * 0.1,
  },
  tabButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  animatedContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
  },
  label: {
    fontSize: fontSizes.f12,
    fontFamily: fontFamily.medium,
    textAlign: 'center',
    color: colors.ink,
  },
});

export default BottomBar;
