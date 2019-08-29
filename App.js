import React, { Component } from 'react';
import {Dimensions, View, Text, AppRegistry, TouchableOpacity} from "react-native";
import SwitchSelector from "react-native-switch-selector";
import BackgroundGeolocation from 'react-native-mauron85-background-geolocation';
import SmsAndroid  from 'react-native-get-sms-android';
import RNAndroidLocationEnabler from 'react-native-android-location-enabler';
import MapView, {Marker, AnimatedRegion, Polyline} from "react-native-maps";
import haversine from "haversine";
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
      timerForReadLocation: 300,
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
       coord: {
        latitude : LATITUDE,
        longitude : LONGITUDE
       },
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
              ref={ref => {this.map = ref}}
              style={{flex:1, height: '100%', width: '100%'}}
              mapType={this.state.mapType}
              loadingEnabled={true}
              showsUserLocation={true}
              rotateEnabled={true}
              showsIndoorLevelPicker={true}
              initialRegion={this.state.region}
              //region={ this.state.region }
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
                  <Marker.Animated
                    ref={ref =>  {this.marker = ref}}
                      key={`marker_${marker.id}`}
                      tracksViewChanges={true}
                      coordinate={{
                      latitude: marker.latitude,
                      longitude: marker.longitude}}
                      pinColor={marker.color}
                      title={marker.title}>
                  </Marker.Animated> );
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
                <Text> Real Speed : {this.state.speed[0]} </Text>
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
    
    if (Platform.OS === "android") {
      if (this.marker) {
        this.marker._component.animateMarkerToCoordinate(newCoordinate, 500);
      }
    } else { coordinate.timing(newCoordinate).start(); }

    let a = this.state.Markers; //creates the clone of the state
    a[index] = {latitude,
                longitude,
                routeCoordinates: routeCoordinates.concat([newCoordinate]),
                distanceTravelled:
                  distanceTravelled + this.calcDistance(newCoordinate, index),
                prevLatLng: newCoordinate,
                color: a[index].color,
                title: a[index].title};
    this.setState({Markers: a});
  }

  showRealData(coordinate){
    index = 0;
    let a = this.state.coordinates;
    a[index] = coordinate;
    this.setState({coordinates : a});
    console.log('\n index real: '+ index)
    this.animateMarker(index);
  }

  getCurrentLocation_func = () => {
    RNAndroidLocationEnabler.promptForEnableLocationIfNeeded({interval: 10000, fastInterval: 5000})
    .then(data => {
      this.state.timerForReadLocation = 300;
    }).catch(err => {
      this.state.timerForReadLocation = 10000;
    });
    BackgroundGeolocation.getCurrentLocation(location => {
      let coord = {latitude: location.latitude, longitude:location.longitude};
      if (coord.latitude == this.state.coord.latitude
         && coord.longitude == this.state.coord.longitude){
        console.log("repeat "+  location.latitude+' '+ coord.latitude );
      }
      else {
        console.log("non-repeated Location by timer\n" + location.latitude + '\n' + location.longitude);
        this.setState({coord})
      var index = 0;
      let b = this.state.speed;
      b[index] = location.speed;
      this.setState({speed: b});

      if(this.state.count == 0){
        this.setState({geohash : Geohash.encode(location.latitude, location.longitude, 9)});
        this.loc = location;
        console.log('first encoded geohash : ' + this.state.geohash)
        this.setState({count: this.state.count+1})
      }
      else {
        var g1 = Geohash.encode(location.latitude, location.longitude, 9);
        console.log( this.state.count + ' encoded geohash : ' + g1)
        if(this.state.geohash == g1) this.setState({correct : this.state.correct+1});
        console.log('correct : ' + this.state.correct)
        this.setState({count: this.state.count+1})

      if(this.state.correct > 2){
        var latlong = Geohash.decode(this.state.geohash);
        console.log( this.state.count + ' decoded geohash latlong  : ' + JSON.stringify(latlong))
        console.log('location : ' +  JSON.stringify(this.loc))
        var lat,long;
        JSON.parse(JSON.stringify(latlong), (key,value) => { 
          if(key == "lat") lat = value
          if(key == "lon") long = value
        });
        this.setState({correct : 0})
        this.setState({count : 0})
        let coords = {latitude: lat, longitude: long};
        this.showRealData(coords);
      } 
      else if( this.state.count > 10) {
        this.setState({correct : 0})
        this.setState({count : 0})
      }
    }
  }
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
    color: 'purple',
    title: 'filtered data',
    id : 0
    });
    this.state.coordinates.push({
      latitude: location.latitude,
      longitude: location.longitude
    })
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
