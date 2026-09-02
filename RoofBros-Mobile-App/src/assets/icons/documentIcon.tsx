import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

function DocumentIcon(props: { color?: string; size?: number; [key: string]: any }) {
  const { color = 'currentColor', size = 20 } = props;
  return (
    <Svg
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      width={size}
      height={size}
      {...props}
    >
      <Path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <Path d="M14 2v6h6" />
    </Svg>
  );
}

export default DocumentIcon;
