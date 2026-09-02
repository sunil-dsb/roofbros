import * as React from 'react';
import Svg, { Path, Line } from 'react-native-svg';

function ArrowRightIcon(props: any) {
  return (
    <Svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      width={24}
      height={24}
      {...props}
    >
      <Line x1={4} y1={12} x2={19} y2={12} />
      <Path d="M13 6l6 6-6 6" />
    </Svg>
  );
}

export default ArrowRightIcon;
