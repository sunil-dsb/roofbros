import React from 'react';
import {
  View,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TouchableOpacity,
  Animated,
} from 'react-native';
import AppText from '../AppText';
import { colors } from '../../themes/colors';
import { fontFamily } from '../../assets/fontFamily';
import fontSizes from '../../themes/fontSizes';

export type TimelineStatus = 'done' | 'now' | 'upcoming';

export interface TimelineEvent {
  id: string;
  title: string;
  subtitle?: string;
  status: TimelineStatus;
}

interface TimelineProps {
  events: TimelineEvent[];
  style?: StyleProp<ViewStyle>;
  onEventPress?: (event: TimelineEvent) => void;
}

const Timeline = ({ events, style, onEventPress }: TimelineProps) => {
  const animatedValues = React.useMemo(() => {
    return events.map(() => new Animated.Value(0));
  }, [events.length]);

  React.useEffect(() => {
    animatedValues.forEach(val => val.setValue(0));
    Animated.stagger(
      100,
      animatedValues.map(anim =>
        Animated.spring(anim, {
          toValue: 1,
          friction: 8,
          tension: 50,
          useNativeDriver: true,
        }),
      ),
    ).start();
  }, [animatedValues]);

  return (
    <View style={[styles.container, style]}>
      {events.map((event, index) => {
        const isLast = index === events.length - 1;
        const isNow = event.status === 'now';
        const nextEvent = events[index + 1];
        const nextIsNow = nextEvent?.status === 'now';

        let dotColor = colors.line;
        let textColor = colors.muted;

        if (event.status === 'done') {
          dotColor = colors.success;
          textColor = colors.ink;
        } else if (isNow) {
          dotColor = colors.accent;
          textColor = colors.ink;
        }

        const currentDotBottom = isNow ? 20 : 16;
        const lineTop = currentDotBottom + 4;

        const nextDotTop = nextIsNow ? 2 : 6;
        const lineBottom = -(nextDotTop - 4);

        const EventContainer = onEventPress ? TouchableOpacity : View;

        const animStyle = {
          opacity: animatedValues[index],
          transform: [
            {
              translateY: animatedValues[index].interpolate({
                inputRange: [0, 1],
                outputRange: [10, 0],
              }),
            },
          ],
        };

        return (
          <EventContainer
            key={event.id}
            activeOpacity={0.8}
            onPress={onEventPress ? () => onEventPress(event) : undefined}
          >
            <Animated.View style={[styles.eventContainer, animStyle]}>
              <View style={styles.indicatorContainer}>
                {!isLast && (
                  <View
                    style={[styles.line, { top: lineTop, bottom: lineBottom }]}
                  />
                )}
                {isNow ? (
                  <View
                    style={[
                      styles.outerDot,
                      { backgroundColor: colors.accentTint },
                    ]}
                  >
                    <View
                      style={[styles.innerDot, { backgroundColor: dotColor }]}
                    />
                  </View>
                ) : (
                  <View style={[styles.dot, { backgroundColor: dotColor }]} />
                )}
              </View>
              <View style={styles.contentContainer}>
                <AppText style={[styles.text, { color: textColor }]}>
                  {event.status !== 'upcoming' ? (
                    <AppText style={[styles.title, { color: textColor }]}>
                      {event.title}
                    </AppText>
                  ) : (
                    event.title
                  )}
                  {event.subtitle ? ` · ${event.subtitle}` : ''}
                </AppText>
              </View>
            </Animated.View>
          </EventContainer>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  eventContainer: {
    flexDirection: 'row',
  },
  indicatorContainer: {
    width: 24,
    alignItems: 'center',
    marginRight: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 6,
  },
  outerDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  innerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  line: {
    position: 'absolute',
    width: 1,
    backgroundColor: colors.line,
    left: '50%',
    marginLeft: -0.5,
  },
  contentContainer: {
    flex: 1,
    paddingBottom: 24,
    paddingTop: 1,
  },
  text: {
    fontFamily: fontFamily.regular,
    fontSize: fontSizes.f15,
    lineHeight: 22,
  },
  title: {
    fontFamily: fontFamily.medium,
    fontSize: fontSizes.f15,
  },
});

export default Timeline;
