import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@blood_sugar_entries';
const screenWidth = Dimensions.get('window').width - 40;

export default function StatsScreen() {
  const [entries, setEntries] = useState([]);
  const [period, setPeriod] = useState('week'); // 'week' or 'month'

  useEffect(() => {
    const fetchData = async () => {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      const data = raw ? JSON.parse(raw) : [];
      setEntries(data.sort((a, b) => new Date(a.date) - new Date(b.date)));
    };
    fetchData();
  }, []);

  const getChartData = () => {
    const filtered = entries.filter(e => {
      const date = new Date(e.date);
      const now = new Date();
      if (period === 'week') return date >= new Date(now.setDate(now.getDate() - 7));
      else return date >= new Date(now.setMonth(now.getMonth() - 1));
    });
    return {
      labels: filtered.map(e => e.date.slice(5, 10)),
      datasets: [{ data: filtered.map(e => e.value) }],
    };
  };

  return (
    <View style={styles.container}>
      <View style={styles.periodSelector}>
        <TouchableOpacity onPress={() => setPeriod('week')}>
          <Text style={[styles.periodText, period === 'week' && styles.activePeriod]}>Week</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setPeriod('month')}>
          <Text style={[styles.periodText, period === 'month' && styles.activePeriod]}>Month</Text>
        </TouchableOpacity>
      </View>

      {entries.length === 0 ? (
        <Text style={{ textAlign: 'center', marginTop: 20 }}>No data to display.</Text>
      ) : (
        <BarChart
          data={getChartData()}
          width={screenWidth}
          height={220}
          yAxisSuffix=" mg/dL"
          fromZero
          showValuesOnTopOfBars
          chartConfig={{
            backgroundColor: '#fff',
            backgroundGradientFrom: '#fff',
            backgroundGradientTo: '#fff',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(108,71,255,${opacity})`,
            labelColor: (opacity = 1) => `rgba(0,0,0,${opacity})`,
            style: { borderRadius: 16 },
          }}
          style={{ borderRadius: 16, marginTop: 20 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  periodSelector: { flexDirection: 'row', justifyContent: 'center', marginBottom: 10 },
  periodText: { fontSize: 16, color: '#666', marginHorizontal: 20 },
  activePeriod: { color: '#6C47FF', fontWeight: 'bold', fontSize: 18 },
});
