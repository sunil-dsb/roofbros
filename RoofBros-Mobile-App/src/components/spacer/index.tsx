import React from 'react';
import { View, DimensionValue } from 'react-native';

interface SpacerProps {
  height?: DimensionValue;
  width?: DimensionValue;
  background?: string;
  flex?: number;
}

const Spacer = ({ height = 10, width = '100%', background, flex }: SpacerProps) => {
  return (
    <View
      style={{
        height: height as any,
        width: width,
        backgroundColor: background,
        flex: flex,
      }}
    />
  );
};

export default Spacer;
