import * as React from 'react';
import Svg, { Rect } from 'react-native-svg';

function GridIcon(props: any) {
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
      <Rect x="3" y="3" width="8" height="8" rx="1.5" />
      <Rect x="13" y="3" width="8" height="8" rx="1.5" />
      <Rect x="3" y="13" width="8" height="8" rx="1.5" />
      <Rect x="13" y="13" width="8" height="8" rx="1.5" />
    </Svg>
  );
}

export default GridIcon;

