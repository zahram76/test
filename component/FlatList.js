import React, {Component} from 'react';  
import {Platform, Image, StyleSheet, Text, View, Animated, FlatList, TouchableOpacity, Dimensions} from 'react-native';  
import SQLite from "react-native-sqlite-storage";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import {styles} from '../style.js';

var DB = SQLite.openDatabase(
    {name : "db", createFromLocation : "~db.sqlite"});
    
const height = Dimensions.get('window').height;
const width = Dimensions.get('window').width;

export default class FlatListComponent extends Component {  
  constructor(){
      super()
      this.state = {
        FlatListItems: [],
        users: [],
        isReady: false,
      }
      this.init();
  }

  init(){
    console.log("execute transaction" + ' init flat list');
    DB.transaction((tx) => {
        tx.executeSql('select phone_no from Users', [], (tx, results) => {
              console.log('Results', results.rowsAffected);
              if (results.rows.length > 0) {
                var i;
                var a = [];
                for(i=0; i<results.rows.length; ++i){
                    a.push({key : results.rows.item(i).phone_no});
                    this.state.users.push({
                        user_id : results.rows.item(i).user_id,
                        phone_no : results.rows.item(i).phone_no,
                        first_name : results.rows.item(i).first_name,
                        last_name : results.rows.item(i).last_name,
                    });
                }
                this.setState({FlatListItems: a})
                alert('Success'+'\n'+'select users Successfully') 
                console.log('Success'+'\n'+'select users Successfully');
              } else {
                alert('select users Failed') 
                console.log('select users Failed');
              }  
        })
    });
}

  FlatListItemSeparator = () => {
    return (
      <View
        style={{
          height: 1,
          width: "100%",
          backgroundColor: "#DBDBDB",
        }}
      />
      );
    }

  GetItem (item) {
    alert(item);
  }

  _renderItem = ({item}) => {
      <TouchableOpacity>
          <Text>{item.key}</Text>
      </TouchableOpacity>
  }

  render() {  
   return (  
    <View style={style.MainContainer}>
      <FlatList
        data={ this.state.FlatListItems }   
        ItemSeparatorComponent = {this.FlatListItemSeparator}
        renderItem={({item}) => 

        <View key={item.key} style={{flex: 1, flexDirection: 'row', backgroundColor: 'white', padding: 20 }}>
            <View style={{flex: 1}}>
                <Image source={require('../asset/addIcon.png')} style={{height: 30, width: 30}}/>
            </View>
            <Text style={{flex: 7, marginTop: 2}}>{item.key}</Text>
            <View style={{flex: 1}}>
                <TouchableOpacity>
                    <Image  source={require('../asset/removeIcon.png')}style={{height: 30, width: 30}}/>
                </TouchableOpacity>
            </View>
        </View>
        }
      /> 
      <Text>{this.state.FlatListItems.key}</Text>
    </View>          
    );
  }
}

const style = StyleSheet.create({
  MainContainer :{
  // Setting up View inside content in Vertically center.
    justifyContent: 'center',
    flex:1,
    margin: 10
  },
  item: {
    padding: 10,
    fontSize: 18,
    height: 44,
  },
  container: {
    position: 'absolute',
    width: 45,
    //height: 45,
    backgroundColor: '#ffffff',
    //left: '10%',
    //justifyContent: 'space-around',
    //alignItems: 'center',
    //alignSelf: 'flex-end'
}
});
