import React ,{ Component } from 'react';  
import {Image, StyleSheet, Text, View, Animated, FlatList, TouchableOpacity, Dimensions} from 'react-native';  
import SQLite from "react-native-sqlite-storage";
import { CheckBox } from 'react-native-elements';
import {styles} from '../style.js';

const color = '#349e9f';
SQLite.DEBUG(true);

var DB = SQLite.openDatabase({name : "db", createFromLocation : "~db.sqlite"});
const imageOptions = [
    require('../images/defaultMap.png'),
    require('../images/sateliteMap.png'),
    require('../images/terrianMap.png')
];

export default class MapSetting extends Component {
constructor(){
    super();
    this.state =  {
        maptype: '',
        FlatListItems: [{
            key: 'MapType_1',
            name: 'standard',
            checked: false, 
            image: require('../images/defaultMap.png')
        },{
            key: 'MapType_2',
            name: 'satellite',
            checked: false,
            image: require('../images/sateliteMap.png'),
        },{
            key: 'MapType_3',
            name: 'terrain',
            checked: false,
            image: require('../images/terrianMap.png'),
        }],
        border1: null,
        border2: null,
        border3: null,
    }
    this.init();
}
   
init(){
    console.log(' map type setting');
    DB.transaction((tx) => {
      console.log("execute transaction");
        tx.executeSql('select value from Settings where setting_name=?', ['mapType'], (tx, results) => {
              console.log('Results', results.rows.length);
              if (results.rows.length > 0) {
                this.state.maptype = results.rows.item(0).value
                for(let i=0; i<this.state.FlatListItems.length; ++i){
                  if(this.state.FlatListItems[i].name == this.state.maptype){
                    this.state.FlatListItems[i].checked = true
                  }
                }
                console.log('map type : ' + this.state.maptype)
              } else { console.log('can not find map type setting ') }  
        });
    });
}

FlatListItemSeparator = () => {
    return (
      <View
        style={{
          height: 1,
          width: "100%",
          backgroundColor: "#DBDBDB"}}/>);
  }

changeType(name){
   this.setState({maptype: name}); 
   console.log(' update map type setting');
    DB.transaction((tx) => {
      console.log("execute transaction");
        tx.executeSql('update Settings set value=? where setting_name=?', [this.state.maptype,'mapType'], 
            (tx, results) => {
              console.log('Results', results.rowsAffected);
              if (results.rowsAffected > 0) {
                console.log('map type update : ' + results.rowsAffected)
              } else { console.log('can not find map type setting ') }  
        });
    });
}

componentWillUnmount(){
   // this.props.navigation.setParams({ name: 'Lucy' })
}

render(){
return (  
  <View style={style.MainContainer}>
    <FlatList
      data={ this.state.FlatListItems }   
      ItemSeparatorComponent = {this.FlatListItemSeparator}
      renderItem={({item}) => 
      <TouchableOpacity onPress={()=> {this.changeType(item.name); this.select(item.name)}}>
      <View key={item.key} 
        style={style.itemContainer}>
          <View style={{flex: 1}}>
              <Image source={item.image} style={style.userImage}/>
          </View>
          <View style={{flexDirection: 'column', flex: 5, marginTop: 15}}>
            <Text style={{ marginHorizontal: 20, fontSize: 17}}>{item.name}</Text>
          </View>
          <View style={{flex: 1, alignSelf: 'center'}}>
            <Image source={item.name == 'standard'? this.state.border1 : item.name=='satellite'?
            this.state.border2 : item.name=='terrain' ? this.state.border3 : null} />
          </View>
      </View>
      </TouchableOpacity>
      }
    /> 
  </View>   
    );
}

  select(name){
    if(name == 'standard'){
      this.setState({border1: {uri: 'asset:/images/checkbox.png'}})
      this.setState({border2: null})
      this.setState({border3: null})
    } else if(name == 'satellite'){
      this.setState({border1: null})
      this.setState({border2: {uri: 'asset:/images/checkbox.png'}})
      this.setState({border3: null})
    } else if(name == 'terrain'){
      this.setState({border1: null })
      this.setState({border2: null })
      this.setState({border3: {uri: 'asset:/images/checkbox.png'}})
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
    borderRadius: 10, borderColor: '#ffffff', borderWidth: 2, alignSelf: 'center'
},
iconImage:{height: 30, width: 30, alignSelf: 'center', alignContent: 'center'}
});
