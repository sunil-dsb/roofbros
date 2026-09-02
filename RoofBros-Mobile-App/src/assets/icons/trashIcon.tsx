import * as React from "react";
import Svg, { Path } from "react-native-svg";

function TrashIcon(props: any) {
  return (
    <Svg
      width={props?.size || 24}
      height={props?.size || 24}
      viewBox="0 0 24 24"
      fill="none"
      stroke={props?.color || "black"}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <Path d="M4 7h16" />
      <Path d="M10 4h4" />
      <Path d="M6 7v13h12V7" />
      <Path d="M10 11v5" />
      <Path d="M14 11v5" />
    </Svg>
  );
}

export default TrashIcon;
