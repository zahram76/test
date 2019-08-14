import React, { Component } from 'react';
import {Alert, AppState, StyleSheet, View, Text, PermissionsAndroid, Platform, AppRegistry} from "react-native";
import BackgroundGeolocation from 'react-native-mauron85-background-geolocation';
import SmsAndroid  from 'react-native-get-sms-android';
import Geolocation from 'react-native-geolocation-service';
import RNAndroidLocationEnabler from 'react-native-android-location-enabler';
import runKalmanOnLocations from "./kalman";
// import _ from "lodash"; // 4.17.5
// import { _calculateGreatCircleDistance } from "./locationHelpers";

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
       LocationArray:[],
       timer: null,
       timerForReadLocation: 10,
       kalmanConstant: 3,
       kalmanSolution: null,
    };
    
  }

  render() {
    return (
        <View style={styles.container}>
            <Text style={styles.welcome}> message : {this.state.message} </Text>
            <Text style={styles.welcome}> latitude : {this.state.coordinates.latitude} </Text>
            <Text style={styles.welcome}> longitude : {this.state.coordinates.longitude} </Text>
            <Text style={styles.welcome}> kalman data : {JSON.stringify(this.state.kalmanSolution)} </Text>
        </View>
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

//    kalman = (location, lastLocation, constant) => {
//     const accuracy = Math.max(location.accuracy, 1);
//     const result = { ...location, ...lastLocation };
  
//     if (!lastLocation) {
//       result.variance = accuracy * accuracy;
//     } else {
//       const timestampInc =
//         location.time.getTime() - lastLocation.time.getTime();
  
//       if (timestampInc > 0) {
//         // We can tune the velocity and particularly the coefficient at the end
//         const velocity =
//           _calculateGreatCircleDistance(location, lastLocation) /
//           timestampInc *
//           constant;
//         result.variance += timestampInc * velocity * velocity / 1000;
//       }
  
//       const k = result.variance / (result.variance + accuracy * accuracy);
//       result.latitude += k * (location.latitude - lastLocation.latitude);
//       result.longitude += k * (location.longitude - lastLocation.longitude);
//       result.variance = (1 - k) * result.variance;
//     }
  
//     return {
//       ...location,
//       ..._.pick(result, ["latitude", "longitude", "variance"])
//     };
//   }

//  runKalmanOnLocations = (rawData, kalmanConstant) => {
//   let lastLocation;
//   //console.log('rowdata\n' + JSON.stringify(rawData))
//   rawData
//   .map(location => ({
//     ...location,
//     time: new Date(location.timestamp)
//   }))
//   .map(location => {
//     lastLocation = this.kalman(
//       location,
//       lastLocation,
//       kalmanConstant
//     );    
//     console.log('last loc \n' + JSON.stringify(lastLocation))
//     return JSON.stringify(lastLocation);
//   });
// }
  beforeCallKalman(){
    if (this.state.LocationArray.length == 20){
      // var variance = () => {
      //   var latitudeSum = 0;
      //   var longitudSum = 0; 
      //   for(i=0; i<this.state.LocationArray.length; ++i){
      //     latitudeSum += this.state.LocationArray[i].latitude;
      //     longitudSum += this.state.LocationArray[i].longitude;
      //   }
      //   var latitudeAvg = latitudeSum/this.state.LocationArray.length;
      //   var longitudeAvg = longitudSum/this.state.LocationArray.length;
        
      //   for(i=0; i<this.state.LocationArray.length; ++i){
      //     latitudeSum += power((this.state.LocationArray[i].latitude-latitudeAvg),2);
      //     longitudSum += power((this.state.LocationArray[i].longitude-longitudeAvg),2);
      //   }
      //   var latitudeVariance = sqrt(latitudeSum/this.state.LocationArray.length);
      //   var longitudeVariance = sqrt(longitudSum/this.state.LocationArray.length);
      //   var latitudeX = latitudeAvg - 2*latitudeVariance;
      //   var longitudX = longitudeAvg - 2*longitudeVariance;
      //   for(i=0; i<this.state.LocationArray.length; ++i){
      //     if(this.state.LocationArray[i].latitude > latitudeX || 
      //         this.state.LocationArray[i].longitude > longitudX){
      //           var array = [...this.state.LocationArray]; // make a separate copy of the array
      //           var index = i
      //           if (index !== -1) {
      //             array.splice(index, 1);
      //             this.setState({LocationArray: array});
      //       }
      //     }
      //   }
      // }
      if(this.state.LocationArray.length > 0){
        const kalmanSolution = JSON.stringify(runKalmanOnLocations(this.state.LocationArray, this.state.kalmanConstant));
        this.setState({kalmanSolution}) 
        var array = [...this.state.LocationArray]; // make a separate copy of the array
        var index = 0
        array.splice(index,1)
        this.setState({LocationArray : array});
        console.log(kalmanSolution + ' lllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllll\n' +
           this.state.LocationArray.length);
      }
    }
  }

  getCurrentLocation_func = () => {
    RNAndroidLocationEnabler.promptForEnableLocationIfNeeded({interval: 10000, fastInterval: 5000})
    .then(data => {
      this.state.timerForReadLocation = 10;
    }).catch(err => {
      this.state.timerForReadLocation = 10000;
    });
    BackgroundGeolocation.getCurrentLocation(location => {
      let coordinates = {...this.state.coordinates,
        latitude: location.latitude, longitude:location.longitude};
      if (coordinates.latitude == this.state.coordinates.latitude
         && coordinates.longitude == this.state.coordinates.longitude){
        console.log("repeat");
      }
      else {
        console.log("non-repeated Location by timer\n" + location.latitude + '\n' + location.longitude);
          this.setState({coordinates});
          this.state.LocationArray.push(location);
          this.beforeCallKalman();  
      }
     })
  }

  async componentDidMount() {
    await requestPermission();
    RNAndroidLocationEnabler.promptForEnableLocationIfNeeded({interval: 10000, fastInterval: 5000})
    .then(data => {
      BackgroundGeolocation.start();
      this.BackgroundGeolocationConfig();

      let timer = setInterval(this.getCurrentLocation_func, this.state.timerForReadLocation);
      this.setState({timer}); 

    }).catch(err => {
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
      stationaryRadius: 5,
      distanceFilter: 0.5,
      notificationsEnabled: true,
      notificationTitle: 'Background tracking',
      notificationText: 'enabled',
      debug: true,
      startOnBoot: false,
      locationProvider: BackgroundGeolocation.ACTIVITY_PROVIDER,
      interval: 200,
      fastestInterval: 100,
      activitiesInterval: 100,
      stopOnStillActivity: false,
      stopOnTerminate: false,
    });

    BackgroundGeolocation.getCurrentLocation( (location) =>{
      let coordinates = {...this.state.coordinates,
        latitude: location.latitude, longitude: location.longitude};
      this.setState({coordinates});

      console.log("Current Location\n" + location.latitude + '\n' + location.longitude);

      this.state.LocationArray.push(location);
      this.sendsms(location.latitude,location.longitude);
    });

    BackgroundGeolocation.on('location', (location) => {
       BackgroundGeolocation.startTask(taskKey => {
        let coordinates = {latitude: location.latitude, longitude:location.longitude};
        if (coordinates.latitude == this.state.coordinates.latitude
           && coordinates.longitude == this.state.coordinates.longitude){
          console.log("repeat");
        }
        else {
          this.setState({coordinates});
          console.log("non-repeated Location\n" + location.latitude + '\n' + location.longitude);
          this.sendsms(location.latitude,location.longitude);
        }
        this.state.LocationArray.push(location);
        this.beforeCallKalman();
        BackgroundGeolocation.endTask(taskKey);
      });
    });

    BackgroundGeolocation.on('stationary', (stationaryLocation) => {
      // handle stationary locations here
      let coordinates = {...this.state.coordinates,
        latitude: stationaryLocation.latitude, longitude: stationaryLocation.longitude};
      this.setState({coordinates});
      console.log("stationary Location\n" + stationaryLocation.latitude + '\n' + stationaryLocation.longitude);
      //alert("stationary location");
    }); 

   BackgroundGeolocation.on('background', (location) => {
      console.log('[INFO] App is in background');
    });

    BackgroundGeolocation.on('foreground', () => {
      console.log('[INFO] App is in foreground');
    });

    BackgroundGeolocation.on('abort_requested', () => {
      console.log('[INFO] Server responded with 285 Updates Not Required');

      // Here we can decide whether we want stop the updates or not.
      // If you've configured the server to return 285, then it means the server does not require further update.
      // So the normal thing to do here would be to `BackgroundGeolocation.stop()`.
      // But you might be counting on it to receive location updates in the UI, so you could just reconfigure and set `url` to null.
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
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    justifyContent: 'center',
    //alignItems: 'center',
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
    //textAlign: 'center',
    marginRight: 50,
    marginLeft: 50,
    marginTop: 10,
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


  

  //     BackgroundGeolocation.on('error', (error) => {
  //     console.log('[ERROR] BackgroundGeolocation error:', error);
  //   });

  //   BackgroundGeolocation.on('start', () => {
  //     console.log('[INFO] BackgroundGeolocation service has been started');
  //   });

  //   BackgroundGeolocation.on('stop', () => {
  //     console.log('[INFO] BackgroundGeolocation service has been stopped');
  //   });

  // BackgroundGeolocation.on('background', (location) => {
  //     console.log('[INFO] App is in background');
  //     // this.sendsms(location.latitude,location.longitude);
  //     // console.log("Location");
  //     // console.log(location.latitude);
  //     // console.log(location.longitude);
  //   });

  //   BackgroundGeolocation.on('foreground', () => {
  //     console.log('[INFO] App is in foreground');
  //     // console.log("Location");
  //     // console.log(location.latitude);
  //     // console.log(location.longitude);
  //   });

  //   BackgroundGeolocation.on('abort_requested', () => {
  //     console.log('[INFO] Server responded with 285 Updates Not Required');

  //     // Here we can decide whether we want stop the updates or not.
  //     // If you've configured the server to return 285, then it means the server does not require further update.
  //     // So the normal thing to do here would be to `BackgroundGeolocation.stop()`.
  //     // But you might be counting on it to receive location updates in the UI, so you could just reconfigure and set `url` to null.
  //   });

  //   BackgroundGeolocation.on('http_authorization', () => {
  //     console.log('[INFO] App needs to authorize the http requests');
  //   });

  //   BackgroundGeolocation.checkStatus(status => {
  //     console.log('[INFO] BackgroundGeolocation service is running', status.isRunning);
  //     console.log('[INFO] BackgroundGeolocation services enabled', status.locationServicesEnabled);
  //     console.log('[INFO] BackgroundGeolocation auth status: ' + status.authorization);

  //     // you don't need to check status before start (this is just the example)
  //     // if (!status.isRunning) {
  //     //   BackgroundGeolocation.start(); //triggers start on start event
  //     // }
  //   });

  //     BackgroundGeolocation.on('authorization', (status) => {
  // //     console.log('[INFO] BackgroundGeolocation authorization status: ' + status);
  // //     if (status !== BackgroundGeolocation.AUTHORIZED) {
  // //       // we need to set delay or otherwise alert may not be shown
  // //       setTimeout(() =>
  // //         Alert.alert('App requires location tracking permission', 'Would you like to open app settings?', [
  // //           { text: 'Yes', onPress: () => BackgroundGeolocation.showAppSettings() },
  // //           { text: 'No', onPress: () => console.log('No Pressed'), style: 'cancel' }
  // //         ]), 1000);
  // //     }
  // //   }); 