import * as React from 'react';
import Svg, { Circle } from 'react-native-svg';

function ColoursIcon(props: { color?: string; size?: number }) {
  const { color = '#2D2012', size = 26 } = props;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <Circle cx="12" cy="8.2" r="4" />
      <Circle cx="8" cy="14.5" r="4" />
      <Circle cx="16" cy="14.5" r="4" />
    </Svg>
  );
}

export default ColoursIcon;
