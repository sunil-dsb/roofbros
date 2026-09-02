import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

function PlusIcon(props: { color?: string; size?: number }) {
  const { color = '#2D2012', size = 26 } = props;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <Path d="M12 5v14M5 12h14" />
    </Svg>
  );
}

export default PlusIcon;
