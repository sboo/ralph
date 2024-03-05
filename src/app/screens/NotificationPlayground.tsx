import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import notifee from '@notifee/react-native';

const NotificationPlayground: React.FC = () => {
  async function onDisplayNotification() {
    const channelId = await notifee.createChannel({
      id: 'default',
      name: 'Default Channel',
    });
    // Required for iOS
    // See https://notifee.app/react-native/docs/ios/permissions
    await notifee.requestPermission();

    await notifee.displayNotification({
      id: '1234',
      title: `<p style="color: white;"><b>John  sent a message</span></p></b></p>`,
      body: 'Hey there! 🌟',
      android: {
        channelId,
        color: '#6495ed',
        timestamp: Date.now() - 800, // 8 minutes ago
        showTimestamp: true,
      },
    });
  }
  // Clearing notification
  const onClearNotification = () => {
    notifee.cancelNotification('1234');
  };

  return (
    <View style={styles.body}>
      <TouchableOpacity style={styles.button} onPress={onDisplayNotification}>
        <Text style={styles.btn_text}>Create</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, {backgroundColor: 'red'}]}
        onPress={onClearNotification}>
        <Text style={styles.btn_text}>Clear</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  body: {
    flex: 1,
    backgroundColor: 'black',
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    width: '100%',
    backgroundColor: 'cornflowerblue',
    margin: 20,
    padding: 20,
  },
  btn_text: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 27,
    textAlign: 'center',
  },
});

export default NotificationPlayground;
