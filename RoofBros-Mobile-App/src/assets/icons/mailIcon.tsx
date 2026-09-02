import * as React from 'react';
import Svg, { Rect, Path } from 'react-native-svg';
import { colors } from '../../themes/colors';

function MailIcon(props: any) {
  const { color = colors.muted, stroke = color, size = 22 } = props;
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
      <Rect x="3" y="5" width="18" height="14" rx="2" />
      <Path d="M3 7.5l9 6 9-6" />
    </Svg>
  );
}

export default MailIcon;
