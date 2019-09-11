import React, {Component, Fragment} from 'react';
import {Dimensions, View, Text, AppRegistry, TouchableOpacity, Image} from "react-native";
import MapView, {Marker, AnimatedRegion, Polyline, Circle} from "react-native-maps";
import SQLite from "react-native-sqlite-storage";
import haversine from "haversine";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import {deleteLacation} from '../functions/deleteLocation.js';

const color = '#349e9f';
var DB = SQLite.openDatabase({name : "db", createFromLocation : "~db.sqlite"});
const LATITUDE =  0;
const LONGITUDE = 0;
let { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.01;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;
       
export default class HistoryShowOnMap extends Component {
  constructor(){
    super();
    this.state = {
      mapType: "standard",
      Markers:[],
      region:{
        latitude: 0,
        longitude: 0,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA
      },
      data : {
          routeCoordinates: []
      }
    };
    this.dateGetter
   // deleteLacation()
  }
//-------------------------------------------------------------------------------------------
  
//-------------------------------------------------------------------------------------------
locationDataInit(value){
    var a=[]
    var newCoordinate;
    DB.transaction((tx) => {
        console.log("execute transaction");
          tx.executeSql('select loc_id, latitude, longitude from Locations where substr(datatime,1,10)=?', [ value.split(' ')[0] ], (tx, results) => {
                console.log('Resultsssssssss', results.rows.length ,value.split(' ')[0]);
                if (results.rows.length > 0) {
                    console.log('lennnnnnnn : ' , JSON.stringify(results.rows.item(0)))
                  for(let i=0; i<results.rows.length; ++i){  
                    newCoordinate = {  
                        latitude: parseFloat(results.rows.item(i).latitude),
                        longitude: parseFloat(results.rows.item(i).longitude),
                    }  
                    //console.log('New coordiantes : '+JSON.stringify(newCoordinate))
                    a.push({
                      key : results.rows.item(i).loc_id,
                      coordinates: newCoordinate
                    })
                   
                    //console.log('New data : '+JSON.stringify(a))
                    this.setState({data : { 
                        routeCoordinates: this.state.data.routeCoordinates.concat([newCoordinate])
                    }})
                    //console.log('New data : '+JSON.stringify(this.state.data))
                    
                      console.log('Result 4'+ i);
                  }
                  this.setState({Markers : a})
                  this.setState({region:{
                    latitude: newCoordinate.latitude,
                    longitude: newCoordinate.longitude,
                    latitudeDelta: 0.006,
                    longitudeDelta: 0.006
                  }})
                 // console.log('result 1 : ', JSON.stringify(this.state.data) + 'result 2 : '+ JSON.stringify(this.state.Markers));
                  //var len = this.data.routeCoordinates.length
                  //console.log('Result 3'+ "len");
                  
                  this.centerMap(10)
                 
                  console.log('select location to flat list Successfully');
                } else { console.log('no location'); }  
          });
        });    
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
  componentDidMount(){
    const { navigation } = this.props;
    this.focusListener = navigation.addListener('didFocus', () => {
      if(this.props.navigation.state.params != null){
        console.log(' navigation param : ' + JSON.stringify(this.props.navigation.state.params));
        const str = JSON.stringify(this.props.navigation.state.params);
        JSON.parse(str, (key,value) => {
          if(key == 'date'){
            this.locationDataInit(value);
            console.log(value)
          }
        })
      } else { console.log( ' is nul ')}
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
          rotateEnabled={true}
          initialRegion={this.state.region}
          //onRegionChangeComplete={(region)=> this.setState({region})}
          >
          <Polyline
            coordinates={this.state.data.routeCoordinates}
            strokeWidth={5} strokeColor= {'purple'}>
          </Polyline> 
          {this.state.Markers.map(marker => {
              console.log('markers : '+JSON.stringify(marker))
            return (
              <Marker
                  key ={`marker_${marker.key}`}
                  tracksViewChanges={true}
                  coordinate={marker.coordinates}
                  onPress={()=> alert('afajkl')}
                  image={require('../asset/TrackingDot.png')}
                  >
               </Marker> );
            })}
         </MapView>
      </Fragment>
  );
}
//-------------------------------------------------------------------------------------------
 
//-------------------------------------------------------------------------------------------
  calcDistance = (newLatLng) => {
    const  prevLatLng  = this.state.Markers.prevLatLng;
    return haversine(prevLatLng, newLatLng) || 0;
  };
//-------------------------------------------------------------------------------------------
  static navigationOptions = ({ navigation }) => {
    return {
        title: 'History ',
        headerStyle: {
          backgroundColor: color,
          barStyle: "light-content", // or directly
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerLeft: (
          <View style={{marginLeft: 15}}>
            <MaterialCommunityIcons name={'arrow-left'} size={25} style={{color: 'white'}}
              onPress={ () => { navigation.navigate('History') }} />
            </View>
        ),
      }
    }
}