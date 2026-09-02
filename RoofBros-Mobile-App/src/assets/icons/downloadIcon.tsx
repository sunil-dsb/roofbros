import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

function DownloadIcon(props: { color?: string; size?: number; [key: string]: any }) {
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
      <Path d="M12 4v12" />
      <Path d="M8 12l4 4 4-4" />
      <Path d="M4 20h16" />
    </Svg>
  );
}

export default DownloadIcon;
