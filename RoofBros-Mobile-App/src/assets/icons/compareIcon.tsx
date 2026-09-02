import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

function CompareIcon(props: any) {
  return (
    <Svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      width={props?.size || 24}
      height={props?.size || 24}
      {...props}
    >
      <Path d="M16 3l4 4-4 4" />
      <Path d="M20 7H7" />
      <Path d="M8 13l-4 4 4 4" />
      <Path d="M4 17h13" />
    </Svg>
  );
}

export default CompareIcon;
