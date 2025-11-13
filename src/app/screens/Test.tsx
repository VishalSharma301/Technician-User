import React, { useRef } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import BottomSheet from '@gorhom/bottom-sheet';

export default function TestBottomSheet() {
  const bottomSheetRef = useRef<BottomSheet>(null);

  const openSheet = () => {
    bottomSheetRef.current?.expand();   // easiest API
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f2f2f2' }}>
      <TouchableOpacity
        onPress={openSheet}
        style={{ backgroundColor: '#007AFF', padding: 14, borderRadius: 10 }}
      >
        <Text style={{ color: '#fff', fontWeight: '600' }}>Open Bottom Sheet</Text>
      </TouchableOpacity>

      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={['40%']}
        enablePanDownToClose
        backgroundStyle={{ backgroundColor: '#fff', borderRadius: 24 }}
      >
        <View style={{ padding: 20 }}>
          <Text style={{ fontSize: 18, fontWeight: '600' }}>It works 🎉</Text>
        </View>
      </BottomSheet>
    </View>
  );
}
