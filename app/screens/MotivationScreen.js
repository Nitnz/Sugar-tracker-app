import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Dimensions } from 'react-native';
// import { dailyTips } from '../assets/dailyTips';

const screenWidth = Dimensions.get('window').width;

export default function MotivationScreen() {
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      // setTipIndex((prev) => (prev + 1) % dailyTips.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <View style={styles.container}>
      <FlatList
        // data={[dailyTips[tipIndex]]}
        keyExtractor={(item, index) => index.toString()}
        horizontal
        pagingEnabled
        renderItem={({ item }) => (
          <View style={styles.tipCard}>
            <Text style={styles.tipText}>{item}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  tipCard: { width: screenWidth - 40, padding: 20, borderRadius: 16, backgroundColor: '#6C47FF', justifyContent: 'center', alignItems: 'center' },
  tipText: { color: '#fff', fontSize: 18, fontWeight: 'bold', textAlign: 'center' },
});
