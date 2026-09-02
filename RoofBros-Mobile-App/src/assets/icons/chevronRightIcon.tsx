import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

function ChevronRightIcon(props: { color?: string; size?: number; [key: string]: any }) {
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
      <Path d="M9 18l6-6-6-6" />
    </Svg>
  );
}

export default ChevronRightIcon;
