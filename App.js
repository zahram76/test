import React, { Component } from 'react';
import {
   Alert,
   Dimensions,
   StyleSheet,
   View,
   Text,
   PermissionsAndroid,
   Platform,
   Slider,
   Image,
   AppRegistry } from "react-native";
import SwitchSelector from "react-native-switch-selector";
import BackgroundGeolocation from 'react-native-mauron85-background-geolocation';
import SmsAndroid  from 'react-native-get-sms-android';
import Geolocation from 'react-native-geolocation-service';
import RNAndroidLocationEnabler from 'react-native-android-location-enabler';
//import runKalmanOnLocations from "./kalman";
import MapView, {Marker, AnimatedRegion, Polyline, Circle} from "react-native-maps";
import haversine from "haversine";
import _ from "lodash"; // 4.17.5
import { _calculateGreatCircleDistance } from "./locationHelpers";

const LATITUDE =  0;
const LONGITUDE = 0;
let { width, height } = Dimensions.get('window')
const ASPECT_RATIO = width / height
const LATITUDE_DELTA = 0.01
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO
const options = [
  { label: "satellite", value: "hybrid" },
  { label: "standard", value: "standard" },
];

function insertionSort(list) {
  const len = list.length
  for (let i = 1; i < len; i++){
    if (list[i] < list[0]){
      // move current element to the first position
      list.unshift(list.splice(i,1)[0])
    } 
    else if (list[i] > list[i-1]){
      // maintain element position
      continue
    } 
    else {
      // find where element should go
      for (let j = 1; j < i; j++) {
        if (list[i] > list[j-1] && list[i] < list[j]) 
        {
          // move element
          list.splice(j, 0, list.splice(i,1)[0])
        }
      }
    }
  }
  return list
}

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
    //this.markers=[];

    this.state = {
      counter: 0,
      message: '',
      mapType: "standard",
      LocationArray:[],
      timerForReadLocation: 1000,
      kalmanConstant: 500,
      kalmanSolution: null,

      Markers:[{
        latitude: 0,
        longitude: 0,
        routeCoordinates: [],
        distanceTravelled: 0,
        prevLatLng: {},
        coordinate: new AnimatedRegion({
          latitude: 0,
          longitude: 0,
          latitudeDelta: 0.009,
          longitudeDelta: 0.009
        }),
        color: '', 
        title: '',
      }],

      region:{
        latitude: 0,
        longitude: 0,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA
      },

      coordinates: [{
         latitude : LATITUDE,
         longitude : LONGITUDE
       }],
    };
  }

  render(){
    return (
        <View style={styles.container}>
            <MapView
              style={styles.map}
              mapType={this.state.mapType}
              loadingEnabled
              showsUserLocation
              followsUserLocation
              showsMyLocationButton
              region={this.state.region} 
              onRegionChangeComplete ={ (region) => this.setState({ region})}
            >
              {this.state.Markers.map(poly => {
                return (
                  <Polyline coordinates={poly.routeCoordinates} 
                    strokeWidth={5} strokeColor= {String(poly.color)} lineCap= {"square"} lineJoin= {"miter"}>
                  </Polyline> );
               })}

              {this.state.Markers.map(marker => {
                return (
                  <Marker
                    coordinate={{
                      latitude: marker.latitude,
                      longitude: marker.longitude}}
                    pinColor={marker.color}
                    title={marker.title}
                  >
                  </Marker> );
                })}

            </MapView>
            <View style={{width: width-100}}>
              <SwitchSelector
                style={{marginVertical : 20,
                  marginHorizontal : 20}}
                options={options}
                initial={1}
                onPress={value => this.setState({mapType: value})}
              />
            
              <Text> delta : {this.state.region.latitudeDelta} </Text>
              <Slider
                step={0.0001}
                maximumValue={0.9}
                style={{marginVertical : 20}}
                onValueChange={delta => {
                  console.log('delta: ' + delta)
                  this.setState({
                    region: {
                      ...this.state.region,
                      latitudeDelte: parseFloat(delta),
                      longitudeDelta: parseFloat(delta)*ASPECT_RATIO
                    }
                  });
                }}
                value={this.state.region.latitudeDelta}
              />
              </View>
          </View>
    );
  }
  
  animateMarker (index){
    const routeCoordinates = this.state.Markers[index].routeCoordinates;
    const distanceTravelled = this.state.Markers[index].distanceTravelled;
    const { latitude, longitude } = this.state.coordinates[index];
    const newCoordinate = {
      latitude,
      longitude
    };

    // if (this.marker) {
    // this.markers[0]._component.animateMarkerToCoordinate(
    //    newCoordinate, 100);
    // }
    //this.state.Markers[index].coordinate.timing(newCoordinate).start();

    let a = this.state.Markers; //creates the clone of the state
    a[index] = {latitude,
                longitude,
                routeCoordinates: routeCoordinates.concat([newCoordinate]),
                distanceTravelled:
                  distanceTravelled + this.calcDistance(newCoordinate, index),
                prevLatLng: newCoordinate};
    this.setState({Markers: a});
  }

  getMedianLocation(){
    index = 0
    latMedian = 0
    longMedian = 0
    let latArray = []
    let longArray = []
    len = this.state.LocationArray.length
    for(i=0; i< len; ++i){
      latArray.push(this.state.LocationArray[i].latitude);
      longArray.push(this.state.LocationArray[i].longitud);
    }
    let LatSortedArray = insertionSort(latArray) 
    let LongSortedArray = insertionSort(longArray)

    if(len %2 == 0){
      latMedian = LatSortedArray[len/2]
      longMedian = LongSortedArray[len/2]
    } else {
      latMedian = (LatSortedArray[(len/2)-1]+LatSortedArray[(len/2)+1])*1.0/2
      longMedian = (LongSortedArray[(len/2)-1]+LongSortedArray[(len/2)+1])*1.0/2
    }
    console.log('\n index median: '+ index)
    console.log('lat median '+ latMedian +'\n long median ' + longMedian)
    let coords = {latitude: latMedian, longitude: longMedian};
    let a = this.state.coordinates;
    a[index] = coords;
    this.setState({coordinates : a});
    this.animateMarker(index);
  }

  getAVGlocation(){
    var index = 1;
    var latitudeSum = 0;
    var longitudSum = 0;

    for(i=0; i<this.state.LocationArray.length; ++i){
        latitudeSum += this.state.LocationArray[i].latitude;
        longitudSum += this.state.LocationArray[i].longitude;
    }
    var latitudeAvg = latitudeSum/this.state.LocationArray.length;
    var longitudeAvg = longitudSum/this.state.LocationArray.length;

    let coords = {latitude: latitudeAvg, longitude: longitudeAvg};
    let a = this.state.coordinates;
    a[index] = coords;
    this.setState({coordinates : a});
    console.log('\n index avg: '+ index)
    this.animateMarker(index);
  }

  //const uniquename = Array.from(new Set(names)); // return uniqe element from names array :))
  //dataset.reduce((n, x) => n + (x === search), 0) //search in dataset array for searech and return count of it

  getKalmanFilteredLocation(){
    var index = 2;
    this.runKalmanOnLocations(this.state.LocationArray, this.state.kalmanConstant);

    let coords = {latitude: parseFloat(JSON.stringify( this.state.kalmanSolution.latitude)),
          longitude: parseFloat(JSON.stringify( this.state.kalmanSolution.longitude))};

    let a = this.state.coordinates;
    a[index] = coords;
    this.setState({coordinates : a});
    console.log('\n index kalman: '+ index)
    this.animateMarker(index);
  }

  showRealData(coordinate){
    index = 3;
    let a = this.state.coordinates;
    a[index] = coordinate;
    this.setState({coordinates : a});
    console.log(this.state.coordinates[index])
    console.log('\n index real: '+ index)
    this.animateMarker(index);
  }

  beforShowLocation(){
    if (this.state.LocationArray.length == 10){
      this.getAVGlocation();
      //this.getMedianLocation();

     // this.state.counter += 1;
      // if(this.state.counter == 60){
      //   this.sendsms(coordinates.latitude, coordinates.longitude);
      //   this.setState({counter: 0});
      // }

      console.log('length '+this.state.LocationArray.length)
      var array = [...this.state.LocationArray]; // make a separate copy of the array
      filteredItems = array.slice(1, 10) // remove first element of locationArray
      this.setState({LocationArray: filteredItems});
    }
  }
  getCurrentLocation_func = () => {
    RNAndroidLocationEnabler.promptForEnableLocationIfNeeded({interval: 10000, fastInterval: 5000})
    .then(data => {
      this.state.timerForReadLocation = 1000;
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
          
      }
      //this.showRealData(coordinates);
      console.log('puuuuuuuuushhhhhhhhhhhhhhhhhhh')
         this.state.LocationArray.push(location);
         this.beforShowLocation();
     });
  }

  async componentDidMount() {
    await requestPermission();
    RNAndroidLocationEnabler.promptForEnableLocationIfNeeded({interval: 10000, fastInterval: 5000})
    .then(data => {
      BackgroundGeolocation.start();
      this.BackgroundGeolocationConfig();
      console.log('hello');      

      BackgroundGeolocation.getCurrentLocation(location => {
        console.log('hello too'); 
        this.init(location);
      });
      console.log('hello too too too'); 
      let timer = setInterval(this.getCurrentLocation_func, this.state.timerForReadLocation);
      this.setState({timer});
      
    }).catch(err => {
    });
  }

  init(location){
    console.log('hello too too'); 
    let region = {
      latitude : location.latitude,
      longitude : location.longitude,
      latitudeDelta : 0.01,
      longitudeDelta : 0.01, 
    }
    this.setState({region});

  coordinate = {
    latitude: location.latitude,
    longitude: location.longitude
  }
  let a = [];
  let b = ['red', 'green', 'purple','orange'];
  let c = ['Median', 'AVG', 'Kalman','realData'];
  for( x=0; x< 4; ++x){
    a.push({
      latitude: coordinate.latitude,
      longitude: coordinate.longitude,
      routeCoordinates: [],
      distanceTravelled: 0,
      prevLatLng: {},
      coordinate: new AnimatedRegion({
        latitude: coordinate.latitude,
        longitude: coordinate.longitude,
        latitudeDelta : 0.01,
        longitudeDelta : 0.01, 
      }),
      color: b[x],
      title: c[x],
    })
  }
  this.setState({Markers : a});
  console.log(JSON.stringify(a));
  }

  componentWillUnmount() {
    // unregister all event listeners
   //Geolocation.clearWatch(this.watchID);;
    BackgroundGeolocation.removeAllListeners();
  }

  BackgroundGeolocationConfig(){
    BackgroundGeolocation.configure({
      desiredAccuracy: BackgroundGeolocation.HIGH_ACCURACY,
      stationaryRadius: 2,
      distanceFilter: 1,
      notificationsEnabled: true,
      notificationTitle: 'Background tracking',
      notificationText: 'enabled',
      debug: true,
      startOnBoot: false,
      locationProvider: BackgroundGeolocation.ACTIVITY_PROVIDER,
      interval: 500,
      fastestInterval: 300,
      activitiesInterval: 300,
      stopOnStillActivity: false,
      stopOnTerminate: false,
    });

   BackgroundGeolocation.on('background', (location) => {
      console.log('[INFO] App is in background');
    });

    BackgroundGeolocation.on('foreground', () => {
      console.log('[INFO] App is in foreground');
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

   kalman = (location, lastLocation, constant) => {
    const accuracy = Math.max(location.accuracy, 1);
    const result = { ...location, ...lastLocation };

    if (!lastLocation) {
      result.variance = accuracy * accuracy;
    } else {
      const timestampInc =
        location.time.getTime() - lastLocation.time.getTime();

      if (timestampInc > 0) {
        // We can tune the velocity and particularly the coefficient at the end
        const velocity =
          _calculateGreatCircleDistance(location, lastLocation) /
          timestampInc *
          constant;
        result.variance += timestampInc * velocity * velocity / 1000;
      }

      const k = result.variance / (result.variance + accuracy * accuracy);
      result.latitude += k * (location.latitude - lastLocation.latitude);
      result.longitude += k * (location.longitude - lastLocation.longitude);
      result.variance = (1 - k) * result.variance;
    }

    return {
      ...location,
      ..._.pick(result, ["latitude", "longitude", "variance"])
    };
  }

  runKalmanOnLocations = (rawData, kalmanConstant) => {
    rawData
    .map(location => ({
      ...location,
      time: new Date(location.timestamp)
    }))
    .map(location => {
      this.lastLocation = this.kalman(
        location,
        this.lastLocation,
        kalmanConstant
      );
    // console.log('last loc \n')// + JSON.stringify(this.lastLocation))
      this.setState({kalmanSolution: this.lastLocation});
    });
  }

  calcDistance = (newLatLng, index) => {
    const  prevLatLng  = this.state.Markers[index].prevLatLng;
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
}

const styles = StyleSheet.create({ 
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-start",
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
  scrollView: {
    position: "absolute",
    bottom: 30,
    left: 0,
    right: 0,
    paddingVertical: 10,
  },
});

export default BgTracking;
AppRegistry.registerComponent('test', () => App)

// var las = 0;
        // var los = 0;

        // for(i=0; i<this.state.LocationArray.length; ++i){
        //   las += Math.pow((this.state.LocationArray[i].latitude-latitudeAvg),2);
        //   los += Math.pow((this.state.LocationArray[i].longitude-longitudeAvg),2);
        // }
      //   var latitudeVariance = Math.sqrt(las/this.state.LocationArray.length);
      //   var longitudeVariance = Math.sqrt(los/this.state.LocationArray.length);

      //   var latitudeX1 = (latitudeAvg - latitudeVariance);
      //   var latitudeX2 = (latitudeAvg + latitudeVariance);

      //   var longitudX1 = (longitudeAvg - longitudeVariance);
      //   var longitudX2 = (longitudeAvg + longitudeVariance);
      //   console.log('\nlatitude avg: '+latitudeAvg);
      //   console.log('\nlatitude variance: '+latitudeVariance);
      //   console.log('\nlatitude X1: '+latitudeX1);
      //   console.log('\nlatitude X1: '+latitudeX2);
      //  var deletedArray = [];
      //   for(i=0; i<this.state.LocationArray.length; ++i){
      //    // console.log('latitude \n' + JSON.stringify(this.state.LocationArray[i].latitude))
      //     if(latitudeVariance > 0.001)
      //     if( (this.state.LocationArray[i].latitude < latitudeX1 ||
      //           this.state.LocationArray[i].latitude > latitudeX2) ||
      //         (this.state.LocationArray[i].longitude < longitudX1 ||
      //           this.state.LocationArray[i].longitude > longitudX2)){
      //             //console.log('deleted latitude \n' + JSON.stringify(this.state.LocationArray[i].latitude))
      //            // deletedArray.push(i);
      //           var array = [...this.state.LocationArray]; // make a separate copy of the array
      //           var index = i
      //           if (index !== -1) {
      //            // array.splice(index, 1);
      //             filteredItems = array.slice(0, i).concat(array.slice(i + 1, array.length));
      //             this.setState({LocationArray: array});
      //            // --i;
      //             //console.log('array lenght ' + this.state.LocationArray.length)
      //           }
      //     }
      //    console.log('aaaaaaaaaaaaaaaaaaaaaaaaaaa\n'+ JSON.stringify(this.state.LocationArray.latitude))
      //  }


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
    //       // this.state.LocationArray.push(locat ion);
    //       // this.beforeCallKalman();
    //     //BackgroundGeolocation.endTask(taskKey);
    //   // });
    // });

    // BackgroundGeolocation.on('stationary', (stationaryLocation) => {
    //   // handle stationary locations here
    //   let coordinates = {...this.state.coordinates,
    //     latitude: stationaryLocation.latitude, longitude: stationaryLocation.longitude};
    //   this.setState({coordinates});
    //   console.log("stationary Location\n" + stationaryLocation.latitude + '\n' + stationaryLocation.longitude);
    //   //alert("stationary location");
    // });

    //geolocationWatcher(){
      //     this.watchID = Geolocation.watchPosition(
      //       position => {
      //         var lat = parseFloat(position.coords.latitude);
      //         var long = parseFloat(position.coords.longitude);
      //         console.log('wacher \n');
      //         let coords = {latitude: lat, longitude: long};
      //         this.setState({coords});
      //         console.log(this.state.coords)
      //          this.animateMarker();
      //       },
      //       error => alert(error),
      //       {enableHighAccuracy: true, timeout: 200, maximumAge: 1000, distanceFilter: 0.1}
      //     );
      //  }