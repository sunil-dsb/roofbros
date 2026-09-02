import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

function HomeIcon(props: any) {
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
      <Path d="M3 11l9-7 9 7" />
      <Path d="M5.5 9.5V20h5v-6h3v6h5V9.5" />
    </Svg>
  );
}

export default HomeIcon;
