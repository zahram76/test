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
import ImagePicker from 'react-native-image-picker';
import ImageResizer from 'react-native-image-resizer';
import SmsListener from 'react-native-android-sms-listener';
import SQLite from "react-native-sqlite-storage";
import SmsAndroid  from 'react-native-get-sms-android';
import {insertUser} from '../functions/insertUser';
import {deleteUser} from '../functions/deleteUser.js';
import {styles} from '../style.js';

const color = '#028687';

var DB = SQLite.openDatabase(
  {name : "db", createFromLocation : "~db.sqlite"});

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
  c = 0;
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
            FlatListItems: [],
            resizedImageUri: null,
            avatarSource: require('../asset/defaultProfile.png'),
            isReady: false,
            uriFlag: false,
        };
       // this.init();
       
    }

    getImage(){ 
      console.log('image picker');
      
      ImagePicker.launchImageLibrary(options, (response) => {
        //console.log('Response = ', response);
      
        if (response.didCancel) {
          console.log('User cancelled image picker');
        } else if (response.error) {
          console.log('ImagePicker Error: ', response.error);
        } else if (response.customButton) {
          console.log('User tapped custom button: ', response.customButton);
        } else {
         // const source = { uri: response.uri };
          // You can also display the image using data:
          const uri = 'data:image/jpeg;base64,' + response.data ;
          ImageResizer.createResizedImage(uri, 300, 300, 'JPEG', 80)
          .then(({uri}) => {
            this.setState({avatarSource: {uri: uri}});
            this.setState({uriFlag: true})
            console.log('resize : '+ uri)
          }).catch((err) => {
            console.log(err);
          });
        }
      });
    }
 
    AddButtonPress() {
      var flag = false;
        if (this.state.phone_no == '' ){ 
          this.setState({bordercolor2 : '#B30000'}); 
          //this.setState({placeholderColor2 : 'red'}); 
          flag = true}
        if (this.state.first_name == ''){
           this.setState({bordercolor : '#B30000'}); 
          //this.setState({placeholderColor : 'red'});  
           flag = true}
        if (this.state.last_name == ''){ 
          this.setState({bordercolor1 : '#B30000'}); 
          //this.setState({placeholderColor1 : 'red'}); 
          flag = true}

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

                var image;
                if(this.state.uriFlag == false) {image = {require : this.state.avatarSource}; console.log('requier')}
                else { image = this.state.avatarSource; console.log('uri'); this.setState({uriFlag: false})}

                console.log('image '+image);
                insertUser(this.state.phone_no, this.state.first_name, this.state.last_name, image);

                this.setState({message: 'Success'+'\n'+'You are Registered Successfully'});
                this.setState({error: false});
                this.setState({isReady: true});
              } else {
                this.setState({message: 'This phone number is already in use. '})
                this.setState({error: true});
                this.setState({isReady: true});
              }});
        });
  }

    render() {
        return ( 
         <View style={styles.scrolStyle}>
            <ScrollView style={styles.scrolStyle} scrollEnabled contentContainerStyle={styles.scrollview}>
              <ImageBackground source={require('../images/background.png')} style={styles.backcontainer}> 

              <View style={{flex: 1, flexDirection: 'column', width: '100%'}}>

              <View style={style.avatarContainer} >
                <TouchableOpacity onPress={() => this.getImage()}>
                    <Image source={this.state.avatarSource}
                            style={style.avatarImage} resizeMode={'cover'}/>
                </TouchableOpacity> 
                </View>

              <View style={{flex: 1, marginTop: 30,marginBottom: 10}}>
                <Text style={style.labelStyle}>First name</Text>
                <View style={{flex: 5}}>
                    <TextInput 
                      style={[styles.addinput,{borderBottomColor : this.state.bordercolor, width: '90%'}]}
                      onFocus={() => {this.setState({bordercolor : color}); 
                        this.setState({bordercolor1 : "#DBDBDB"});
                        this.setState({bordercolor2 : "#DBDBDB"}); 
                        this.setState({isReady: false}); }}
                      onBlur={() => {this.setState({bordercolor : "#DBDBDB"});}}
                      underlineColorAndroid='transparent'
                      fontSize={16}
                      keyboardType={'default'}
                      onChangeText={txt => {
                        this.setState({first_name: txt})
                      }}
                    />
                  </View>
                </View>

                <View style={{flex: 1,marginBottom: 10}}>
                  <Text style={style.labelStyle}>last name</Text>
                  <View style={{flex: 5}}>
                    <TextInput 
                      style={[styles.addinput,{borderBottomColor : this.state.bordercolor1, width: '90%'}]}
                      onFocus={() => {this.setState({bordercolor1 : color});
                          this.setState({bordercolor2 : "#DBDBDB"});
                          this.setState({bordercolor : "#DBDBDB"}); 
                          this.setState({isReady: false})}}
                           
                      onBlur={() => {this.setState({bordercolor1 : "#DBDBDB"})}}
                      underlineColorAndroid='transparent'
                      keyboardType={'default'}
                      onChangeText={txt => {
                        this.setState({last_name: txt})
                      }}
                    />
                  </View>
                </View>
              
              <View style={{flex: 1, marginBottom: 10}}>
                <Text style={style.labelStyle}>Phone number</Text>
                <View style={{flex: 1, flexDirection: 'row'}}>
                  <View style={{flex: 5}}>
                    <TextInput 
                      style={[styles.addinput,{borderBottomColor : this.state.bordercolor2, width: '90%'}]}
                      onFocus={() =>{this.setState({bordercolor2 : color});
                        this.setState({bordercolor1 : "#DBDBDB"});
                        this.setState({bordercolor : "#DBDBDB"}); 
                        this.setState({isReady: false})}}
                      onBlur={() => {this.setState({bordercolor2 : "#DBDBDB"})}}
                      underlineColorAndroid='transparent'
                      keyboardType={'numeric'}
                      onChangeText={txt => {
                        this.setState({phone_no: txt.split(' ')[0]})
                        console.log('after : ' + this.state.phone_no)
                      }}
                    />
                  </View>
                </View>
              </View>

              <View style={{flex: 1, flexDirection: 'row'}}>
                <View style={{marginTop: 1, flex: 1}}>
                  <TouchableOpacity style={[styles.btn,{marginTop: 20, marginRight: 20, marginLeft: 30}]}>
                    <Image source={this.state.isReady ? (this.state.error ? ImageOptions[0]: ImageOptions[1]): null}
                        style={{height: 30, width: 30}} />
                  </TouchableOpacity> 
                </View>
                    
                <View style={{flex: 4}}>
                  <Text style={[{marginTop: 30}]}> {this.state.isReady ? this.state.message : null} </Text>
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
          </ImageBackground>
        </ScrollView>
     </View>
        );
    }
  
  static navigationOptions = ({ navigation }) => {
    return {
        title: 'New user',
        headerStyle: {
          backgroundColor: color,
          barStyle: "light-content", // or directly
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
      }
    }
  }

    componentDidMount() {
    //  this.props.navigation.setParams({ handleSave: this.AddButtonPress()});
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
    //position: 'absolute',
    marginTop:20
  },
  labelStyle: {
    marginLeft: 15,
    marginTop: 10,
    color: color,
  }

});




//isRepeatedUser(){
  //   // var array = [...this.state.FlatListItems]; 
  //   // var index = -1;// = array.indexOf({str})
  //   // for(let i=0; i<array.length; ++i){
  //   //   if(array[i].key == this.state.phone_no)
  //   //     index = i;
  //   // }
  //   // if(index !== -1)
  //   //   alert('This phone number is already in use. ')
  //   // else {
  //   //   insertUser(this.state.phone_no);
  //   //   var a = [...this.state.FlatListItems];
  //   //   a.push({key: this.state.phone_no, image: ImageOptions[this.c++%4].toString()})
  //   //   this.setState({FlatListItems: a})
  //   //   console.log(JSON.stringify(this.state.FlatListItems))
  //   // }
  //   DB.transactio

    // DeleteButton(str){
  //   if (str == ''){
  //       alert("Please fill in the blanks!")
  //   } else {
  //     console.log('delete user by phone : '+ str);
  //     deleteUser(str);
  //    // console.log(JSON.stringify(this.state.FlatListItems))
  //     //this.removePeople(str);
  //     //console.log(JSON.stringify(this.state.FlatListItems))
  //   }
  // }