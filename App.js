import React, { Component } from 'react';
import {Alert, Dimensions, StyleSheet, View, Text, PermissionsAndroid, Platform, AppRegistry} from "react-native";
import SwitchSelector from "react-native-switch-selector";
import BackgroundGeolocation from 'react-native-mauron85-background-geolocation';
import SmsAndroid  from 'react-native-get-sms-android';
import Geolocation from 'react-native-geolocation-service';
import RNAndroidLocationEnabler from 'react-native-android-location-enabler';
import runKalmanOnLocations from "./kalman";
import MapView, {Marker, AnimatedRegion, Polyline, Circle} from "react-native-maps";
import haversine from "haversine";
// import _ from "lodash"; // 4.17.5
// import { _calculateGreatCircleDistance } from "./locationHelpers";

const LATITUDE =  0;
const LONGITUDE = 0;
let { width, height } = Dimensions.get('window')
const ASPECT_RATIO = width / height
const LATITUDE_DELTA = 0.007 
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO
const options = [
  { label: "satellite", value: "satellite" },
  { label: "standard", value: "standard" },
  { label: "hybrid", value: "hybrid" }
];

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
       timerForReadLocation: 200,
       kalmanConstant: 10,
       kalmanSolution: null,

       latitude: LATITUDE,
       longitude: LONGITUDE,
       routeCoordinates: [],
       distanceTravelled: 0,
       prevLatLng: {},
       coordinate: new AnimatedRegion({
         latitude: LATITUDE,
         longitude: LONGITUDE,
         latitudeDelta: 0.07,
         longitudeDelta: 0.07
       }),
       coords: {
         latitude : LATITUDE,
         longitude : LONGITUDE
       },
       latitudeDelta: LATITUDE_DELTA,
       longitudeDelta: LONGITUDE_DELTA,
       mapType: "satellite",
    }; 
  }

  toggleSwitch = (value) => {
    //onValueChange of the switch this function will be called
    this.setState({mapType: value})
  
    //state changes according to switch
    //which will result in re-render the text
 }

  animateMarker (){
    const { routeCoordinates, distanceTravelled } = this.state;
        const { latitude, longitude } = this.state.coords;
        const newCoordinate = {
          latitude,
          longitude
        };

        if (Platform.OS === "android") {
          if (this.marker) {
            this.marker._component.animateMarkerToCoordinate(
              newCoordinate,
              100
            );
          }
        } else {
          coordinate.timing(newCoordinate).start();
        }

        this.setState({
          latitude,
          longitude,
          routeCoordinates: routeCoordinates.concat([newCoordinate]),
          distanceTravelled:
            distanceTravelled + this.calcDistance(newCoordinate),
          prevLatLng: newCoordinate
        });
  }

  getMapRegion = () => ({
    latitude: this.state.latitude,
    longitude: this.state.longitude,
    latitudeDelta: this.state.latitudeDelta,
    longitudeDelta: this.state.longitudeDelta
  });

  calcDistance = newLatLng => {
    const { prevLatLng } = this.state;
    return haversine(prevLatLng, newLatLng) || 0;
  };
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

  beforeCallKalman(){
    if (this.state.LocationArray.length == 20){
        var latitudeSum = 0;
        var longitudSum = 0; 
        for(i=0; i<this.state.LocationArray.length; ++i){
          latitudeSum += this.state.LocationArray[i].latitude;
          longitudSum += this.state.LocationArray[i].longitude;
        }
        var latitudeAvg = latitudeSum/this.state.LocationArray.length;
        var longitudeAvg = longitudSum/this.state.LocationArray.length;
        var las = 0;
        var los = 0;
        console.log(latitudeAvg + ' llllaaaaaattttiiiiiidddddeee avg')
        for(i=0; i<this.state.LocationArray.length; ++i){
          las += Math.pow((this.state.LocationArray[i].latitude-latitudeAvg),2);
          los += Math.pow((this.state.LocationArray[i].longitude-longitudeAvg),2);
        }
        var latitudeVariance = (las/this.state.LocationArray.length);
        var longitudeVariance = (los/this.state.LocationArray.length);
        console.log(latitudeVariance + ' llllaaaaaattttiiiiiidddddeee variance')
        var latitudeX = (latitudeAvg - 2*latitudeVariance);
        var longitudX = (longitudeAvg - 2*longitudeVariance);
        console.log(latitudeX + ' lllaaaaatiiiiiiiiiitttttuuuuudeeeeee X')
        console.log(longitudX + ' lllaaaaatiiiiiiiiiitttttuuuuudeeeeee X')
        for(i=0; i<this.state.LocationArray.length; ++i){
          if( this.state.LocationArray[i].latitude < latitudeX || 
            this.state.LocationArray[i].longitude < longitudX){
                var array = [...this.state.LocationArray]; // make a separate copy of the array
                var index = i
                if (index !== -1) {
                  array.splice(index, 1);
                  this.setState({LocationArray: array});
                  //console.log('AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA\n' + JSON.stringify(array));
            }
          }
        }
      
      if(this.state.LocationArray.length > 0){
        const kalmanSolution = JSON.stringify(runKalmanOnLocations(this.state.LocationArray, this.state.kalmanConstant));
        this.setState({kalmanSolution}) 
        console.log(kalmanSolution + ' lllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllll\n' +
           this.state.LocationArray.length);
        var array = [...this.state.LocationArray]; // make a separate copy of the array
        var index = 0
        array.splice(index,1)
        this.setState({LocationArray : array});
        
      }
    }
  }

  getCurrentLocation_func = () => {
    RNAndroidLocationEnabler.promptForEnableLocationIfNeeded({interval: 10000, fastInterval: 5000})
    .then(data => {
      this.state.timerForReadLocation = 100;
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
          let coords = {latitude: location.latitude, longitude: location.longitude};
          this.setState({coords});
          console.log(this.state.coords)
          this.animateMarker();
      }
      console.log('puuuuuuuuushhhhhhhhhhhhhhhhhhh')
          this.state.LocationArray.push(location);
          this.beforeCallKalman();  
     });
  }

  async componentDidMount() {
    await requestPermission();
    RNAndroidLocationEnabler.promptForEnableLocationIfNeeded({interval: 10000, fastInterval: 5000})
    .then(data => {
      //this.geolocationWatcher();
      BackgroundGeolocation.start();
      this.BackgroundGeolocationConfig();

      console.log(data + ' data');
      if(data == 'enabled' || data == 'already-enabled'){
        let timer = setInterval(this.getCurrentLocation_func, this.state.timerForReadLocation);
        this.setState({timer}); 
      }
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
      stationaryRadius: 1,
      distanceFilter: 0.5,
      notificationsEnabled: true,
      notificationTitle: 'Background tracking',
      notificationText: 'enabled',
      debug: true,
      startOnBoot: false,
      locationProvider: BackgroundGeolocation.ACTIVITY_PROVIDER,
      interval: 300,
      fastestInterval: 100,
      activitiesInterval: 100,
      stopOnStillActivity: false,
      stopOnTerminate: false,
    });

    // BackgroundGeolocation.getCurrentLocation( (location) =>{
    //   let coordinates = {...this.state.coordinates,
    //     latitude: location.latitude, longitude: location.longitude};
    //   this.setState({coordinates});

    //   console.log("Current Location\n" + location.latitude + '\n' + location.longitude);

    //   let coords = {latitude: location.latitude, longitude: location.longitude};
    //   this.setState({coords});
    //   console.log(this.state.coords)
    //   this.animateMarker();
    //   this.state.LocationArray.push(location);
    //   //this.sendsms(location.latitude,location.longitude);
    // });

    // BackgroundGeolocation.on('location', (location) => {
    //    //BackgroundGeolocation.startTask(taskKey => {
    //     let coordinates = {latitude: location.latitude, longitude:location.longitude};
    //     if (coordinates.latitude == this.state.coordinates.latitude
    //        && coordinates.longitude == this.state.coordinates.longitude){
    //       console.log("repeat");
    //     }
    //     else {
    //       this.setState({coordinates});
    //       console.log("non-repeated Location\n" + location.latitude + '\n' + location.longitude);
    //       let coords = {latitude: location.latitude, longitude: location.longitude};
    //       this.setState({coords});
    //       console.log(this.state.coords)
    //       this.animateMarker();
    //       //this.sendsms(location.latitude,location.longitude);
    //     }
    //     console.log('puuuuuuuuushhhhhhhhhhhhhhhhhhh')
    //       this.state.LocationArray.push(location);
    //       this.beforeCallKalman();
    //     //BackgroundGeolocation.endTask(taskKey);
    //   // });
    // });

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

//    geolocationWatcher(){
//     this.watchID = Geolocation.watchPosition(
//       position => {
//         var lat = parseFloat(position.coords.latitude);
//         var long = parseFloat(position.coords.longitude);
//         ///let marker = {...this.state.markers, coordinates:{latitude:lat,longitude:long}};
//         //this.setState({markers: marker});
//         console.log('wacher \n');
//         let coords = {latitude: lat, longitude: long};
//         this.setState({coords});
//         console.log(this.state.coords)
//          this.animateMarker();
//         // this.state.LocationArray.push(location);
//         // this.beforeCallKalman(); 
//         //this.sendsms(lat,long);
//       },
//       error => alert(error),
//       {enableHighAccuracy: true, timeout: 200, maximumAge: 1000, distanceFilter: 0.1}
//     );
//  }

  render() {
    return (
        <View style={styles.container}>
            <MapView
              style={styles.map}
              mapType={this.state.mapType}
              loadingEnabled
              onRegionChangeComplete ={ (region) => {
                this.state.latitudeDelta = region.latitudeDelta
                this.state.longitudeDelta = region.longitudeDelta
                }}
              region={this.getMapRegion()}
            >
                <Polyline coordinates={this.state.routeCoordinates} strokeWidth={5} strokeColor= {"red"}/>

                <Marker.Animated
                    ref={marker => {
                    this.marker = marker;
                    }}
                    coordinate= {this.state.coordinate}
                >
                </Marker.Animated>
            </MapView>
            <View>
            <SwitchSelector
              options={options}
              initial={0}
              onPress={value => this.toggleSwitch(value)}
            />
              <Text> latitude : {this.state.coords.latitude} </Text> 
              <Text> longitude : {this.state.coords.longitude} </Text>
              <Text> latitudeDelta : {this.state.latitudeDelta}</Text>
              <Text> lonitudeDelta : {this.state.longitudeDelta}</Text> 
            </View> 
          </View>        
    );
  }

}


const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
    alignItems: "center"
  },
  map: {
    ...StyleSheet.absoluteFillObject
  },
  bubble: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.7)",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 20
  },
  latlng: {
    width: 200,
    alignItems: "stretch"
  },
  button: {
    width: 80,
    paddingHorizontal: 12,
    alignItems: "center",
    marginHorizontal: 10
  },
  buttonContainer: {
    flexDirection: "row",
    marginVertical: 20,
    backgroundColor: "transparent"
  },
  MarkerImage: {
    width: 35,
    height: 45,
  },
  button1: { 
    width: 100,
    height: 45,
    borderRadius: 25,
    backgroundColor: '#16A085',
    justifyContent: "center",
    marginTop: 20,
    alignItems: "center",
    marginHorizontal: 7
  },
  btnView: {
    // marginTop: 10,
     marginBottom: 20,
     justifyContent: "center",
     flexDirection: "row-reverse",
     alignContent: "space-between",
   },
   text: {
    color: 'rgba(255,255,255,255)',
    fontSize: 16,
    textAlign: "center"
  },
  // container: {
  //   flex: 1,
  //   position: 'relative',
  //   justifyContent: 'center',
  //   //alignItems: 'center',
  //   backgroundColor: '#F5FCFF',
  // },
  // box: {
  //   flex: 0.2,
  //   width: '100%',
  //   height: '100%'
  // },
  // welcome: {
  //   fontSize: 20,
  //   color: 'blue',
  //   //textAlign: 'center',
  //   marginRight: 50,
  //   marginLeft: 50,
  //   marginTop: 10,
  //   marginBottom: 10,
  // },
  // map: {
  //   flex: 0.8,
  //   width: '100%',
  //   height: '100%',
  // }
});

export default BgTracking;
AppRegistry.registerComponent('test', () => App)