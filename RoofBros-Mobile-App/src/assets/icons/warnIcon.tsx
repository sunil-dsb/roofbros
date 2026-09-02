import * as React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';

function WarnIcon(props: { color?: string; size?: number; [key: string]: any }) {
  const { color = 'currentColor', size = 24 } = props;
  return (
    <Svg
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      width={size}
      height={size}
      {...props}
    >
      <Path d="M12 3.5l9.5 16.5H2.5z" />
      <Path d="M12 9.5v4.5" />
      <Circle cx="12" cy="17" r="1" fill={color} stroke="none" />
    </Svg>
  );
}

export default WarnIcon;
