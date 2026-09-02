import * as React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';

function SearchIcon(props: { color?: string; size?: number; [key: string]: any }) {
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
      <Circle cx="11" cy="11" r="7" />
      <Path d="M16.5 16.5L21 21" />
    </Svg>
  );
}

export default SearchIcon;
