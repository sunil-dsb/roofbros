import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

function PinIcon(props: { size?: number; color?: string; [key: string]: any }) {
  const { size = 32, color = '#7D1017' } = props;

  return (
    <Svg
      width={size}
      height={(size * 40) / 32} // Maintains 32x40 aspect ratio
      viewBox="0 0 24 24"
      fill="none"
      {...props}
    >
      <Path
        d="M12 21s-7-5.8-7-11a7 7 0 0 1 14 0c0 5.2-7 11-7 11z"
        fill={color}
        stroke="#FFFFFF"
        strokeWidth={1.3}
      />
    </Svg>
  );
}

export default PinIcon;
