import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

function JobsIcon(props: { color?: string; size?: number }) {
  const { color = '#2D2012', size = 26 } = props;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <Path d="M3 11l9-7 9 7" />
      <Path d="M5.5 9.5V20h5v-6h3v6h5V9.5" />
    </Svg>
  );
}

export default JobsIcon;
