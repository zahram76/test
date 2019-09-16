import React, {Component} from 'react';  
import {Image, StyleSheet, Text,Picker, View, Animated, TextInput, FlatList, TouchableOpacity, Dimensions} from 'react-native';  
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import SQLite from "react-native-sqlite-storage";
import { List, ListItem } from "react-native-elements";
import {deleteUser} from '../functions/deleteUser.js';
import {styles} from '../style.js';

var RNFS = require('react-native-fs');
const color = '#349e9f';

const ImageOptions = [
  require('../asset/error.png'),
  require('../asset/verified.png')
]

SQLite.DEBUG(true);
SQLite.enablePromise(false);

var DB = SQLite.openDatabase({name : "db", createFromLocation : "~db.sqlite"});

export default class TrackerUser extends Component {  
  constructor(){
      super()
      this.state = {
        FlatListItems: [],
        users: [],
        iscomplet: false,
        message: '',
        error: false,
        sendigType: 'interval',
        showInputInterval : true,
        interval : 20,
        bordercolor: '#DBDBDB',
        settingVisable : false
      }
      this.text = '';
      this.onFocusflag = true;
      this.init();
  }

  componentDidMount(){ 
    const { navigation } = this.props;
    //Adding an event listner om focus
    //So whenever the screen will have focus it will set the state to zero
    this.focusListener = navigation.addListener('didFocus', () => {
      if(this.props.navigation.state.params != null){
        console.log(' navigation param : ' + JSON.stringify(this.props.navigation.state.params));
        const str = JSON.stringify(this.props.navigation.state.params);
        JSON.parse(str, (key,value) => {
          if(key == 'name' && value == 'adduser'){ 
            this.init()
          }
          console.log(value);
        })  
      } else { console.log( ' is nul ')}
    });
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
    }
  }

  init(){
    console.log(' init flat list');
    var a = [];
    var image = null ;
    DB.transaction((tx) => {
      console.log("execute transaction");
        tx.executeSql('select phone_no, user_id, first_name, last_name, sending_setting, interval from Users ', [], (tx, results) => {
              console.log('Results', results.rows.length);
              if (results.rows.length > 0) {
                
                for(let i=0; i<results.rows.length; ++i){
                  console.log('Resultsss', JSON.stringify(results.rows.item(i)));
                    a.push({
                        user_id : results.rows.item(i).user_id,
                        key : results.rows.item(i).phone_no,
                        first_name : results.rows.item(i).first_name,
                        last_name : results.rows.item(i).last_name,
                        image: require('../asset/defaultProfile.png'),
                        selected: false,
                        selectedClass: style.container,
                        sendigType: results.rows.item(i).sending_setting,
                        interval: results.rows.item(i).interval==null?20:results.rows.item(i).interval,
                        showInputInterval: results.rows.item(i).sending_setting=='interval'?true: false
                    });
                }
                console.log('select users to flat list Successfully');
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
              console.log('select images to flat list Successfully ');
            }
            this.setState({FlatListItems: b})
          } else { console.log('can not get image'); }  
        })
    });
}

selectedItem= (item) => {
  item.selected = !item.selected;
  console.log('flat list ', item.selected)
  item.selectedClass = item.selected ? style.selected: style.container;
  const index = this.state.FlatListItems.findIndex(
    data => data.key === item.key
 );
 this.state.FlatListItems[index] = item;
 this.setState({
   FlatListItems: this.state.FlatListItems
 });
}

changeSeendType = (item, sendigType) => {
  item.sendigType = sendigType;
  console.log('flat list ', item.sendigType)
  if(sendigType == 'interval') item.showInputInterval = true
  else item.showInputInterval = false
  const index = this.state.FlatListItems.findIndex(
    data => data.key === item.key
 );
 this.state.FlatListItems[index] = item;
 this.setState({
   FlatListItems: this.state.FlatListItems
 });
 this.updateUserInterval(item.sendigType, item.interval, item.key)
 console.log('update user interval in flat list')
}

changeInterval = (item, txt, ready) =>{
  item.interval = txt == ''? 20 : txt;
  console.log('flat list ', item.interval)
  const index = this.state.FlatListItems.findIndex(
    data => data.key === item.key
 );
 this.state.FlatListItems[index] = item;
 this.setState({
   FlatListItems: this.state.FlatListItems
 });
 if(ready){
  this.updateUserInterval(item.sendigType, item.interval, item.key)
  console.log('update user interval in flat list')
 }
}

updateUserInterval(sending_type, interval, phone_no){
  DB.transaction((tx) => {
    console.log("execute transaction");
      tx.executeSql('update Users set sending_setting=?, interval=? where phone_no=?',
       [sending_type ,interval ,phone_no], 
          (tx, results) => {
            console.log('Results', results.rowsAffected);
            if (results.rowsAffected > 0) {
              console.log('user account update : ' + results.rowsAffected)
              this.setState({message: 'Success'+'\n'+'Your account update Successfully'}); 
              this.setState({error: false});
              this.setState({iscomplet: true});
            } else { console.log('can not find map type setting ') }  
      });
  });
}

renderItem = (item) => 
<View>
  <TouchableOpacity onPress={() =>{this.selectedItem(item)}}>
  <View style={item.selectedClass}>
      <View style={{flex: 1}}>
          <Image source={item.image} style={style.photo}/>
      </View>
      <View style={style.container_text}>
        <Text style={style.title}>{item.first_name} {item.last_name}</Text>
        <Text style={style.description}>{item.key}</Text>
      </View>
      <View style={{flex: 1, alignSelf: 'center'}}>
          <TouchableOpacity onPress={() =>{
            this.setState({delete_phone_no: String(item.key)})
            console.log('delete phone number: '+this.state.delete_phone_no)
            this.DeleteButton(String(item.key))
            }}>
              <MaterialCommunityIcons size={25} name={'account-minus'} style={style.iconImage}/>
          </TouchableOpacity>
      </View>          
    </View>
    </TouchableOpacity>
    <View>
    {item.selected ?
      <View style={{flex: 1, flexDirection: 'row', marginRight: 20, marginLeft: 15}}>
            <View style={{flex: 1}}>
              <Text style={{height: 45, alignSelf: 'flex-start',
                paddingRight: 10, paddingLeft: 10, marginTop: 10, fontSize: 15}}>Send by </Text>
            </View> 
            <View style={{flex: 2, height: 45, borderRadius: 25,
                  paddingLeft: 10, width: 30,
                  backgroundColor: 'rgba(0,0,0,0.05)', color: '#000000'}}>
              <Picker
                selectedValue={item.sendigType}
                mode={'dropdown'}
                onValueChange={(itemValue, itemIndex) =>{
                  this.changeSeendType(item, itemValue)
                }}>
                <Picker.Item label="interval" value="interval"/>
                <Picker.Item label="speed" value="speed"/>
              </Picker>
            </View>
            {item.showInputInterval?
            <View style={{flex: 1}}>
              <TextInput 
                  style={[styles.addinput,{borderBottomColor : this.state.bordercolor}]}
                  onFocus={() =>{this.setState({bordercolor : color}); 
                  this.onFocusflag = true; 
                  this.setState({iscomplet: false}) }}
                  onBlur={() => {this.setState({bordercolor : "#DBDBDB"});
                   this.changeInterval(item, parseInt(this.text), true);
                   console.log('call change interval ', true)}}
                  placeholder={'20'}
                  defaultValue={String(item.interval) }
                  placeholderTextColor={'#8D8D8D'}
                  underlineColorAndroid='transparent'
                  keyboardType={'numeric'}
                  onChangeText={txt => { console.log('in flat list for adding interval : ', txt);
                   this.text = txt}}/>
            </View> : null}
          </View>  :
      null
    }
  </View>
</View>


FlatListItemSeparator = () => {
  return (
    <View
      style={{
        height: 1,
        width: "100%",
        backgroundColor: "#ffffff"}}/>);
  }

  render() {  
   return (  
    <View style={style.MainContainer}>
      <View style={{flex: 5}}>
        <FlatList
          data={ this.state.FlatListItems }   
          keyExtractor={item => item.key}
          renderItem={({item}) => this.renderItem(item)}
          extraData={this.state}  
        /> 
      </View>
      <View style={{flex: 1, flexDirection: 'row'}}>
        <View style={{marginTop: 1, flex: 1}}>
          <TouchableOpacity style={[styles.btn,{marginTop: 10, marginRight: 20, marginLeft: 30}]}>
            <Image source={this.state.iscomplet ? (this.state.error ? ImageOptions[0]: ImageOptions[1]): null}
                style={{height: 30, width: 30}} />
          </TouchableOpacity> 
        </View>
        <View style={{flex: 4}}>
          <Text style={[{marginTop: 20}]}> {this.state.iscomplet ? this.state.message : null} </Text>
        </View>
      </View>
    </View>
    );
  }

  static navigationOptions = ({ navigation }) => {
    return {
      title: 'Tracker User',
      headerStyle: {
        backgroundColor: color,
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
        headerRight: (
          <View style={{flexDirection: "row"}}>
            <TouchableOpacity 
              style={{
                alignSelf: 'center',
                height: '100%', 
                marginRight: 20,
              }}
              onPress={() => navigation.navigate('AddPerson',{name: 'setting'})}>
              <MaterialCommunityIcons name={"account-plus"}
                style={{alignSelf:'center', margin: 10}} size={25} color={'#ffffff'}
              />
            </TouchableOpacity>
          </View>
        ),
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
      justifyContent: 'center',
      flexDirection: 'column',
      flex:1,
    },
  container: {
      flex: 1,
      flexDirection: 'row',
      padding: 10,
      marginLeft:16,
      marginRight:16,
      marginTop: 8,
      marginBottom: 8,
      borderRadius: 5,
      backgroundColor: '#FFF',
      elevation: 2,
  },
  title: {
      fontSize: 16,
      color: '#000',
  },
  container_text: {
      flex: 1,
      flexDirection: 'column',
      marginLeft: 5,
      justifyContent: 'center',
  },
  description: {
      fontSize: 11,
      fontStyle: 'italic',
  },
  photo: {
      height: 55,
      width: 55,
      borderRadius: 30
  },
  iconImage: {alignSelf: 'center', alignContent: 'center'},
  selected: {
    flex: 1,
    flexDirection: 'row',
    padding: 10,
    marginLeft:16,
    marginRight:16,
    marginTop: 8,
    marginBottom: 8,
    borderRadius: 5,
    elevation: 2,
    backgroundColor: "#ffffff",
    borderColor: 'green',
    borderWidth: 1    
  },
});