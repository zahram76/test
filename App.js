import React, { Component } from 'react';
import {Dimensions, View, Text, AppRegistry, TouchableOpacity} from "react-native";
import SwitchSelector from "react-native-switch-selector";
import BackgroundGeolocation from 'react-native-mauron85-background-geolocation';
import SmsAndroid  from 'react-native-get-sms-android';
import RNAndroidLocationEnabler from 'react-native-android-location-enabler';
import MapView, {Marker, AnimatedRegion, Polyline} from "react-native-maps";
import haversine from "haversine";
//import _ from "lodash"; // 4.17.5
//import { _calculateGreatCircleDistance } from "./locationHelpers";
import {styles} from './style.js';
import {requestPermission} from './permission.js';
import {insertionSort} from './insertionSort.js';
import { initDatabase } from './initDatabase.js';
import { insertLocation } from './insertLocations.js';
import { deleteLacation } from './deleteLocation';
import Geohash from 'latlon-geohash';
 

const LATITUDE =  0;
const LONGITUDE = 0;
let { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.01;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;
const options = [
  { label: "satellite", value: "hybrid" },
  { label: "standard", value: "standard" },
];


export default class BgTracking extends Component {
  constructor(){
    super();
    this.state = {
      counter: 0,
      message: '',
      mapType: "standard",
      LocationArray:[],
      timerForReadLocation: 1000,
      kalmanConstant: 500,
      kalmanSolution: null,
      Markers:[],
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
       speed: [0,0,0,0], 
       geohash : '',
       count : 0,
       correct : 0,
    };
    
    
    initDatabase();
  }

  render(){
    return (
        <View style={{flex: 1}}>
            <MapView
              ref={ref => {this.map = ref;}}
              style={{flex:1, height: '100%', width: '100%'}}
              mapType={this.state.mapType}
              loadingEnabled={true}
              showsUserLocation
              showsIndoorLevelPicker={true}
              initialRegion={this.state.region}
              region={ this.state.region }
              onRegionChangeComplete={ region => this.setState({region}) }
            >
              {this.state.Markers.map(poly => {
                return (
                  <Polyline 
                    key={`poly_${poly.id}`}
                    coordinates={poly.routeCoordinates}
                    strokeWidth={5} strokeColor= {poly.color}>
                  </Polyline> );
               })}
              {this.state.Markers.map(marker => {
                return (
                  <Marker
                      key={`marker_${marker.id}`}
                      coordinate={{
                      latitude: marker.latitude,
                      longitude: marker.longitude}}
                      pinColor={marker.color}
                      title={marker.title}>
                  </Marker> );
                })}
            </MapView>
            <View style={styles.MapTypeMenuStyle}>
              <SwitchSelector
                options={options}
                initial={1}
                onPress={value => this.setState({mapType: value})}
              />
              <View style={{backgroundColor: 'rgba(255,255,254,0.8)',
                  borderRadius: 20,padding: 10,
                  color: '#000000', alignSelf: 'center', marginTop: 20}}>
                <Text> AVG Speed : {this.state.speed[1]} </Text>
                <Text> Median Speed : {this.state.speed[0]} </Text>
                <Text> Real Speed : {this.state.speed[3]} </Text>
              </View>
              <TouchableOpacity  
                  style={{backgroundColor: 'rgba(255,255,254,0.9)', marginTop: 20, 
                  borderRadius: 20,padding: 10,
                  color: '#000000', alignSelf: 'center'}}
                  onPress={() => deleteLacation()}>
                  <Text>Delete</Text>
              </TouchableOpacity>
              
              </View>
          </View>
    );
  }

  animateMarker (index){
    const routeCoordinates = this.state.Markers[index].routeCoordinates;
    const distanceTravelled = this.state.Markers[index].distanceTravelled;
    const { latitude, longitude } = this.state.coordinates[index];
    const newCoordinate = { latitude, longitude };
    let a = this.state.Markers; //creates the clone of the state
    a[index] = {latitude,
                longitude,
                routeCoordinates: routeCoordinates.concat([newCoordinate]),
                distanceTravelled:
                  distanceTravelled + this.calcDistance(newCoordinate, index),
                prevLatLng: newCoordinate};
    this.setState({Markers: a});
  }

  showRealData(coordinate){
    index = 3;
    let a = this.state.coordinates;
    a[index] = coordinate;
    this.setState({coordinates : a});
    console.log('\n index real: '+ index)
    this.animateMarker(index);
  }

  beforShowLocation(){
    if (this.state.LocationArray.length == 10){
      //this.getAVGlocation();
      //this.getMedianLocation();
      //this.getKalmanFilteredLocation();
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
      let coordinates = {latitude: location.latitude, longitude:location.longitude};
      if (coordinates.latitude == this.state.coordinates[3].latitude
         && coordinates.longitude == this.state.coordinates[3].longitude){
        console.log("repeat");
      }
      else {console.log("non-repeated Location by timer\n" + location.latitude + '\n' + location.longitude);}
      var index = 3;
      let b = this.state.speed;
      b[index] = location.speed;
      this.setState({speed: b});

      if(this.state.count == 0){
        this.setState({geohash : Geohash.encode(location.latitude, location.longitude, 9)});
        this.loc = location;
        console.log('first encoded geohash : ' + this.state.geohash)
        this.setState({count: this.state.count+1})
      }
      else if(this.state.count < 5){
        var g1 = Geohash.encode(location.latitude, location.longitude, 9);
        console.log( this.state.count + ' encoded geohash : ' + g1)
        if(this.state.geohash == g1) this.setState({correct : this.state.correct+1});
        console.log('correct : ' + this.state.correct)
        this.setState({count: this.state.count+1})
      }
      else {
        this.setState({correct : 0})
        this.setState({count : 0})
      }

      if(this.state.correct > 3){
        var latlong = Geohash.decode(this.state.geohash);
        console.log( this.state.count + ' decoded geohash latlong  : ' + JSON.stringify(latlong))
        //this.state.LocationArray.push(location);
        console.log('location : ' +  JSON.stringify(this.loc))
        var lat,long;
        JSON.parse(JSON.stringify(latlong), (key,value) => {
          if(key == "lat") lat = value
          if(key == "lon") long = value
        })
        let coords = {latitude: lat, longitude: long};
        this.showRealData(coords);
        //this.showRealData(coordinates);
      }      

      //this.showRealData(coordinates);
      //console.log('push')
      //this.state.LocationArray.push(location);
      //insertLocation('real', location.latitude, location.longitude);
      //this.beforShowLocation();
     });
  }

   componentDidMount() {
     requestPermission();
    RNAndroidLocationEnabler.promptForEnableLocationIfNeeded({interval: 10000, fastInterval: 5000})
    .then(data => {
      this.BackgroundGeolocationConfig();
      BackgroundGeolocation.start();
      console.log('hello');

      BackgroundGeolocation.getCurrentLocation(location => {
        console.log('hello too');
        this.init(location);
      });
      let timer = setInterval(this.getCurrentLocation_func, this.state.timerForReadLocation);
      this.setState({timer});

    }).catch(err => {
    });
  }

  init(location){
    this.setState({region : {
      latitude : location.latitude,
      longitude : location.longitude,
      latitudeDelta : 0.01,
      longitudeDelta : 0.01,
    }});

  console.log('region: '+JSON.stringify(this.state.region));
  coordinate = {
    latitude: location.latitude,
    longitude: location.longitude
  }
  let b = ['red', 'green', 'purple','yellow'];
  let c = ['Median', 'AVG', 'Kalman','realData'];
  for( x=0; x< 4; ++x){
    this.state.Markers.push({
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
      color: b[x].toString(),
      title: c[x],
      id : x
      });
      this.state.coordinates.push({
        latitude: location.latitude,
        longitude: location.longitude
      })
    }
  }

  getMedianLocation(){
    index = 0;
    latMedian = 0;
    longMedian = 0;
    xMedian = 0;
    yMedian = 0;
    let latArray = [];
    let longArray = [];
    len = this.state.LocationArray.length;
    for(i=0; i< len; ++i){
      latArray.push(this.state.LocationArray[i].latitude);
      longArray.push(this.state.LocationArray[i].longitude);
    }
    let LatSortedArray = insertionSort(latArray)
    let LongSortedArray = insertionSort(longArray)
    if(len %2 == 0){
      xMedian = LatSortedArray[len/2]
      yMedian = LongSortedArray[len/2]
    } else {
      xMedian = (LatSortedArray[(len/2)-1]+LatSortedArray[(len/2)+1])*1.0/2
      yMedian = (LongSortedArray[(len/2)-1]+LongSortedArray[(len/2)+1])*1.0/2
    }
    // var min = Math.abs(latArray[0] - xMedian) + Math.abs(longArray[0] - yMedian);
    // var arrayIndex = 0;
    // var temp = 0;
    // for(j=0; j< len; ++j){
    //   temp = Math.abs(latArray[j] - xMedian) + Math.abs(longArray[j] - yMedian);
    //   if( temp < min) {
    //     min = temp;
    //     arrayIndex = j;
    //   }
     // //console.log(j + ' array index')
    //}
    var min = Math.sqrt( Math.pow((latArray[0],2 - xMedian),2) + Math.pow((longArray[0] - yMedian),2));
    var arrayIndex = 0;
    var temp = 0;
    for(j=0; j< len; ++j){
      temp = Math.sqrt( Math.pow((latArray[j],2 - xMedian),2) + Math.pow((longArray[j] - yMedian),2));
      if( temp < min) {
        min = temp;
        arrayIndex = j;
      }
    }
    latMedian = latArray[arrayIndex];
    longMedian = longArray[arrayIndex];
    let b = this.state.speed;
    b[index] = this.state.LocationArray[arrayIndex].speed;
    this.setState({speed: b})
    console.log('\n index median: '+ index)
    let coords = {latitude: latMedian, longitude: longMedian};
    let a = this.state.coordinates;
    a[index] = coords;
    this.setState({coordinates : a});
    insertLocation('median', latMedian, longMedian);
    this.animateMarker(index);
  }

  getAVGlocation(){
    var index = 1;
    var latitudeSum = 0;
    var longitudSum = 0;
    var speedSum = 0;
    var len = this.state.LocationArray.length;
    for(i=0; i<len; ++i){
        latitudeSum += this.state.LocationArray[i].latitude;
        longitudSum += this.state.LocationArray[i].longitude;
        speedSum += this.state.LocationArray[i].speed;
    }
    var latitudeAvg = latitudeSum/len;
    var longitudeAvg = longitudSum/len;
    var speedAVG = speedSum/len;
    let b = this.state.speed;
    b[index] = speedAVG;
    this.setState({speed: b})
    let coords = {latitude: latitudeAvg, longitude: longitudeAvg};
    let a = this.state.coordinates;
    a[index] = coords;
    this.setState({coordinates : a});
    console.log('\n index avg: '+ index)
    insertLocation('average', latitudeAvg, longitudeAvg);
    this.animateMarker(index);
  }

  componentWillUnmount() {
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

    // BackgroundGeolocation.on("location", (location) => {
    //   let coordinates = {latitude: location.latitude, longitude:location.longitude};
    //   if (coordinates.latitude == this.state.coordinates[3].latitude
    //      && coordinates.longitude == this.state.coordinates[3].longitude){
    //     console.log("repeat");
    //   }
    //   else {console.log("non-repeated Location by timer\n" + location.latitude + '\n' + location.longitude);}
    //   var index = 3;
    //   let b = this.state.speed;
    //   b[index] = location.speed;
    //   this.setState({speed: b})

    //   this.showRealData(coordinates);

    //   console.log('push')
    //   this.state.LocationArray.push(location);
    //   insertLocation('real', location.latitude, location.longitude);
    //   this.beforShowLocation();
    //  });
  

  //  BackgroundGeolocation.on('background', (location) => {
  //     console.log('[INFO] App is in background');
  //   });

  //   BackgroundGeolocation.on('foreground', () => {
  //     console.log('[INFO] App is in foreground');
  //   });
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

      //BackgroundGeolocation.on('authorization', (status) => {
        //   console.log('[INFO] BackgroundGeolocation authorization status: ' + status);
        //   if (status !== BackgroundGeolocation.AUTHORIZED) {
        //     // we need to set delay or otherwise alert may not be shown
        //     setTimeout(() =>
        //       Alert.alert('App requires location tracking permission', 'Would you like to open app settings?', [
        //         { text: 'Yes', onPress: () => BackgroundGeolocation.showAppSettings() },
        //         { text: 'No', onPress: () => console.log('No Pressed'), style: 'cancel' }
        //       ]), 1000);
        //   }
        // });

        
  //  kalman = (location, lastLocation, constant) => {
  //   const accuracy = Math.max(location.accuracy, 1);
  //   const result = { ...location, ...lastLocation };

  //   if (!lastLocation) {
  //     result.variance = accuracy * accuracy;
  //   } else {
  //     const timestampInc =
  //       location.time.getTime() - lastLocation.time.getTime();

  //     if (timestampInc > 0) {
  //       // We can tune the velocity and particularly the coefficient at the end
  //       const velocity =
  //         _calculateGreatCircleDistance(location, lastLocation) /
  //         timestampInc *
  //         constant;
  //       result.variance += timestampInc * velocity * velocity / 1000;
  //     }

  //     const k = result.variance / (result.variance + accuracy * accuracy);
  //     result.latitude += k * (location.latitude - lastLocation.latitude);
  //     result.longitude += k * (location.longitude - lastLocation.longitude);
  //     result.variance = (1 - k) * result.variance;
  //   }

  //   return {
  //     ...location,
  //     ..._.pick(result, ["latitude", "longitude", "variance"])
  //   };
  // }

  // runKalmanOnLocations = (rawData, kalmanConstant) => {
  //   rawData
  //   .map(location => ({
  //     ...location,
  //     time: new Date(location.timestamp)
  //   }))
  //   .map(location => {
  //     this.lastLocation = this.kalman(
  //       location,
  //       this.lastLocation,
  //       kalmanConstant
  //     );
  //     this.setState({kalmanSolution: this.lastLocation});
  //   });
  // }

  
  // getKalmanFilteredLocation(){
  //   var index = 2;
  //   this.runKalmanOnLocations(this.state.LocationArray, this.state.kalmanConstant);

  //   let coords = {latitude: parseFloat(JSON.stringify( this.state.kalmanSolution.latitude)),
  //         longitude: parseFloat(JSON.stringify( this.state.kalmanSolution.longitude))};

  //   let b = this.state.speed;
  //   b[index] = parseFloat(JSON.stringify( this.state.kalmanSolution.speed));
  //   this.setState({speed: b})

  //   let a = this.state.coordinates;
  //   a[index] = coords;
  //   this.setState({coordinates : a});
  //   console.log('\n index kalman: '+ index)
  //   this.animateMarker(index);
  // }
