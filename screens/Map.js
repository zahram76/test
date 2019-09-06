import React, {Component, Fragment} from 'react';
import {Dimensions, View, Text, AppRegistry, TouchableOpacity, Image} from "react-native";
import BackgroundGeolocation from 'react-native-mauron85-background-geolocation';
import SmsAndroid  from 'react-native-get-sms-android';
import RNAndroidLocationEnabler from 'react-native-android-location-enabler';
import MapView, {Marker, AnimatedRegion, Polyline, Circle} from "react-native-maps";
import Menu, { MenuItem, MenuDivider } from 'react-native-material-menu';
import Icon from "react-native-vector-icons/Ionicons";
import AsyncStorage from "@react-native-community/async-storage";
import DeviceBattery from 'react-native-device-battery';
import SQLite from "react-native-sqlite-storage";
import Geohash from 'latlon-geohash';
import haversine from "haversine";
import {CurrentLocationButton} from '../component/CurrentLocationButton'
import {MapTypeMenu} from '../component/MapTypeMenu.js';
import { insertLocation } from '../functions/insertLocations.js';
import { deleteLacation } from '../functions/deleteLocation';
import {requestPermission} from '../functions/permission.js';
import {styles} from '../style.js';
var RNFS = require('react-native-fs');

const color = '#349e9f';
var DB = SQLite.openDatabase({name : "db", createFromLocation : "~db.sqlite"});
const LATITUDE =  0;
const LONGITUDE = 0;
let { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.01;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;


export default class Map extends Component {
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
       coord: {
        latitude : LATITUDE,
        longitude : LONGITUDE
       },
       speed: [0,0,0,0], 
       geohash : '',
       count : 0,
       correct : 0,
       batteryState: 0,
       accuracy: 0,
    };
    this.start()
  }

  render(){
    return (
       <Fragment>
            <MapView
              ref={ref => {this.map = ref}}
              style={{flex:1, height: '100%', width: '100%'}}
              mapType={this.state.mapType}
              showsUserLocation={true}
              rotateEnabled={true}
              initialRegion={this.state.region}>
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
                    //ref={ref =>  {this.marker = ref}}
                      key={`marker1_${marker.id}`}
                      tracksViewChanges={true}
                      coordinate={{
                      latitude: marker.latitude,
                      longitude: marker.longitude}}
                      pinColor={marker.color}
                      title={marker.title}>
                  </Marker> );
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

              <View style={styles.felan}>
                <Text > Real Speed : {this.state.speed[0]} </Text>
                <Text > Battery State : {this.state.batteryState} </Text>
                <Text > accuracy : {this.state.accuracy} </Text>
              </View>

              <CurrentLocationButton cb ={() => {this.centerMap(500)}}/>     
          </Fragment>
    );
  }

  // <View style={styles.MapTypeMenuStyle}>
  //    <MapTypeMenu onChange={mapType => this.setState({mapType})}></MapTypeMenu>
  //  </View>

  animateMarker (index){
    const routeCoordinates = this.state.Markers[index].routeCoordinates;
    const distanceTravelled = this.state.Markers[index].distanceTravelled;
    const { latitude, longitude } = this.state.coordinates[index];
    const newCoordinate = { latitude, longitude };
    
      if (this.marker) {
        this.marker._component.animateMarkerToCoordinate(newCoordinate, 500);
      }

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
    this.animateMarker(index);
  }

  getCurrentLocation_func = () => {
    RNAndroidLocationEnabler.promptForEnableLocationIfNeeded({interval: 10000, fastInterval: 5000})
    .then(data => {
      this.state.timerForReadLocation = 1000;
    }).catch(err => {
      this.state.timerForReadLocation = 10000;
    });
    BackgroundGeolocation.getCurrentLocation(location => {
      
      let coord = {latitude: location.latitude, longitude:location.longitude};
      if (coord.latitude == this.state.coord.latitude
         && coord.longitude == this.state.coord.longitude){
      }
      else {
        this.setState({coord})
      }
      var index = 0;
      let b = this.state.speed;
      b[index] = location.speed;
      this.setState({accuracy: location.accuracy}); 
      this.setState({speed: b});
      this.setState({region: {
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: this.state.region.latitudeDelta,
        longitudeDelta: this.state.region.latitudeDelta,
      }});
      this.showRealData(coord);

      // if(this.state.count == 0){
      //   this.setState({geohash : Geohash.encode(location.latitude, location.longitude, 8)});
      //   this.loc = location;
      //  // console.log('first encoded geohash : ' + this.state.geohash)
      //   this.setState({count: this.state.count+1})
      // }
      // else {
    //     var g1 = Geohash.encode(location.latitude, location.longitude, 8);
    //    // console.log( this.state.count + ' encoded geohash : ' + g1)
    //     if(this.state.geohash == g1) this.setState({correct : this.state.correct+1});
    //    // console.log('correct : ' + this.state.correct)
    //     this.setState({count: this.state.count+1})

    //   if(this.state.correct > 3){
    //     var latlong = Geohash.decode(this.state.geohash);
    //    // console.log( this.state.count + ' decoded geohash latlong  : ' + JSON.stringify(latlong))
    //    // console.log('location : ' +  JSON.stringify(this.loc))
    //     var lat,long;
    //     JSON.parse(JSON.stringify(latlong), (key,value) => { 
    //       if(key == "lat") lat = value
    //       if(key == "lon") long = value
    //     });
        // this.setState({region: {
        //   latitude: lat,
        //   longitude: long,
        //   latitudeDelta: this.state.region.latitudeDelta,
        //   longitudeDelta: this.state.region.latitudeDelta,
        // }});
    //    // console.log(JSON.stringify(this.state.region))
    //     this.setState({correct : 0}); this.setState({count: 0}); 
        // let coords = {latitude: lat, longitude: long};
        // this.showRealData(coords);
    //   } 
    //   else if( this.state.count > 5) {
    //     this.setState({correct : 0}); this.setState({count: 0}); }
    // }
    });
  }

  initSetting(){
    console.log(' map for init setting');
    DB.transaction((tx) => {
      console.log("execute transaction");
        tx.executeSql('select value from Settings where setting_name=?', ['mapType'], (tx, results) => {
              console.log('Results', results.rows.length);
              if (results.rows.length > 0) {
                this.state.mapType = results.rows.item(0).value
                console.log('map inti setting : ' + this.state.mapType)
              } else { console.log('can not find map type setting ') }  
        });
    });
  }

  componentDidMount(){
    this.initSetting();
    this.createDir();
    const { navigation } = this.props;
    this.focusListener = navigation.addListener('didFocus', () => {
      if(this.props.navigation.state.params != null){
        console.log(' navigation param : ' + JSON.stringify(this.props.navigation.state.params));
        const str = JSON.stringify(this.props.navigation.state.params);
        JSON.parse(str, (key,value) => {
          if(key == 'name' && value == 'profile'){
          console.log(value);
          this.initSetting();
        }
        // else if(key == 'name' && value == 'adduser'){
          
        // }
        })  
      } else { console.log( ' is nul ')}
    });
  }

  createDir(){
    RNFS.readDir(RNFS.DocumentDirectoryPath) // On Android, use "RNFS.DocumentDirectoryPath" (MainBundlePath is not defined)
    .then((result) => {
      console.log('path: '+ RNFS.DocumentDirectoryPath)
      console.log('GOT RESULT ', result);
      // stat the first file
      RNFS.mkdir(RNFS.DocumentDirectoryPath+'/images').then( result => {
        console.log('GOT RESULT mkdir ', result);
      }).then(contents => {
        console.log('contents mkdir'+ contents);
      }) .catch((err) => {
        console.log('contents error mkdir' + err.message, err.code);
      });
      return Promise.all([RNFS.stat(result[0].path), result[0].path]);
    })
    .then((statResult) => {
      if (statResult[0].isFile()) {
        // if we have a file, read it
        return RNFS.readFile(statResult[1], 'utf8');
      }
      return 'no file';
    })
    .then((contents) => {
      // log the file contents
      console.log('contents '+ contents);
    })
    .catch((err) => {
      console.log('contents ' + err.message, err.code);
    });
  }

  centerMap(d){
    const {
      latitude,longitude,
      latitudeDelta,longitudeDelta
    } = this.state.region
    this.map.animateToRegion({
      latitude,longitude,latitudeDelta,longitudeDelta}, d);
  }

  onBatteryStateChanged = (state) => {
    this.setState({batteryState: state.level})
  };

   start() {
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
        DeviceBattery.getBatteryLevel().then(level => {
          this.setState({batteryState: level}) // between 0 and 1
        });
        // to attach a listener
        DeviceBattery.addListener(this.onBatteryStateChanged);
        
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

    this.centerMap(100)
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
    clearTimeout(this.timer);
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

  static navigationOptions = ({ navigation }) => {
    return {
        title: 'Map',
        headerStyle: {
          backgroundColor: color,
          barStyle: "light-content", // or directly
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerRight: (
          <View style={{flexDirection: "row-reverse"}}>
            <Menu
                ref={(ref) => this._menu = ref}
                button={<TouchableOpacity onPress={() => this._menu.show()} 
                  style={{paddingHorizontal:16, height: '100%', alignItems:'center', 
                  justifyContent: 'center'}}>
                    <Image source={require('../asset/menu.png')} 
                      style={{alignSelf:'center', width: 20, height: 20, marginLeft: 7}} resizeMode='contain'
                      /></TouchableOpacity>}>
                <MenuItem onPress={() => {
                  this._menu.hide()
                  }} textStyle={{fontSize: 16}} disabled>Map</MenuItem>
                <MenuItem  onPress={() =>{
                  this._menu.hide()
                  navigation.navigate('Profile')
                  }} textStyle={{color: '#000',fontSize: 16}}>Profile</MenuItem>
                <MenuItem onPress={() =>{
                  this._menu.hide()
                  AsyncStorage.clear();
                  navigation.navigate('Auth')
                  }}  textStyle={{color: '#000', fontSize: 16}}>Sign out</MenuItem>
                
            </Menu>
            <TouchableOpacity 
              style={{
                //paddingHorizontal:8, 
                height: '100%', 
                alignItems:'center', 
                justifyContent: 'center',
                marginRight: 3,
              }}
              onPress={() => navigation.navigate('AddPerson',{name: 'map'})}>
              <Image source={require('../asset/addU.png')} 
              style={{alignSelf:'center', width: 24, height: 24}} resizeMode='contain'
              />
            </TouchableOpacity>
          </View>
        ),
      }
    }
}
