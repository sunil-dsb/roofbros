import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

import { SvgProps } from 'react-native-svg';

interface CheckIconProps extends SvgProps {
  color?: string;
  size?: number;
}

function CheckIcon({ color = 'currentColor', size = 24, ...props }: CheckIconProps) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      {...props}
    >
      <Path
        d="M4 12.5l5.5 5.5L20 6.5"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export default CheckIcon;
