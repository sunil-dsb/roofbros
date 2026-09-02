import * as React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';

function ProfileIcon(props: { color?: string; size?: number }) {
  const { color = '#2D2012', size = 26 } = props;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <Circle cx="12" cy="8" r="4" />
      <Path d="M4 21c1.5-4 5-6 8-6s6.5 2 8 6" />
    </Svg>
  );
}

export default ProfileIcon;
