import React, {Component} from "react";
import {
    View, 
    Text, 
    TouchableOpacity, 
    ImageBackground,
    TextInput,
    Image,
    ScrollView,
    FlatList,
    Dimensions,
    StyleSheet,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import SmsListener from 'react-native-android-sms-listener';
import SQLite from "react-native-sqlite-storage";
import SmsAndroid  from 'react-native-get-sms-android';
import {insertUser} from '../functions/insertUser';
import {deleteUser} from '../functions/deleteUser.js';
import {styles} from '../style.js';

var DB = SQLite.openDatabase(
  {name : "db", createFromLocation : "~db.sqlite"});

const ImageOptions = [
  require('../asset/female.png'),require('../asset/female1.png'),
  require('../asset/female2.png'),require('../asset/male.png')
]

const height = Dimensions.get('window').height;
const width = Dimensions.get('window').width;

export default class AddPerson extends Component {
  c = 0;
    constructor(props) {
        super(props);
        this.state={
            phone_no: '',
            delete_phone_no: '',
            color: 'red',
            bordercolor: '#DBDBDB',
            FlatListItems: [],
            users: [],
            isReady: false,
        };
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
                      a.push({key : results.rows.item(i).phone_no, image: ImageOptions[this.c++%4].toString()});
                     // console.log('image: '+ImageOptions[this.c++%4].toString())
                      this.state.users.push({
                          user_id : results.rows.item(i).user_id,
                          phone_no : results.rows.item(i).phone_no,
                          first_name : results.rows.item(i).first_name,
                          last_name : results.rows.item(i).last_name,
                      });
                  }
                  this.setState({FlatListItems: a})
                 // alert('Success'+'\n'+'select users Successfully') 
                  console.log('Success'+'\n'+'select users Successfully');
                } else {
                  //('select users Failed') 
                  console.log('no user');
                }  
          })
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

    AddButtonPress() {
      this.setState({canceled: false});
        if (this.state.phone_no == ''){
            alert("Please fill in the blanks!")
        } else {
          this.isRepeatedUser();
        }
    }

    isRepeatedUser(){
      var array = [...this.state.FlatListItems]; 
      var index = -1;// = array.indexOf({str})
      for(let i=0; i<array.length; ++i){
        if(array[i].key == this.state.phone_no)
          index = i;
      }
      if(index !== -1)
        alert('This phone number is already in use. ')
      else {
        insertUser(this.state.phone_no);
        var a = [...this.state.FlatListItems];
        a.push({key: this.state.phone_no, image: ImageOptions[this.c++%4].toString()})
        this.setState({FlatListItems: a})
        console.log(JSON.stringify(this.state.FlatListItems))
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
      console.log(JSON.stringify(this.state.FlatListItems))
    }
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
         <View style={styles.scrolStyle}>
            <ScrollView style={styles.scrolStyle} scrollEnabled contentContainerStyle={styles.scrollview}>
              <ImageBackground source={require('../images/background.png')} style={styles.backcontainer}> 

              <View style={{flex: 1, flexDirection: 'column', width: '100%'}}>
              <View style={{flex: 1, flexDirection: 'row'}}>
                <View style={{marginTop: 50, flex: 5}}>
                  <TextInput 
                    style={[styles.addinput,{borderBottomColor : this.state.bordercolor, width: '85%'}]}
                    onFocus={() => {this.setState({bordercolor : "#023D5A"})}}
                    onBlur={() => {this.setState({bordercolor : "#DBDBDB"})}}
                    placeholder={'phone number'}
                    placeholderTextColor={'gray'}
                    underlineColorAndroid='transparent'
                    keyboardType={'numeric'}
                    onChangeText={txt => {
                      console.log(txt)
                      this.setState({phone_no: txt.split(' ')[0]})
                      console.log('after : ' + this.state.phone_no)
                    }}
                  />
                </View>
                <View style={{flex: 1}}>
                  <TouchableOpacity style={[styles.btn,{marginTop: 60, marginRight: 20}]}
                    onPress={this.AddButtonPress.bind(this)}>
                    <Image source={require('../asset/addIcon.png')} style={{height: 30, width: 30}} />
                  </TouchableOpacity> 
                </View>
              </View>

            
                <View style={style.MainContainer}>
                  <FlatList
                    data={ this.state.FlatListItems }   
                    ItemSeparatorComponent = {this.FlatListItemSeparator}
                    renderItem={({item}) => 

                    <View key={item.key} style={{flex: 1, flexDirection: 'row', 
                        backgroundColor: 'white', padding: 20}}>
                        <View style={{flex: 1}}>
                            <Image source={item.image} style={{height: 30, width: 30}}/>
                        </View>
                        <Text style={{flex: 8, marginTop: 5 , marginLeft: 13 }}>{item.key}</Text>
                        <View style={{flex: 1}}>
                            <TouchableOpacity onPress={() =>{
                              this.setState({delete_phone_no: String(item.key)})
                              console.log('delete phone number: '+this.state.delete_phone_no)
                              this.DeleteButton(String(item.key))
                              }}>
                                <Image  source={require('../asset/removeIcon.png')}style={{height: 30, width: 30}}/>
                            </TouchableOpacity>
                        </View>
                    </View>
                    }
                  /> 
                  <Text>{this.state.FlatListItems.key}</Text>
                </View> 
              </View>
          </ImageBackground>
        </ScrollView>
     </View>
        );
    }
}

const style = StyleSheet.create({
  MainContainer :{
  // Setting up View inside content in Vertically center.
    justifyContent: 'center',
    flex:1,
    margin: 10,
    marginTop: 40
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

