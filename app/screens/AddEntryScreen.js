import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';
import Toast from 'react-native-toast-message';

const STORAGE_KEY = '@blood_sugar_entries';

export default function AddEntryScreen({ navigation }) {
  const [value, setValue] = useState('');
  const [note, setNote] = useState('');

  const saveEntry = async () => {
    const num = parseFloat(value);
    if (isNaN(num) || num <= 0) return Alert.alert('Invalid Input', 'Enter 50-500 mg/dL');
    if (num < 50 || num > 500) return Alert.alert('Unrealistic Value', 'Value must be 50-500 mg/dL');

    const newEntry = { id: uuidv4(), value: num, note: note.trim(), date: new Date().toISOString() };

    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      const oldEntries = raw ? JSON.parse(raw) : [];
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([newEntry, ...oldEntries]));
      Toast.show({ type: 'success', text1: 'Saved!', text2: 'Blood sugar entry added.' });
      setValue(''); setNote(''); navigation.goBack();
    } catch (err) { Alert.alert('Error', 'Failed to save entry'); }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Add Blood Sugar Entry</Text>
      <TextInput style={styles.input} placeholder="Blood Sugar (mg/dL)" keyboardType="numeric" value={value} onChangeText={setValue} />
      <TextInput style={styles.input} placeholder="Optional note" value={note} onChangeText={setNote} />
      <TouchableOpacity style={styles.button} onPress={saveEntry}>
        <Text style={styles.buttonText}>Save Entry</Text>
      </TouchableOpacity>
      <Toast />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', backgroundColor: '#F9F9F9' },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#6C47FF', textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 10, padding: 12, marginBottom: 16, fontSize: 16 },
  button: { backgroundColor: '#6C47FF', padding: 15, borderRadius: 12, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
});
