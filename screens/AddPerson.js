import React, {Component} from "react";
import {
    View, 
    Text, 
    TouchableOpacity, 
    ImageBackground,
    TextInput,
    Image,
    ScrollView,
    StyleSheet,
    Picker,
} from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import ImagePicker from 'react-native-image-picker';
import ImageResizer from 'react-native-image-resizer';
import SmsListener from 'react-native-android-sms-listener';
import SQLite from "react-native-sqlite-storage";
import SmsAndroid  from 'react-native-get-sms-android';
import {insertUser} from '../functions/insertUser';
import {deleteUser} from '../functions/deleteUser.js';
import {styles} from '../style.js';

var RNFS = require('react-native-fs');
const color = '#349e9f';
var navOption = '';
var DB = SQLite.openDatabase({name : "db", createFromLocation : "~db.sqlite"});
const ImageOptions = [
  require('../asset/error.png'),
  require('../asset/verified.png')
]

const options = {
  title: 'Select Avatar',
  customButtons: [{ name: 'fb', title: 'Choose Photo from Facebook' }],
  storageOptions: {
    skipBackup: true,
    path: 'images',
  },
};

export default class AddPerson extends Component {
    constructor(props) {
        super(props);
        this.state={
            phone_no: '',
            delete_phone_no: '',
            first_name: '',
            last_name: '',
            image: '',
            saveImage: null,
            error: false, 
            message: '',
            color: 'red',
            bordercolor: '#DBDBDB',
            bordercolor1: '#DBDBDB',
            bordercolor2: '#DBDBDB',
            bordercolor3: '#DBDBDB',
            FlatListItems: [],
            resizedImageUri: null,
            avatarSource: require('../asset/defaultProfile.png'),
            isReady: false,
            uriFlag: false,
            sendigType: 'interval',
            showInputInterval : true,
        };
        imageUri = '';
        savedImageUri ='';
        flagIsRepeat = true;
        interval = 20;
        
        
    }

    saveImageToDevice(name,data){
        var image;
        if(this.state.uriFlag == false) {image = {require : this.state.avatarSource}; }
        else { image = data; this.setState({uriFlag: false})}
        insertUser(this.state.phone_no, this.state.first_name, this.state.last_name, image, thi.state.sendingType, this.interval);
        this.setState({message: 'Success'+'\n'+'You are Registered Successfully'}); 
        this.setState({error: false});
        this.setState({isReady: true});
    }

    getImage(){ 
      console.log('image picker');
      ImagePicker.launchImageLibrary(options, (response) => {
         const uri = 'data:image/jpeg;base64,' + response.data ;
         this.imageUri = uri
        if (response.didCancel) {
          console.log('User cancelled image picker');
        } else if (response.error) {
          console.log('ImagePicker Error: ', response.error);
        } else if (response.customButton) {
          console.log('User tapped custom button: ', response.customButton);
        } else {
          ImageResizer.createResizedImage(uri, 300, 300, 'JPEG', 80,1, RNFS.DocumentDirectoryPath+'/images/')
          .then(({uri}) => {
            this.setState({avatarSource: {uri: uri}})
            this.setState({uriFlag: true})
          }).catch((err) => {
            console.log(err);
          });
        }
      });
    }
 
    AddButtonPress() {
      var flag = false;
        if (this.state.phone_no == '' ){ 
          this.setState({bordercolor2 : '#B30000'}); flag = true}
        if (this.state.first_name == ''){
           this.setState({bordercolor : '#B30000'}); flag = true}
        if (this.state.last_name == ''){ 
          this.setState({bordercolor1 : '#B30000'}); flag = true}

        if(flag){
          this.setState({message: 'Please fill in the blanks!'});
          this.setState({error: true});
          this.setState({isReady: true});
        } else {
          this.isRepeatedUser();
        }
    }

   isRepeatedUser(){
      console.log('repeated user transaction');
       DB.transaction((tx) => {
        console.log('executing query');
         tx.executeSql('select phone_no from Users where phone_no=?', 
            [this.state.phone_no],(tx, results) => {
              console.log('rows result '+results.rows.length);
              if(results.rows.length == 0){

                 this.flagIsRepeat = false;
                 this.insert(this.flagIsRepeat)
              } else {
                this.setState({message: 'This phone number is already in use. '})
                this.setState({error: true});
                this.setState({isReady: true});
              }});
        });
  }

  insert(){
    this.saveImageToDevice(this.state.phone_no.split(' ')[0], this.state.avatarSource)
  }
    render() {
        return ( 
         <View style={styles.scrolStyle}>
            <ScrollView style={styles.scrolStyle} scrollEnabled contentContainerStyle={styles.scrollview}>
              <View style={{flex: 1, flexDirection: 'column', width: '100%'}}>
                <View style={style.avatarContainer} >
                  <TouchableOpacity onPress={() => this.getImage()}>
                      <Image source={this.state.avatarSource}
                              style={style.avatarImage} resizeMode={'cover'}/>
                  </TouchableOpacity> 
                </View>
              <View style={{flex: 1, marginTop: 55,marginBottom: 20}}>
                <View style={{flex: 5}}>
                    <TextInput 
                      style={[styles.addinput,{borderBottomColor : this.state.bordercolor, width: '85%'}]}
                      onFocus={() => {this.setState({bordercolor : color}); 
                        this.setState({bordercolor1 : "#DBDBDB"});
                        this.setState({bordercolor2 : "#DBDBDB"}); 
                        this.setState({isReady: false}); }}
                      onBlur={() => {this.setState({bordercolor : "#DBDBDB"});}}
                      placeholder={'First name'}
                      placeholderTextColor={'#8D8D8D'}
                      underlineColorAndroid='transparent'
                      fontSize={16}
                      keyboardType={'default'}
                      onChangeText={txt => {
                        this.setState({first_name: txt})}}/>
                  </View>
                </View>
                <View style={{flex: 1,marginBottom: 20}}>
                  <View style={{flex: 5}}>
                    <TextInput 
                      style={[styles.addinput,{borderBottomColor : this.state.bordercolor1, width: '85%'}]}
                      onFocus={() => {this.setState({bordercolor1 : color});
                          this.setState({bordercolor2 : "#DBDBDB"});
                          this.setState({bordercolor : "#DBDBDB"}); 
                          this.setState({isReady: false})}}
                      placeholder={'Last name'}
                      placeholderTextColor={'#8D8D8D'}     
                      onBlur={() => {this.setState({bordercolor1 : "#DBDBDB"})}}
                      underlineColorAndroid='transparent'
                      keyboardType={'default'}
                      onChangeText={txt => {
                        this.setState({last_name: txt})}}/>
                  </View>
                </View>
              <View style={{flex: 1, marginBottom: 20}}>
                <View style={{flex: 1, flexDirection: 'row'}}>
                  <View style={{flex: 5}}>
                    <TextInput 
                      style={[styles.addinput,{borderBottomColor : this.state.bordercolor2, width: '85%'}]}
                      onFocus={() =>{this.setState({bordercolor2 : color});
                        this.setState({bordercolor1 : "#DBDBDB"});
                        this.setState({bordercolor : "#DBDBDB"}); 
                        this.setState({isReady: false})}}
                      onBlur={() => {this.setState({bordercolor2 : "#DBDBDB"})}}
                      placeholder={'Phone number'}
                      placeholderTextColor={'#8D8D8D'}
                      underlineColorAndroid='transparent'
                      keyboardType={'numeric'}
                      onChangeText={txt => {
                        this.setState({phone_no: txt.split(' ')[0]})
                        console.log('after : ' + this.state.phone_no)}}/>
                  </View>
                </View>
              </View >

              <View style={{flex: 1, flexDirection: 'row', marginRight: 20, marginLeft: 15}}>
                <View style={{flex: 1}}>
                  <Text style={{height: 45, alignSelf: 'flex-start',
                    paddingRight: 10, paddingLeft: 10, marginTop: 10, fontSize: 15}}>Send by </Text>
                </View> 
                <View style={{flex: 2, height: 45, borderRadius: 25,
                      paddingLeft: 10, width: 30,
                      backgroundColor: 'rgba(0,0,0,0.05)', color: '#000000'}}>
                  <Picker
                    selectedValue={this.state.sendigType}
                    mode={'dropdown'}
                    onValueChange={(itemValue, itemIndex) =>{
                      this.setState({sendigType: itemValue})
                      if(itemValue == 'interval') this.setState({showInputInterval: true})
                      else {this.setState({showInputInterval: false})}
                    }}>
                    <Picker.Item label="interval" value="interval"/>
                    <Picker.Item label="speed" value="speed"/>
                  </Picker>
                </View>
                {this.state.showInputInterval? <View style={{flex: 1}}>
                  <TextInput 
                      style={[styles.addinput,{borderBottomColor : this.state.bordercolor3}]}
                      onFocus={() =>{this.setState({bordercolor3 : color});
                        this.setState({bordercolor1 : "#DBDBDB"});
                        this.setState({bordercolor2 : "#DBDBDB"});
                        this.setState({bordercolor : "#DBDBDB"}); 
                        this.setState({isReady: false})}}
                      onBlur={() => {this.setState({bordercolor3 : "#DBDBDB"})}}
                      placeholder={'20'}
                      placeholderTextColor={'#8D8D8D'}
                      underlineColorAndroid='transparent'
                      keyboardType={'numeric'}
                      onChangeText={txt => {
                        this.setState({interval: parseInt(txt.split(' ')[0])})}}/>
                </View> : null}
              </View>             

              <View style={{flex: 1, flexDirection: 'row'}}>
                <View style={{marginTop: 1, flex: 1}}>
                  <TouchableOpacity style={[styles.btn,{marginTop: 10, marginRight: 20, marginLeft: 30}]}>
                    <Image source={this.state.isReady ? (this.state.error ? ImageOptions[0]: ImageOptions[1]): null}
                        style={{height: 30, width: 30}} />
                  </TouchableOpacity> 
                </View>
                <View style={{flex: 4}}>
                  <Text style={[{marginTop: 20}]}> {this.state.isReady ? this.state.message : null} </Text>
                </View>
              </View>
              <View style={{flex: 1}}>
                  <TouchableOpacity style={[styles.btn,{alignSelf:'center', width: 100, 
                    height: 40, marginTop: 10, marginRight: 20, backgroundColor: color}]}
                    onPress={this.AddButtonPress.bind(this)}>
                    <Text style={{color: '#ffffff'}}>save</Text>
                  </TouchableOpacity> 
                </View>
            </View>
        </ScrollView>
     </View>
    );
  }

  componentDidMount() {
      const { navigation } = this.props;
    //Adding an event listner om focus
    //So whenever the screen will have focus it will set the state to zero
    this.focusListener = navigation.addListener('didFocus', () => {
      if(this.props.navigation.state.params != null){
        console.log(' navigation param : ' + JSON.stringify(this.props.navigation.state.params));
        const str = JSON.stringify(this.props.navigation.state.params);
        JSON.parse(str, (key,value) => {
          if(key == 'name' && value == 'setting')
          navOption = 'TrackerUser'
          else if(key == 'name' && value == 'map')
          navOption = 'Map'
          console.log(value);  
        })  
      } else { console.log( ' is null ')}
    });
    }

 static navigationOptions = ({ navigation }) => {
   console.log('ineeeeeeee '+navOption)
    return {
      title: 'New user',
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
          onPress={ () => { navigation.navigate(navOption,{name: 'adduser'}) }} />
        </View>
      ),
    }
  }
}

const style = StyleSheet.create({
  MainContainer :{
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
    backgroundColor: '#ffffff',
  },
  avatarContainer:{
    backgroundColor: color,
    height:110,
  },
  avatarImage: {
    width: 130,
    height: 130,
    borderRadius: 63,
    borderWidth: 4,
    borderColor: color,
    marginBottom:10,
    alignSelf: "center",
    backgroundColor: color,
    marginTop:20
  },
  labelStyle: {
    marginLeft: 15,
    marginTop: 10,
    color: '#000000',
  }

});