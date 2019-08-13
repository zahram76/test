import React, { Component } from 'react';
import {Alert, AppState, StyleSheet, View, Text, PermissionsAndroid, Platform, AppRegistry} from "react-native";
import BackgroundGeolocation from 'react-native-mauron85-background-geolocation';
import SmsAndroid  from 'react-native-get-sms-android';
import Geolocation from 'react-native-geolocation-service';
import RNAndroidLocationEnabler from 'react-native-android-location-enabler';

const LATITUDE =  0;
const LONGITUDE = 0;

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


class BgTracking extends Component {
  constructor(){
    super();
    this.state = {
      message: '',
      coordinates: {
         latitude: 0,
         longitude: 0
       },
       timer: null,
       timerForReadLocation: 1000,
    };
  }

  render() {
    return (
        <View style={styles.container}>
            <Text style={styles.welcome}> message : {this.state.message} </Text>
            <Text style={styles.welcome}> latitude : {this.state.coordinates.latitude} </Text>
            <Text style={styles.welcome}> longitude : {this.state.coordinates.longitude} </Text>
        </View>
    );
  }

  geolocationWatcher(){
    this.watchID = Geolocation.watchPosition(
      position => {
        var lat = parseFloat(position.coords.latitude);
        var long = parseFloat(position.coords.longitude);
        let marker = {...this.state.markers, coordinates:{latitude:lat,longitude:long}};
        this.setState({markers: marker});
        this.sendsms(lat,long);
      },
      error => alert(error),
      {enableHighAccuracy: true, timeout: 2000, maximumAge: 1000, distanceFilter: 0.1}
    );
  }

  sendsms(lat,long){
    phoneNumber = '+989336812618';
    message = 'hello long:' + long + ' lat:' + lat;
    this.setState({message : message});
    SmsAndroid.autoSend(phoneNumber, message, (fail) => {
        console.log("Failed with this error: " + fail)
    }, (success) => {
        console.log("SMS sent successfully" + success);
    });
  }

  getCurrentLocation_func = () => {
    RNAndroidLocationEnabler.promptForEnableLocationIfNeeded({interval: 10000, fastInterval: 5000})
    .then(data => {
      this.state.timerForReadLocation = 1000;
    }).catch(err => {
      this.state.timerForReadLocation = 20000;
      console.log(this.state.timerForReadLocation)
      //alert('please enable location.'); 
    });
    BackgroundGeolocation.getCurrentLocation(location => {
      let coordinates = {...this.state.coordinates,
        latitude: location.latitude, longitude:location.longitude};
      if (coordinates.latitude == this.state.coordinates.latitude
         && coordinates.longitude == this.state.coordinates.longitude){
        console.log("repeat");
      }
      else {
        console.log("nonreapeated");
        this.setState({coordinates});
        console.log("Location");
        console.log(location.latitude);
        console.log(location.longitude)
       // this.sendsms(location.latitude,location.longitude);
      }
      // this.setState({coordinates});
      // this.sendsms(location.latitude,location.longitude);

      //this.sendsms(location.latitude,location.longitude);
     })
  }

  async componentDidMount() {
    await requestPermission();
    RNAndroidLocationEnabler.promptForEnableLocationIfNeeded({interval: 10000, fastInterval: 5000})
    .then(data => {
      this.geolocationWatcher();
      BackgroundGeolocation.start();
      this.BackgroundGeolocationConfig();

      let timer = setInterval(this.getCurrentLocation_func, this.state.timerForReadLocation);
      this.setState({timer}); 

    }).catch(err => {
     // alert('please enable location.'); 
    });
    
  }

  componentWillUnmount() {
    // unregister all event listeners
   // Geolocation.clearWatch(this.watchID);;
    //BackgroundGeolocation.removeAllListeners();
  }

  BackgroundGeolocationConfig(){
    BackgroundGeolocation.configure({
      desiredAccuracy: BackgroundGeolocation.HIGH_ACCURACY,
      stationaryRadius: 1,
      distanceFilter: 0.5,
      notificationsEnabled: true,
      notificationTitle: 'Background tracking',
      notificationText: 'enabled',
      debug: true,
      startOnBoot: false,
      locationProvider: BackgroundGeolocation.ACTIVITY_PROVIDER,
      interval: 3000,
      fastestInterval: 3000,
      activitiesInterval: 3000,
      stopOnStillActivity: false,
      stopOnTerminate: false,
    });

    // BackgroundGeolocation.getCurrentLocation( (location) =>{
    //   let coordinates = {...this.state.coordinates,
    //     latitude: location.latitude, longitude: location.longitude};
    //   this.setState({coordinates});
    //   console.log("current location");
    //   console.log(location.latitude);
    //   console.log(location.longitude);
    //  // this.sendsms(location.latitude,location.longitude);
    // });

    // BackgroundGeolocation.on('location', (location) => {

    //   // handle your locations here
    //   // to perform long running operation on iOS
    //   // you need to create background task
    //    BackgroundGeolocation.startTask(taskKey => {
    //     // execute long running task
    //     let coordinates = {...this.state.coordinates,
    //       latitude: location.latitude, longitude:location.longitude};
    //     if (coordinates.latitude == this.state.coordinates.latitude
    //        && coordinates.longitude == this.state.coordinates.longitude){
    //       console.log("repeat");
    //     }
    //     else {
    //       console.log("nonreapeated");
    //       this.setState({coordinates});
    //      // this.sendsms(location.latitude,location.longitude);
    //     }
    //     // this.setState({coordinates});
    //     // this.sendsms(location.latitude,location.longitude);
    //     console.log("Location");
    //     console.log(location.latitude);
    //     console.log(location.longitude);
    //     // eg. ajax post location
    //     // IMPORTANT: task has to be ended by endTask
    //     //BackgroundGeolocation.endTask(taskKey);
    //   });
    //});

    BackgroundGeolocation.on('stationary', (stationaryLocation) => {
      // handle stationary locations here
      let coordinates = {...this.state.coordinates,
        latitude: stationaryLocation.latitude, longitude: stationaryLocation.longitude};
      this.setState({coordinates});
      console.log("stationaryLocation");
      console.log(stationaryLocation.latitude);
      console.log(stationaryLocation.longitude);
      //alert("stationary location");
    });

    BackgroundGeolocation.on('error', (error) => {
      console.log('[ERROR] BackgroundGeolocation error:', error);
    });

    BackgroundGeolocation.on('start', () => {
      console.log('[INFO] BackgroundGeolocation service has been started');
    });

    BackgroundGeolocation.on('stop', () => {
      console.log('[INFO] BackgroundGeolocation service has been stopped');
    });

    BackgroundGeolocation.on('authorization', (status) => {
      console.log('[INFO] BackgroundGeolocation authorization status: ' + status);
      if (status !== BackgroundGeolocation.AUTHORIZED) {
        // we need to set delay or otherwise alert may not be shown
        setTimeout(() =>
          Alert.alert('App requires location tracking permission', 'Would you like to open app settings?', [
            { text: 'Yes', onPress: () => BackgroundGeolocation.showAppSettings() },
            { text: 'No', onPress: () => console.log('No Pressed'), style: 'cancel' }
          ]), 1000);
      }
    });

    BackgroundGeolocation.on('background', (location) => {
      console.log('[INFO] App is in background');
      // this.sendsms(location.latitude,location.longitude);
      // console.log("Location");
      // console.log(location.latitude);
      // console.log(location.longitude);
    });

    BackgroundGeolocation.on('foreground', () => {
      console.log('[INFO] App is in foreground');
      // console.log("Location");
      // console.log(location.latitude);
      // console.log(location.longitude);
    });

    BackgroundGeolocation.on('abort_requested', () => {
      console.log('[INFO] Server responded with 285 Updates Not Required');

      // Here we can decide whether we want stop the updates or not.
      // If you've configured the server to return 285, then it means the server does not require further update.
      // So the normal thing to do here would be to `BackgroundGeolocation.stop()`.
      // But you might be counting on it to receive location updates in the UI, so you could just reconfigure and set `url` to null.
    });

    BackgroundGeolocation.on('http_authorization', () => {
      console.log('[INFO] App needs to authorize the http requests');
    });

    BackgroundGeolocation.checkStatus(status => {
      console.log('[INFO] BackgroundGeolocation service is running', status.isRunning);
      console.log('[INFO] BackgroundGeolocation services enabled', status.locationServicesEnabled);
      console.log('[INFO] BackgroundGeolocation auth status: ' + status.authorization);

      // you don't need to check status before start (this is just the example)
      // if (!status.isRunning) {
      //   BackgroundGeolocation.start(); //triggers start on start event
      // }
    });

    // you can also just start without checking for status
    
  }
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  box: {
    flex: 0.2,
    width: '100%',
    height: '100%'
  },
  welcome: {
    fontSize: 20,
    color: 'blue',
    textAlign: 'center',
    margin: 10,
    marginBottom: 10,
  },
  map: {
    flex: 0.8,
    width: '100%',
    height: '100%',
  }
});

export default BgTracking;
AppRegistry.registerComponent('test', () => App)