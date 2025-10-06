import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Dimensions, Alert, Modal, Platform, Button, useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import { Swipeable, GestureHandlerRootView } from 'react-native-gesture-handler';
import * as Notifications from 'expo-notifications';
import DateTimePicker from '@react-native-community/datetimepicker';
// import { dailyTips } from '../assets/dailyTips.js';

const STORAGE_KEY = '@blood_sugar_entries';
const screenWidth = Dimensions.get('window').width - 40;

export default function HomeScreen({ navigation }) {
  const scheme = useColorScheme();
  const [entries, setEntries] = useState([]);
  const [dailyTip, setDailyTip] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [reminderTime, setReminderTime] = useState(new Date());

  // Load entries & tip
  useEffect(() => {
    const fetchData = async () => {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      const data = raw ? JSON.parse(raw) : [];
      setEntries(data.sort((a, b) => new Date(b.date) - new Date(a.date)));
      // setDailyTip(dailyTips[new Date().getDate() % dailyTips.length]);
    };
    fetchData();
  }, []);

  // Setup notifications (native only)
  useEffect(() => {
    if (Platform.OS !== 'web') {
      registerForPushNotificationsAsync();
      scheduleDailyNotification(reminderTime);
    }
  }, [reminderTime]);

  const deleteEntry = (id) => {
    const filtered = entries.filter(e => e.id !== id);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    setEntries(filtered);
  };

  const latestValue = entries[0]?.value || 0;

  const getMeterColor = (value) => {
    if (value < 70) return '#FFA500';
    if (value <= 140) return '#4CAF50';
    if (value <= 180) return '#FFEB3B';
    return '#F44336';
  };

  const renderEntry = ({ item }) => (
    <Swipeable renderRightActions={() => (
      <TouchableOpacity onPress={() => deleteEntry(item.id)} style={styles.deleteBtn}>
        <Text style={{ color: 'white', padding: 15 }}>Delete</Text>
      </TouchableOpacity>
    )}>
      <View style={[styles.entryCard, { backgroundColor: scheme === 'dark' ? '#2E2E2E' : '#f5f5f5' }]}>
        <Text style={[styles.entryValue, { color: scheme === 'dark' ? '#fff' : '#333' }]}>{item.value} mg/dL</Text>
        {item.note ? <Text style={[styles.entryNote, { color: scheme === 'dark' ? '#ccc' : '#555' }]}>{item.note}</Text> : null}
        <Text style={[styles.entryDate, { color: scheme === 'dark' ? '#aaa' : '#666' }]}>{new Date(item.date).toLocaleString()}</Text>
      </View>
    </Swipeable>
  );

  return (
    <GestureHandlerRootView style={[styles.container, { backgroundColor: scheme === 'dark' ? '#121212' : '#fff' }]}>
      {/* Blood Sugar Meter */}
      <View style={styles.meterContainer}>
        <AnimatedCircularProgress
          size={150}
          width={15}
          fill={(latestValue / 300) * 100}
          tintColor={getMeterColor(latestValue)}
          backgroundColor={scheme === 'dark' ? '#333' : '#eee'}
          rotation={0}
          lineCap="round"
        >
          {() => (
            <View style={styles.meterInner}>
              <Text style={[styles.meterValue, { color: scheme === 'dark' ? '#fff' : '#333' }]}>{latestValue}</Text>
              <Text style={[styles.mgText, { color: scheme === 'dark' ? '#fff' : '#333' }]}>mg/dL</Text>
            </View>
          )}
        </AnimatedCircularProgress>
      </View>

      {/* Daily Tip */}
      <View style={[styles.tipCard, { backgroundColor: '#6C47FF' }]}>
        <Text style={styles.tipText}>{dailyTip}</Text>
      </View>

      {/* Recent Entries */}
      <FlatList
        data={entries}
        keyExtractor={item => item.id}
        renderItem={renderEntry}
        ListHeaderComponent={<Text style={[styles.listHeader, { color: scheme === 'dark' ? '#fff' : '#333' }]}>Recent Entries</Text>}
      />

      {/* Add Entry Button */}
      <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('Add Entry')}>
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>

      {/* Settings Button */}
      <TouchableOpacity style={styles.settingsButton} onPress={() => setModalVisible(true)}>
        <Text style={{ color: '#fff', fontSize: 18 }}>⚙</Text>
      </TouchableOpacity>

      {/* Settings Modal */}
      <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Reminder Settings</Text>
            <Text>Pick daily reminder time:</Text>
            <DateTimePicker
              value={reminderTime}
              mode="time"
              is24Hour={true}
              display="spinner"
              onChange={(event, selectedTime) => selectedTime && setReminderTime(selectedTime)}
            />
            <View style={{ marginTop: 20 }}>
              <Button title="Close" onPress={() => setModalVisible(false)} />
            </View>
          </View>
        </View>
      </Modal>
    </GestureHandlerRootView>
  );
}

// Notifications (native only)
async function registerForPushNotificationsAsync() {
  if (Platform.OS === 'web') return;
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') Alert.alert('Enable notifications to get reminders.');
}

async function scheduleDailyNotification(time) {
  if (Platform.OS === 'web') return;

  await Notifications.cancelAllScheduledNotificationsAsync();

  const trigger = new Date();
  trigger.setHours(time.getHours());
  trigger.setMinutes(time.getMinutes());
  trigger.setSeconds(0);
  if (new Date() > trigger) trigger.setDate(trigger.getDate() + 1);

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Blood Sugar Reminder',
      body: 'Time to check your blood sugar and log it!',
    },
    trigger: { hour: time.getHours(), minute: time.getMinutes(), repeats: true },
  });
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  meterContainer: { alignItems: 'center', marginBottom: 20 },
  meterInner: { justifyContent: 'center', alignItems: 'center' },
  meterValue: { fontSize: 32, fontWeight: 'bold' },
  mgText: { fontSize: 16 },
  tipCard: { padding: 15, borderRadius: 12, marginBottom: 20 },
  tipText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  listHeader: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  entryCard: { padding: 15, borderRadius: 12, marginBottom: 10 },
  entryValue: { fontSize: 18, fontWeight: 'bold' },
  entryNote: { fontStyle: 'italic', marginTop: 2 },
  entryDate: { marginTop: 5 },
  deleteBtn: { backgroundColor: '#FF3B30', borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  addButton: { position: 'absolute', bottom: 20, right: 20, backgroundColor: '#6C47FF', width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center' },
  addButtonText: { color: '#fff', fontSize: 30 },
  settingsButton: { position: 'absolute', top: 40, right: 20, backgroundColor: '#6C47FF', width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center' },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { width: 300, backgroundColor: '#fff', borderRadius: 12, padding: 20, alignItems: 'center' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
});
