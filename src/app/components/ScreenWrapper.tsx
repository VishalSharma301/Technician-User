import React, { ReactNode } from 'react';
import { ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Props = {
  children: ReactNode;
  style : ViewStyle
};

const ScreenWrapper = ({ children, style }: Props) => {
  return (
    <SafeAreaView style={[{ flex: 1 }, style]} edges={['top', 'left', 'right']}>
      {children}
    </SafeAreaView>
  );
};

export default ScreenWrapper;