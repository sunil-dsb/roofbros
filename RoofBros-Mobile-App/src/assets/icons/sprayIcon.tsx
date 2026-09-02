import * as React from 'react';
import Svg, { Path, Rect } from 'react-native-svg';

function SprayIcon(props: any) {
  return (
    <Svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      width={props.size || 24}
      height={props.size || 24}
      {...props}
    >
      <Rect x="2" y="6" width="16" height="6" rx="2" />
      <Path d="M8 12v4" />
      <Rect x="5" y="16" width="6" height="5" rx="1" />
    </Svg>
  );
}

export default SprayIcon;

