import React, {Component} from 'react';  
import {Image, StyleSheet, Text, View, Animated, FlatList, TouchableOpacity, Dimensions} from 'react-native';  
import SQLite from "react-native-sqlite-storage";
import {deleteUser} from '../functions/deleteUser.js';
import {styles} from '../style.js';

const color = '#028687';

SQLite.DEBUG(true);
SQLite.enablePromise(false);

var DB = SQLite.openDatabase(
    {name : "db", createFromLocation : "~db.sqlite"});

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

  componentDidMount(){
    
  }

  removePeople(str) {
    console.log('ini remove people '+JSON.stringify(this.state.FlatListItems))
    var array = [...this.state.FlatListItems]; // make a separate copy of the array
    var index = -1;
    for(let i=0; i<array.length; ++i){
      if(array[i].key == str)
        index = i;
    }
    console.log('index '+ index)
    if (index !== -1) {
      array.splice(index, 1);
      this.setState({FlatListItems: array});
      console.log('after remove people '+JSON.stringify(this.state.FlatListItems))
    }
  }

  DeleteButton(str){
    if (str == ''){
      alert("Please fill in the blanks!")
    } else {
      console.log('delete user by phone : '+ str);
      deleteUser(str);
      console.log(JSON.stringify(this.state.FlatListItems))
      this.removePeople(str);
      //console.log(JSON.stringify(this.state.FlatListItems))
    }
  }

  init(){
    console.log(' init flat list');
    var a = [];
    var image = null ;
    DB.transaction((tx) => {
      console.log("execute transaction");
        tx.executeSql('select phone_no, user_id, first_name, last_name from Users ', [], (tx, results) => {
              console.log('Results', results.rows.length);
              if (results.rows.length > 0) {
                
                for(let i=0; i<results.rows.length; ++i){
                  console.log('Resultsss', JSON.stringify(results.rows.item(i)));
                    a.push({
                        user_id : results.rows.item(i).user_id,
                        key : results.rows.item(i).phone_no,
                        first_name : results.rows.item(i).first_name,
                        last_name : results.rows.item(i).last_name,
                        image: require('../asset/defaultProfile.png')
                    });
                }
                console.log('select users to flat list Successfully' + JSON.stringify(a));
                //this.setState({FlatListItems: a})
                console.log('select users to flat list Successfully' + JSON.stringify(this.state.FlatListItems));
              } else { console.log('no user'); }  
        });
        tx.executeSql('select user_image from Users ', [], (tx, results) => {
          console.log('Results', results.rows.length);
          if (results.rows.length > 0) {
            var b = a;
            for(let j=0; j<results.rows.length; ++j){
              JSON.parse(results.rows.item(j).user_image, (key,value) => {
                if(key == 'uri') 
                  image = {uri : value}
                else if (key == 'require')
                  image = require('../asset/defaultProfile.png')
              });
              b[j].image = image; 
              console.log('select images to flat list Successfully ' + JSON.stringify(image));
            }
            this.setState({FlatListItems: b})
          } else { console.log('can not get image'); }  
        })
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

  render() {  
   return (  
    <View style={style.MainContainer}>
    <FlatList
      data={ this.state.FlatListItems }   
      ItemSeparatorComponent = {this.FlatListItemSeparator}
      renderItem={({item}) => 
      <TouchableOpacity>
      <View key={String(item.key).split(' ')[0]} style={style.itemContainer}>
          <View style={{flex: 1}}>
              <Image source={item.image} style={style.userImage}/>
          </View>
          <View style={{flexDirection: 'column', flex: 5, marginTop: 10}}>
            <Text style={{ marginHorizontal: 20, fontSize: 15}}>{item.first_name} {item.last_name}</Text>
            <Text style={{ marginHorizontal: 20, fontSize: 12}}>{item.key}</Text>
          </View>
          <View style={{flex: 1, alignSelf: 'center'}}>
              <TouchableOpacity onPress={() =>{
                this.setState({delete_phone_no: String(item.key)})
                console.log('delete phone number: '+this.state.delete_phone_no)
                this.DeleteButton(String(item.key))
                }}>
                  <Image  source={require('../asset/removeIcon.png')} style={style.iconImage}/>
              </TouchableOpacity>
          </View>
      </View>
      </TouchableOpacity>
      }
    /> 
  </View>   
    );
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
    borderRadius: 50, borderColor: color, borderWidth: 2, alignSelf: 'center'
},
iconImage:{height: 30, width: 30, alignSelf: 'center', alignContent: 'center'}
});
