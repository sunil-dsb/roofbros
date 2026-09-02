import * as React from 'react';
import Svg, { Line } from 'react-native-svg';

function CloseIcon(props: any) {
  const { color, stroke = color || 'currentColor', size = 24 } = props;
  return (
    <Svg
      viewBox="0 0 24 24"
      fill="none"
      stroke={stroke}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      width={size}
      height={size}
      {...props}
    >
      <Line x1={5} y1={5} x2={19} y2={19} />
      <Line x1={19} y1={5} x2={5} y2={19} />
    </Svg>
  );
}

export default CloseIcon;
