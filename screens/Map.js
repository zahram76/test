import React, {Component, Fragment} from 'react';
import {Dimensions, View, Text, AppRegistry, TouchableOpacity, Image} from "react-native";
import BackgroundGeolocation from 'react-native-mauron85-background-geolocation';
import RNAndroidLocationEnabler from 'react-native-android-location-enabler';
import MapView, {Marker, AnimatedRegion, Polyline, Circle} from "react-native-maps";
import Menu, { MenuItem, MenuDivider } from 'react-native-material-menu';
import AsyncStorage from "@react-native-community/async-storage";
import DeviceBattery from 'react-native-device-battery';
import SQLite from "react-native-sqlite-storage";
import SmsListener from 'react-native-android-sms-listener';
import Geohash from 'latlon-geohash';
import KalmanFilter from 'kalmanjs';
import haversine from "haversine";
import SmsAndroid from 'react-native-get-sms-android';
import {CurrentLocationButton} from '../component/CurrentLocationButton'
import {requestPermission} from '../functions/permission.js';
import {styles} from '../style.js';
import { insertLocation } from '../functions/insertLocations';
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import {MapTypeMenu} from '../component/MapTypeMenu.js';
import {parseMessage} from '../functions/parseMessage.js';
var RNFS = require('react-native-fs');

const color = '#349e9f';
var DB = SQLite.openDatabase({name : "db", createFromLocation : "~db.sqlite"});
const LATITUDE =  0;
const LONGITUDE = 0;
let { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.01;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;
var lat = LATITUDE
var long = LONGITUDE

export default class Map extends Component {
  constructor(){
    super();
    this.state = {
      counter: 0,
      message: '',
      mapType: "standard",  
      markerImage: '',
      timerForReadLocation: 1000,
      Markers:[{
        latitude: LATITUDE,
        longitude: LONGITUDE,
        routeCoordinates: [],
        distanceTravelled: 0,
        prevLatLng: {},
        coordinate: new AnimatedRegion({
          latitude: LATITUDE,
          longitude: LONGITUDE,
          latitudeDelta : 0.01,
          longitudeDelta : 0.01,
        }),
        color: 'purple',
        title: 'filtered data',
        id : 0}],
      geolen: 10,
      region:{
        latitude: 0,
        longitude: 0,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA
      },
      coordinates: {
         latitude : LATITUDE,
         longitude : LONGITUDE
       },
       speed: 0,
       batteryState: 0,
       accuracy: 0,
       borderWidth: 0
    };
    this.time = ''
    this.count = 0;
    this.correct = 0;
    this.counter = 0;
    this.firstOK = false;
    this.kalmanFilterLat = null;
    this.kalmanFilterLong = null;
    this.lastLat=0;
    this.lastLong=0;
    this.timer = [];
    this.speedSend = [];
    this.speedInterval = 0
    console.log(this.correct + this.count)
    this.geohash = '';
    
  }
//-------------------------------------------------------------------------------------------
  start() {
    requestPermission();
    RNAndroidLocationEnabler.promptForEnableLocationIfNeeded({interval: 10000, fastInterval: 5000})
      .then(data => {
      }).catch(err => {
    });
    this.BackgroundGeolocationConfig();
        BackgroundGeolocation.start();
        BackgroundGeolocation.getCurrentLocation(location => {this.init(location)
        //  console.log(JSON.stringify(location))
        });
        DeviceBattery.getBatteryLevel().then(level => {
          this.setState({batteryState: level}) // between 0 and 1
        });
        // to attach a listener
        this.kalmanFilterLat = new KalmanFilter({R: 0.01, Q: 30, B: 1});
        this.kalmanFilterLong = new KalmanFilter({R: 0.01, Q: 30, B: 1});
        DeviceBattery.addListener(this.onBatteryStateChanged);
        let timer = setInterval(this.getCurrentLocation_func, this.state.timerForReadLocation);
        this.setState({timer});
  }
//-------------------------------------------------------------------------------------------
  init(location){
    var a = [];
    var b = [];
    this.setState({region : {
      latitude : location.latitude,
      longitude : location.longitude,
      latitudeDelta : 0.01,
      longitudeDelta : 0.01,
    }});
    this.centerMap(100)
    this.lastAccuracy = location.accuracy
    var coordinate = {
      latitude: location.latitude,
      longitude: location.longitude,
    }
    this.setState({coordinates: coordinate})
    lat = coordinate.latitude
    long = coordinate.longitude
  //this.state.LocationArray.concat([coordinate])
   // this.setState({coordinates1: coordinate})
    console.log('init func coordinates : ',JSON.stringify(this.state.coordinates));
    a.push({
    latitude: location.latitude,
    longitude: location.longitude,
    routeCoordinates: [],
    distanceTravelled: 0,
    prevLatLng: {},
    coordinate: new AnimatedRegion({
      latitude: location.latitude,
      longitude: location.latitude,
      latitudeDelta : 0.01,
      longitudeDelta : 0.01,
    }),
    color: 'purple',
    title: 'filtered data',
    id : 0
    });
    this.setState({Markers: a})
    //this.setState({Markersa: a})
    console.log('Markersa111 ', JSON.stringify(this.state.Markersa))
    this.showRealData(coordinate)
    //this.showRealData1(coordinate)
    this.setState({speed: location.speed})
    this.initTimerToSend();
    console.log('initialized speed', JSON.stringify(location))
    this.sendBySpeed(this.state.speed);
    //this.initTimerToSend();
  }
//-------------------------------------------------------------------------------------------
  centerMap(d){
    const {
      latitude,longitude,
      latitudeDelta,longitudeDelta
    } = this.state.region
    this.map.animateToRegion({
      latitude,longitude,latitudeDelta,longitudeDelta}, d);
  }
//-------------------------------------------------------------------------------------------
  initSetting(){
    console.log(' map for init setting');
    DB.transaction((tx) => {
      console.log("execute transaction");
        tx.executeSql('select value from Settings where setting_name=?', ['mapType'], (tx, results) => {
              console.log('map Results', results.rows.length);
              if (results.rows.length > 0) {
                this.state.mapType = results.rows.item(0).value
                console.log('map inti setting : ' + this.state.mapType)
              } else { console.log('can not find map type setting ') }
        });
        tx.executeSql('select value from Settings where setting_name=?', ['markerImage'], (tx, results) => {
          console.log('marker Results', results.rows.length);
          if (results.rows.length > 0) {
            if (results.rows.item(0).value[0] != 'a')
              this.setState({borderWidth: 5})
            else if (results.rows.item(0).value[0] == 'a')
              this.setState({borderWidth: 0})
            this.setState({markerImage : {uri: results.rows.item(0).value}})
            console.log('marker inti setting : ' + JSON.stringify(this.state.markerImage))
          } else { console.log('can not find marker setting ') }
      });
    });
    //this.sendBySpeed(this.state.speed);
  }
//-------------------------------------------------------------------------------------------
  onBatteryStateChanged = (state) => {
    this.setState({batteryState: state.level})
  };
//-------------------------------------------------------------------------------------------
  createDir(){
    RNFS.mkdir(RNFS.DocumentDirectoryPath+'/images').then( result => {
      console.log('GOT RESULT mkdir ', result);
    }).then(contents => {
      console.log('contents mkdir'+ contents);
    }) .catch((err) => {
      console.log('contents error mkdir' + err.message, err.code);
    });
  }
//-------------------------------------------------------------------------------------------
  componentDidMount(){
    this.smsId = 0;
    this.initSetting(); 
    this.createDir();
    this.start();
   
    SmsListener.addListener(message => parseMessage(message));
    const { navigation } = this.props;
    this.focusListener = navigation.addListener('didFocus', () => {
      this.initTimerToSend();
      if(this.props.navigation.state.params != null){
        //console.log(' navigation param : ' + JSON.stringify(this.props.navigation.state.params));
        const str = JSON.stringify(this.props.navigation.state.params);
        JSON.parse(str, (key,value) => {
          if(key == 'name' && value == 'profile'){
            //console.log(value);
            this.initSetting();
            
          }
        })
      } else {// console.log( ' is nul ')
    }
    });
   }
 
//-------------------------------------------------------------------------------------------
  render(){
    return (
       <Fragment>
            <MapView
              ref={ref => {this.map = ref}}
              style={{flex:1, height: '100%', width: '100%'}}
              mapType={this.state.mapType}
             // showsUserLocation={true}
              //showsMyLocationButton={false}
              rotateEnabled={true}
              initialRegion={this.state.region}>

              {this.state.Markers.map(poly => {
                return (
                  <Polyline
                    key={`poly_${poly.id}`}
                    coordinates={poly.routeCoordinates}
                    strokeWidth={5} strokeColor= {'red'}> 
                  </Polyline> );
               })}


              {this.state.Markers.map(marker => {
                return (
                  <Marker
                      key={`marker_${marker.id}`}
                      tracksViewChanges={true}
                      coordinate={{
                      latitude: marker.latitude,
                      longitude: marker.longitude}}
                      onPress={()=> alert('afajkl')}
                      >
                         <Image source={this.state.markerImage == '' ? {uri: ' asset:/images/marker2.png'}
                          :this.state.markerImage} 
                          style={{width: 55, height: 55, borderRadius: 80, 
                            borderColor: 'white', borderWidth: this.state.borderWidth,
                            shadowColor: '#000000',
                            shadowRadius: 7, shadowOpacity: 1.0,
                            }} resizeMode={'cover'}/>
                    </Marker> );
                })}
              
            </MapView>
              <View style={[styles.felan,{height: 100}]}>
                <Text > Real Speed : {this.state.speed} </Text>
                <Text > Battery State : {this.state.batteryState} </Text>
                <Text > accuracy : {this.state.accuracy} </Text>
                <Text > timer : {this.state.timerForReadLocation} </Text>
                <Text > geolen : {this.state.geolen} </Text>
                <Text > latitude : {(this.state.coordinates.latitude)} </Text>
                <Text > longitude : {(this.state.coordinates.longitude)} </Text>
              </View>
              <View style={styles.MapTypeMenuStyle}>
                <MapTypeMenu onChange={mapType => this.changeMapType(mapType)}></MapTypeMenu>
              </View>
              <CurrentLocationButton cb ={() => {this.centerMap(500)}}/>
          </Fragment>
    );
  }
//-------------------------------------------------------------------------------------------
changeMapType(mapType){
  console.log(' update map type setting');
   DB.transaction((tx) => {
     console.log("execute transaction");
       tx.executeSql('update Settings set value=? where setting_name=?', [mapType,'mapType'], 
           (tx, results) => {
             console.log('Results', results.rowsAffected);
             if (results.rowsAffected > 0) {
              this.setState({mapType: mapType})
               console.log('map type update : ' + results.rowsAffected)
             } else { console.log('can not find map type setting ') }  
       });
   });
}
//-------------------------------------------------------------------------------------------
  animateMarker (index){
    
    const routeCoordinates = this.state.Markers[index].routeCoordinates;
    const distanceTravelled = this.state.Markers[index].distanceTravelled;
    const { latitude, longitude } = this.state.coordinates;
    const newCoordinate = { latitude, longitude };
      if (this.marker) {
        this.marker._component.animateMarkerToCoordinate(newCoordinate,  1000);
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
  //-------------------------------------------------------------------------------------------
  // animateMarker1 (index){
  //   console.log(' in animate marker1 : ', JSON.stringify(this.state.Markersa[index]))
  //   const routeCoordinates = this.state.Markersa[index].routeCoordinates;
  //   const distanceTravelled = this.state.Markersa[index].distanceTravelled;
  //   const { latitude, longitude } = this.state.coordinates1;
  //   const newCoordinate = { latitude, longitude };
  //     if (this.marker1) {
  //       this.marker1._component.animateMarkerToCoordinate(newCoordinate, 1000);
  //     }
  //   let a = this.state.Markersa; //creates the clone of the state
  //   a[index] = {latitude,
  //               longitude,
  //               routeCoordinates: routeCoordinates.concat([newCoordinate]),
  //               distanceTravelled:
  //                 distanceTravelled + this.calcDistance(newCoordinate, index),
  //               prevLatLng: newCoordinate,
  //               color: a[index].color,
  //               title: a[index].title};
  //   this.setState({Markersa: a});
  // }
//-------------------------------------------------------------------------------------------
  showRealData(coordinate){
    index = 0;
    this.setState({coordinates : coordinate});
    lat = coordinate.latitude
    long = coordinate.longitude
    this.setState({region: {
        latitude: coordinate.latitude,
        longitude: coordinate.longitude,
        latitudeDelta: this.state.region.latitudeDelta,
        longitudeDelta: this.state.region.latitudeDelta,
      }});
    this.animateMarker(index);
    this.sendBySpeed(this.state.speed);
      console.log('send speed ', this.state.speed)
  }
//-------------------------------------------------------------------------------------------
  showRealData1(){
   // this.state.LocationArray.push(coordinate);
    //console.log(' in show real data1',JSON.stringify(this.state.LocationArray))
    //this.getAVGlocation();
    // index = 0;
    // this.setState({coordinates1 : coordinate});
    // this.setState({region: {
    //     latitude: coordinate.latitude,
    //     longitude: coordinate.longitude,
    //     latitudeDelta: this.state.region.latitudeDelta,
    //     longitudeDelta: this.state.region.latitudeDelta,
    //   }});
    // this.animateMarker1(index);
    //this.sendBySpeed(this.state.speed);
     // console.log('send speed ', this.state.speed)
  }
//-------------------------------------------------------------------------------------------
  getCurrentLocation_func = () => {
    RNAndroidLocationEnabler.promptForEnableLocationIfNeeded({interval: 10000, fastInterval: 5000})
    BackgroundGeolocation.getCurrentLocation(location => {
      this.setState({speed: location.speed==null?0:location.speed});
      console.log('initialized speed', location.speed==null?0:location.speed)
      this.setState({accuracy: location.accuracy});
      //console.log('accuracy : '+location.accuracy)
     // this.state.LocationArray.concat([{latitude: location.latitude, longitude: location.longitude}]);
      //this.showRealData1()
    if(location.speed > 1 && location.accuracy < 27){
      this.showRealData({latitude: location.latitude, longitude: location.longitude})
      if(this.lastLat != location.latitude && this.lastLong != location.longitude)
        insertLocation(location.latitude, location.longitude, this.lastLat, this.lastLong)
      this.lastLat = location.latitude;
      this.lastLong = location.longitude;
      this.kalmanFilterLat = new KalmanFilter({R: 0.01, Q: 20, B: 1});
      this.kalmanFilterLong = new KalmanFilter({R: 0.01, Q: 20,  B: 1});
    } else{
    if (this.count == 0){
      if(this.firstOK == false && location.speed < 2){
        location.accuracy > 70 && location.accuracy < 90 ?  this.state.geolen = 6 : 
          (location.accuracy > 50 ?  this.state.geolen = 7 :
          (location.accuracy > 30 ?  this.state.geolen = 8 : 
            (location.accuracy > 15 ?  this.state.geolen = 9 : 
              (location.accuracy > 2 ?  this.state.geolen = 10 :  this.state.geolen = 11 ))))
        if(location.accuracy < 90)
          this.lastAccuracy = location.accuracy
        //console.log('if1 count :  '+this.count+' last accuracy : '+this.lastAccuracy+' location accuracy : '+location.accuracy)
        this.calcLocation({latitude: location.latitude, longitude: location.longitude});
        this.firstOK = true
      }
      else if (this.firstOK == true && ( Math.abs(location.accuracy - this.lastAccuracy) < 10 || location.accuracy < this.lastAccuracy )){
        //console.log('if2 count :  '+this.count+' last accuracy : '+this.lastAccuracy+' location accuracy : '+location.accuracy)
        this.calcLocation({latitude: location.latitude, longitude: location.longitude});
      } else {
        this.firstOK = false
        //console.log('if3 count :  '+this.count+' last accuracy : '+this.lastAccuracy+' location accuracy : '+location.accuracy)
      }
      location.accuracy > 100 && location.accuracy < 120 ?  this.state.geolen = 6 : 
          (location.accuracy > 50 ?  this.state.geolen = 7 :
          (location.accuracy > 30 ?  this.state.geolen = 8 : 
            (location.accuracy > 15 ?  this.state.geolen = 9 : 
              (location.accuracy > 2 ?  this.state.geolen = 10 :  this.state.geolen = 11 ))))
        if(location.accuracy < 121)
          this.lastAccuracy = location.accuracy
    }
    else if((Math.abs(location.accuracy - this.lastAccuracy) < 10 || location.accuracy < this.lastAccuracy )){
      this.lastAccuracy = location.accuracy
      this.calcLocation({latitude: location.latitude, longitude: location.longitude});
      //console.log('else count :  '+this.count+' last accuracy : '+this.lastAccuracy+' location accuracy : '+location.accuracy)
    } else {
      this.count = 0
    }}   
   })
  }
//-------------------------------------------------------------------------------------------
  calcLocation(location ){
    if(this.count == 0){
      this.geohash = Geohash.encode(location.latitude, location.longitude, this.state.geolen)
      if (this.geohash == this.lastGeohash) {
        //console.log('equl')
        this.count = 0
      }
      this.loc = location
      this.count = this.count+1
      //console.log('first encoded geohash : ' + this.geohash)
    }
    else {
      var g1 = Geohash.encode(location.latitude, location.longitude, this.state.geolen);
      if(this.geohash == g1) this.correct= this.correct+1;
      //console.log( this.count + ' encoded geohash : ' + g1)
      //console.log('correct : ' + this.correct)
      this.count = this.count+1

    if(this.correct > 2){
      //console.log(' show real data latitude in geohash: '+JSON.stringify(this.loc.latitude))
      this.setState({region: {
        latitude: this.loc.latitude,//lat,
        longitude: this.loc.longitude,//long,
        latitudeDelta: this.state.region.latitudeDelta,
        longitudeDelta: this.state.region.latitudeDelta,
      }});
      
      this.correct = 0; this.count = 0;
      var lat = this.kalmanFilterLat.filter(this.loc.latitude)
      var long = this.kalmanFilterLong.filter(this.loc.longitude)
      let coords = {latitude: lat, longitude: long};
      //console.log('real : '+JSON.stringify({latitude: this.loc.latitude, longitude: this.loc.longitude}))
      //console.log('filtered : '+JSON.stringify(coords))
      this.showRealData(coords);
      if(this.lastLat != location.latitude && this.lastLong != location.longitude)
        insertLocation(coords.latitude, coords.longitude, this.lastLat, this.lastLong)         
      this.lastLat = coords.latitude;
      this.lastLong = coords.longitude;
      this.lastGeohash = this.geohash
    }
    else if( this.count > 3) {
      this.correct = 0; this.count = 0;
      //console.log('geohash else if count :  '+this.count)
     }
   }
}
//-------------------------------------------------------------------------------------------
  componentWillUnmount() {  
    BackgroundGeolocation.removeAllListeners()
    clearInterval(this.state.timer);
    for(let i=0; i<this.timer.length; ++i){
      clearInterval(this.timer[i]);
    }
  }
  //-------------------------------------------------------------------------------------------
  getTime(){
    var today = new Date();
      var date = today.getFullYear()+'-'+(today.getMonth()+1<10? '0'+(today.getMonth()+1) : today.getMonth()+1)+
        '-'+(today.getDate()<10? '0'+today.getDate() : today.getDate());
      var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
      var dateTime = date+' '+time;
      this.time = dateTime
      console.log('in get time : ', time)
  }
//-------------------------------------------------------------------------------------------
initTimerToSend(){
  console.log(' timer init')
  DB.transaction(tx => {
      tx.executeSql('select phone_no, sending_setting, interval from Users', [], (tx, results) => {
        console.log(' timer Results', JSON.stringify(results.rows));
        if (results.rows.length > 0) {
          for(let i=0; i<results.rows.length; ++i){

            for(let k=0; k<this.timer.length; ++k)
                clearInterval(this.timer[k])
              this.timer = []

            this.clearAllIntervals()
            this.speedSend = []

            console.log(' timer Results', results.rows.item(i).phone_no, results.rows.item(i).sending_setting, results.rows.item(i).interval*1000);
            if(results.rows.item(i).sending_setting == "interval"){
              //console.log('timer setting intervallllllllllllllllllllllllllllllllllllllllllll')
              var lat = this.state.coordinates.latitude
              var long = this.state.coordinates.longitude
              this.getTime()
              let timer = setInterval(this.sendsms, 1000*results.rows.item(i).interval, results.rows.item(i).phone_no,lat, long, this.state.batteryState, this.time, this.state)
              
              //let timer = setInterval(this.sendsms(results.rows.item(i).phone_no,lat, long, this.state.batteryState, this.time),1000*results.rows.item(i).interval )
              this.timer.push(timer);
              console.log('timer setting after push', this.timer)

            } else if(results.rows.item(i).sending_setting == "speed"){
              
              this.speedSend.push(results.rows.item(i).phone_no)
              console.log('timer setting speed', this.speedSend)
              this.sendBySpeed(this.state.speed)
            }
          }
          console.log('timer inti setting ')
        } else { console.log('can not find timer setting ') }
    });
  });
}
//-------------------------------------------------------------------------------------------
sendBySpeed(speed){ //send between [1-20]s
  this.getTime()
  console.log('interval : ',this.speedInterval,'phone_no : ', JSON.stringify(this.speedSend), 
    'coordinates : ', JSON.stringify(this.state.coordinates))
  var lat = this.state.coordinates.latitude;
  var long = this.state.coordinates.longitude;
  console.log('in send by speed : ', lat , long)
  
  if(speed == 0){
    if( this.speedInterval != 600){
      this.clearAllIntervals();
      this.speedInterval = 600
      for(let i=0; i<this.speedSend.length; ++i){
        this.getTime()
        let timer = setInterval(this.sendsms, 1000*this.speedInterval, this.speedSend[i],lat, long, this.state.batteryState, this.time, this.state);//45
        this.smsId = this.smsId+1
        this.timer.push(timer);
      }
    }
  }
  else if(speed < 2 ){ // walking
    if( this.speedInterval != 25){
      this.clearAllIntervals();
      this.speedInterval = 25
      for(let i=0; i<this.speedSend.length; ++i){
        this.getTime()
        let timer = setInterval(this.sendsms, 1000*this.speedInterval,  this.speedSend[i],lat, long, this.state.batteryState, this.time, this.state);//13
        this.smsId = this.smsId+1 
        this.timer.push(timer);
      }
    }
  } else if(speed < 5){ // running
    if( this.speedInterval != 15){
      this.clearAllIntervals();
      this.speedInterval = 15
      for(let i=0; i<this.speedSend.length; ++i){
        this.getTime()
        let timer = setInterval(this.sendsms, 1000*this.speedInterval,  this.speedSend[i],lat, long, this.state.batteryState, this.time, this.state);//8
        this.smsId = this.smsId+1
        this.timer.push(timer);
      }
    }
  } else if(speed < 10){ // trafic
    if( this.speedInterval != 7){
      this.clearAllIntervals();
      this.speedInterval = 7
      for(let i=0; i<this.speedSend.length; ++i){
        this.getTime()
        let timer = setInterval(this.sendsms, 1000*this.speedInterval, this.speedSend[i],lat, long, this.state.batteryState, this.time , this.state);//4
        this.smsId = this.smsId+1
        this.timer.push(timer);
      }
    }
  } else if(speed < 30){ // car
    if( this.speedInterval != 3){
      this.clearAllIntervals();
      this.speedInterval = 3
      for(let i=0; i<this.speedSend.length; ++i){
        this.getTime()
        let timer = setInterval(this.sendsms, 1000*this.speedInterval ,this.speedSend[i],lat, long, this.state.batteryState, this.time, this.state);//2
        this.smsId = this.smsId+1
        this.timer.push(timer);
      }
    }
  } 
  //console.log('this.smsid : ', this.smsId)
  //console.log('send by speed : ',this.speedInterval, JSON.stringify(this.speedSend))
}
//-------------------------------------------------------------------------------------------
clearAllIntervals(){
  for(let i=0; i<this.speedSend.length; ++i){
    clearInterval(this.speedSend[i]);
  }
}
//-------------------------------------------------------------------------------------------
sendsms(phoneNumber, lat, long, batteryState, time, state){ 
  send(phoneNumber, lat, long, batteryState, time, state)
 }

 
//-------------------------------------------------------------------------------------------
// getAVGlocation(){
//   var index = 0;
//   var latitudeSum = 0;
//   var longitudSum = 0;

//   console.log('in get avg location ',JSON.stringify(this.state.LocationArray))
//   for(i=0; i<this.state.LocationArray.length; ++i){
//       latitudeSum += this.state.LocationArray[i].latitude;
//       longitudSum += this.state.LocationArray[i].longitude;
//   }
//   var latitudeAvg = latitudeSum/this.state.LocationArray.length;
//   var longitudeAvg = longitudSum/this.state.LocationArray.length;

//   var coords = {latitude: latitudeAvg, longitude: longitudeAvg};
//   //var a = this.state.coordinates1;
//   //a[index] = coords;
//   this.setState({coordinates1 : coords});
//   console.log('\n index avg: '+ index, JSON.stringify(this.state.coordinates1))
//   //this.animateMarker1();
// }
//-------------------------------------------------------------------------------------------
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
//-------------------------------------------------------------------------------------------
  calcDistance = (newLatLng, index) => {
    const  prevLatLng  = this.state.Markers[index].prevLatLng;
    return haversine(prevLatLng, newLatLng) || 0;
  };
//-------------------------------------------------------------------------------------------
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
                  style={{paddingHorizontal:10, height: '100%', alignItems:'center',
                  justifyContent: 'center'}}>
                    <MaterialCommunityIcons name={"dots-vertical"}
                      style={{alignSelf:'center', margin: 6}} size={30} color={'#ffffff'}
                    />
                  </TouchableOpacity>}>
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
                height: '100%',
                alignItems:'center',
                justifyContent: 'center',
                marginRight: 3,
              }}
              onPress={() => navigation.navigate('AddPerson',{name: 'map'})}>
              <MaterialCommunityIcons name={"account-plus"}
                style={{alignSelf:'center', margin: 10}} size={25} color={'#ffffff'}
              />
            </TouchableOpacity>
          </View>
        ),
      }
    }
}
function send(phoneNumber, lat1, long1, batteryState, time, state){
  var today = new Date();
  var date = today.getFullYear()+'-'+(today.getMonth()+1<10? '0'+(today.getMonth()+1) : today.getMonth()+1)+
    '-'+(today.getDate()<10? '0'+today.getDate() : today.getDate());
  var time = today.getHours() + ":" + today.getMinutes()  + ":" + today.getSeconds();
  var dateTime = date+' '+time; 
  //this.time = dateTime

  console.log('in send sms testttt', lat, long)

var battery = Math.round(batteryState * 100) / 100
console.log('in send by sms : ', 'send it******************8', batteryState )
var message = 'hello location long:' + long + ' lat:' + lat +' battery:' + battery + ' time:'+ dateTime ;
SmsAndroid.autoSend(phoneNumber, message, (fail) => {
   console.log("Failed with this error: " + fail)
}, (success) => { 
 
   console.log("SMS sent successfully" + success);
});
// this.smsId = this.smsId + 1;
console.log('local variable message : ', message)
 }