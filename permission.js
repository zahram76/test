
import {PermissionsAndroid } from "react-native";

export async function requestPermission() {
    try {
      const granted = await PermissionsAndroid.requestMultiple(
        [PermissionsAndroid.PERMISSIONS.SEND_SMS,
        PermissionsAndroid.PERMISSIONS.READ_SMS,
        PermissionsAndroid.PERMISSIONS.RECEIVE_SMS,
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION] ,
        PermissionsAndroid.PERMISSIONS.NOTIFICATIONS,
        {
          title: 'App',
          message:
            'App needs access to your SMS and read your loacation',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('granted');
      } else {
        console.log('not granted');
      }
    } catch (err) {
      console.warn(err);
    }
  };
  