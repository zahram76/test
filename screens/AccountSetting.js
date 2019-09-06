import React ,{ Component } from 'react';  
import {
    View, 
    Text, 
    TouchableOpacity, 
    ImageBackground,
    TextInput,
    Image,
    ScrollView,
    StyleSheet,
} from "react-native"; 
import SQLite from "react-native-sqlite-storage";
import ImagePicker from 'react-native-image-picker';
import ImageResizer from 'react-native-image-resizer';
import RNSimData from 'react-native-sim-data';
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import {styles} from '../style.js';
var RNFS = require('react-native-fs');

const color = '#349e9f';
SQLite.DEBUG(true);
const options = {
  title: 'Select Avatar',
  customButtons: [{ name: 'fb', title: 'Choose Photo from Facebook' }],
  storageOptions: {
    skipBackup: true,
    path: 'images',
  },
};
const ImageOptions = [
  require('../asset/error.png'),
  require('../asset/verified.png')
]
var DB = SQLite.openDatabase({name : "db", createFromLocation : "~db.sqlite"});
const imageOptions = [
    require('../images/defaultMap.png'),
    require('../images/sateliteMap.png'),
    require('../images/terrianMap.png')
];

export default class AccountSetting extends Component {
constructor(){
    super();
    this.state =  {
       username: '',
       password: '',
       repassword: '',
       bordercolor: '#DBDBDB',
       bordercolor1: '#DBDBDB',
       bordercolor2: '#DBDBDB',
       FlatListItems: [],
       resizedImageUri: null,
       avatarSource: require('../asset/defaultProfile.png'),
       isReady: false,
       uriFlag: false,
       image: '',
       saveImage: null,
       error: false, 
       message: '',
       color: 'red',
   };
   imageUri = '';
   savedImageUri ='';
   flagIsRepeat = true;
   
}
static navigationOptions = ({ navigation }) => {
  return {
      title: 'Account Setting',
      headerStyle: {
        backgroundColor: color,
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
      headerLeft: (
      <View style={{marginLeft: 15}}>
        <MaterialCommunityIcons name={'arrow-left'} size={25} style={{color: 'white'}}
          onPress={ () => { navigation.navigate('Profile',{name: 'account'}) }} />
      </View>
      ),
    }
  }
   
init(){
  console.log(' init profile');
  var a = [];
  var image = null ;
  DB.transaction((tx) => {
    console.log("execute transaction");
      tx.executeSql('select phone_no, user_id, username, password, user_image from CurrentTrackingUser ', [], (tx, results) => {
            console.log('Results', results.rows.length);
            if (results.rows.length > 0) {
              for(let i=0; i<results.rows.length; ++i){
                console.log('Resultsss', JSON.stringify(results.rows.item(i)));
                  JSON.parse(results.rows.item(i).user_image, (key,value) => {
                    if(key == 'uri') {
                      this.setState({uriFlag: true})
                      image = {uri : value}}
                    else if (key == 'require')
                      image = require('../asset/defaultProfile.png')
                  });
                  this.setState({
                    user_id : results.rows.item(i).user_id,
                    phone_no : results.rows.item(i).phone_no,
                    username : results.rows.item(i).username,
                    password : results.rows.item(i).password,
                    avatarSource: image == null ? this.state.avatarSource : image
                  })
                  console.log('pohone: '+ JSON.stringify(this.state))
              }
              console.log('Success'+'\n'+'select users Successfully');
            } else {
              console.log('no user');
            }  
      })
  });
}


updateAccount(phone_no,username,password,image){
   console.log(' update user account setting');
   console.log(phone_no+ username+ password+ JSON.stringify(image));
    DB.transaction((tx) => {
      console.log("execute transaction");
        tx.executeSql('update CurrentTrackingUser set username=?, password=? where phone_no=?',
         [username,password,phone_no], 
            (tx, results) => {
              console.log('Results', results.rowsAffected);
              if (results.rowsAffected > 0) {
                console.log('user account update : ' + results.rowsAffected)
                this.setState({message: 'Success'+'\n'+'Your account update Successfully'}); 
                this.setState({error: false});
                this.setState({isReady: true});
              } else { console.log('can not find map type setting ') }  
        });
        tx.executeSql('update CurrentTrackingUser set user_image=? where phone_no=?',
        [JSON.stringify( image),phone_no], 
           (tx, results) => {
            console.log('Results', results.rowsAffected);
            if (results.rowsAffected > 0) {
              console.log('image update : ' + results.rowsAffected)
            } else { console.log('can not find image setting ') }  
        });
    });
}

AddButtonPress() {
  var flag = false;
    if (this.state.phone_no == '' ){ 
      this.setState({bordercolor2 : '#B30000'}); flag = true}
    if (this.state.username == ''){
       this.setState({bordercolor : '#B30000'}); flag = true}
    if (this.state.password == ''){ 
      this.setState({bordercolor1 : '#B30000'}); flag = true}

    if(flag){
      this.setState({message: 'Please fill in the blanks!'});
      this.setState({error: true});
      this.setState({isReady: true});
    } else {
      this.isRepeatedUser();
    }
}

componentDidMount(){
  this.init();
}


getImage(){ 
  console.log('image picker');
  this.setState({isReady: false})
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

saveImageToDevice(name,data){
  var image;
  console.log('uri flag: '+this.state.uriFlag + JSON.stringify(data))
  if(this.state.uriFlag == false) {image = {require : this.state.avatarSource}; }
  else { image = data; }
  console.log(JSON.stringify(image))
  this.updateAccount(this.state.phone_no, this.state.username, this.state.password, image);
}

changePass(){
  var no = JSON.stringify(RNSimData.getSimInfo().phoneNumber0)
  console.log(no)
}

isRepeatedUser(){
  // console.log('repeated user transaction');
  //  DB.transaction((tx) => {
  //   console.log('executing query');
  //    tx.executeSql('select phone_no from Users where phone_no=?', 
  //       [this.state.phone_no],(tx, results) => {
  //         console.log('rows result '+results.rows.length);
         // if(results.rows.length == 0){
          this.flagIsRepeat = false;
          this.insert(this.flagIsRepeat)
            
          // } else {
          //   this.setState({message: 'This phone number is already in use. '})
          //   this.setState({error: true});
          //   this.setState({isReady: true});}
    //       }});
    // });
}

insert(){
  this.saveImageToDevice(this.state.phone_no.split(' ')[0], this.state.avatarSource)
}

render(){
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
                      placeholder={'username'}
                      placeholderTextColor={'#8D8D8D'}
                      underlineColorAndroid='transparent'
                      fontSize={16}
                      defaultValue={this.state.username}
                      keyboardType={'default'}
                      onChangeText={txt => {
                        this.setState({username: txt})}}/>
                  </View>
                </View>
                <View style={{flex: 1,marginBottom: 20, flexDirection: 'row'}}>
                  <View style={{flex: 5}}>
                    <TextInput 
                      style={[styles.addinput,{borderBottomColor : this.state.bordercolor1, width: '85%'}]}
                      onFocus={() => {this.setState({bordercolor1 : color});
                          this.setState({bordercolor2 : "#DBDBDB"});
                          this.setState({bordercolor : "#DBDBDB"}); 
                          this.setState({isReady: false})}}
                      placeholder={'password'}
                      placeholderTextColor={'#8D8D8D'}     
                      onBlur={() => {this.setState({bordercolor1 : "#DBDBDB"})}}
                      underlineColorAndroid='transparent'
                      secureTextEntry={true}
                      defaultValue={this.state.password}
                      keyboardType={'default'}
                      onChangeText={txt => {
                        this.setState({password: txt})}}/>
                  </View>
                  <View style={{flex: 2}}>
                  <TouchableOpacity style={[style.btn1,{alignSelf:'center', width: 70, 
                    height: 35, marginTop: 10, marginRight: 20,}]}
                    onPress={this.changePass.bind(this)}>
                    <Text style={{color: color}}>change</Text>
                  </TouchableOpacity> 
                </View>
                </View>
              <View style={{flex: 1, marginBottom: 20}}>
                <View style={{flex: 1, flexDirection: 'row'}}>
                  <View style={{flex: 5}}>
                    <TextInput 
                      style={[styles.addinput,{borderBottomColor : this.state.bordercolor2, width: '85%', marginRight: 10}]}
                      onFocus={() =>{this.setState({bordercolor2 : color});
                        this.setState({bordercolor1 : "#DBDBDB"});
                        this.setState({bordercolor : "#DBDBDB"}); 
                        this.setState({isReady: false})}}
                      onBlur={() => {this.setState({bordercolor2 : "#DBDBDB"})}}
                      placeholder={this.state.phone_no}
                      placeholderTextColor={'#8D8D8D'}
                      defaultValue={this.state.phone_no}
                      underlineColorAndroid='transparent'
                      keyboardType={'numeric'}
                      onChangeText={txt => {
                        this.setState({phone_no: txt.split(' ')[0]})
                        console.log('after : ' + this.state.phone_no)}}/>
                  </View>
                </View>
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
          {/* </ImageBackground> */}
        </ScrollView>
     </View>
    );
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
  btn1:{
    borderRadius: 15,
    //color: color,
    justifyContent: "center",
    marginTop: 10,
    alignItems: "center",
    marginRight: 7, 
    backgroundColor: '#ffffff',
    borderColor: color, 
    borderWidth: 1
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