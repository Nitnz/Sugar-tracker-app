import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TextInput, StyleSheet } from 'react-native';
import { Swipeable, GestureHandlerRootView } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@blood_sugar_entries';

export default function HistoryScreen() {
  const [entries, setEntries] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      const data = raw ? JSON.parse(raw) : [];
      setEntries(data.sort((a, b) => new Date(b.date) - new Date(a.date)));
    };
    fetchData();
  }, []);

  const handleDelete = (id) => {
    const filtered = entries.filter(e => e.id !== id);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    setEntries(filtered);
  };

  const filteredEntries = entries.filter(e =>
    e.note?.toLowerCase().includes(search.toLowerCase()) ||
    e.value.toString().includes(search)
  );

  const renderItem = ({ item }) => (
    <Swipeable renderRightActions={() => (
      <View style={styles.deleteBtn}>
        <Text style={{ color: 'white', padding: 15 }} onPress={() => handleDelete(item.id)}>Delete</Text>
      </View>
    )}>
      <View style={styles.entryCard}>
        <Text style={styles.value}>{item.value} mg/dL</Text>
        {item.note ? <Text style={styles.note}>{item.note}</Text> : null}
        <Text style={styles.date}>{new Date(item.date).toLocaleString()}</Text>
      </View>
    </Swipeable>
  );

  return (
    <GestureHandlerRootView style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search entries..."
        value={search}
        onChangeText={setSearch}
      />
      <FlatList
        data={filteredEntries}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 20 }}>No entries found.</Text>}
      />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  searchInput: { borderWidth: 1, borderColor: '#ccc', borderRadius: 10, padding: 12, marginBottom: 15 },
  entryCard: { padding: 15, borderRadius: 12, backgroundColor: '#f5f5f5', marginBottom: 10 },
  value: { fontSize: 18, fontWeight: 'bold' },
  note: { fontStyle: 'italic', marginTop: 2 },
  date: { color: '#666', marginTop: 5 },
  deleteBtn: { backgroundColor: '#FF3B30', borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
});
