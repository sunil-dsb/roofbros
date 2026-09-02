import * as React from 'react';
import Svg, { Path, Circle, SvgProps } from 'react-native-svg';

interface CircleCheckIconProps extends SvgProps {
  color?: string;
  size?: number;
}

function CircleCheckIcon({ color = 'currentColor', size = 24, ...props }: CircleCheckIconProps) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      {...props}
    >
      <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" />
      <Path
        d="M8 12.5l3 3 5-6"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export default CircleCheckIcon;
