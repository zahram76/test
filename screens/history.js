import React, {Component} from 'react';
import {View, Text, TouchableOpacity, Image, StyleSheet, FlatList} from "react-native";
import SQLite from "react-native-sqlite-storage";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

const color = '#349e9f';
var DB = SQLite.openDatabase({name : "db", createFromLocation : "~db.sqlite"});

export default class History extends Component {
  constructor(){
    super();
    this.state = {
      FlatListItems: []
    }
    this.locationDataInit();
  }
//-------------------------------------------------------------------------------------------
FlatListItemSeparator = () => {
  return (
    <View
      style={{
        height: 1,
        width: "100%",
        backgroundColor: "#DBDBDB"}}/>);
  }
//-------------------------------------------------------------------------------------------
locationDataInit(){
  var lastDate = '';
  var a = []
    DB.transaction((tx) => {
        console.log("execute transaction");
          tx.executeSql('select datatime, latitude from Locations', [], (tx, results) => {
                console.log('Results', results.rows.item(0).latitude);
                if (results.rows.length > 0) {
                  for(let i=0; i<results.rows.length; ++i){  
                    var date = results.rows.item(i).datatime.split(' ')[0]
                    if(date != lastDate){
                      a.push({
                        key: `date_${i}`,
                        datetime: results.rows.item(i).datatime,
                        date: date
                      })
                      lastDate = date
                    }  
                  }
                  this.setState({FlatListItems: a})
                  console.log('Resultsss', JSON.stringify(this.state.FlatListItems));
                  console.log('select location to flat list Successfully');
                } else { console.log('no location'); }  
          });
        });    
}
//-------------------------------------------------------------------------------------------
  componentDidMount(){
   // this.locationDataInit();
  }
//-------------------------------------------------------------------------------------------
  render(){
    return (
    <View style={style.MainContainer}>
    <FlatList
      data={ this.state.FlatListItems }   
      ItemSeparatorComponent = {this.FlatListItemSeparator}
      renderItem={({item}) => 
      <TouchableOpacity onPress={() => {this.props.navigation.navigate('HistoryShowOnMap',{date: item.datetime})}}> 
        <View key={item.key} style={style.itemContainer}>
          <View style={{flex: 1}}>
              <Image source={require('../asset/day.png')} style={style.userImage}/>
          </View>
          <View style={{flexDirection: 'column', flex: 5, marginTop: 13}}>
            <Text style={{ marginHorizontal: 20, fontSize: 18}}>{item.date}</Text>
          </View>
        </View>
      </TouchableOpacity>
      }
    /> 
  </View>   
  );
}
//-------------------------------------------------------------------------------------------
  static navigationOptions = ({ navigation }) => {
    return {
        title: 'History',
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
              onPress={ () => { navigation.navigate('Profile') }} />
            </View>
        ),
      }
    }
}

const style = StyleSheet.create({
  MainContainer :{
  // Setting up View inside content in Vertically center.
    justifyContent: 'center',
    flex:1,
  },
  item: {
    padding: 10,
    fontSize: 18,
    height: 44,
  },
  container: {
    position: 'absolute',
    width: 45,
    backgroundColor: '#ffffff',
},
itemContainer: {
  flex: 1, flexDirection: 'row', 
  backgroundColor: 'white', padding: 15
},
userImage: {
  height: 55, width: 55, 
    borderRadius: 50, borderColor: 'white', borderWidth: 2, alignSelf: 'center'
},
iconImage:{height: 30, width: 30, alignSelf: 'center', alignContent: 'center'}
});
