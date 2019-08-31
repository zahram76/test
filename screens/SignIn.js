import React, {Component} from "react";
import {
    View, 
    Text, 
    TouchableOpacity, 
    ImageBackground,
    TextInput,
    Image,
    ScrollView,
} from "react-native";
import { CheckBox } from 'react-native-elements';
import Icon from "react-native-vector-icons/Ionicons";
import SQLite from "react-native-sqlite-storage";
import AsyncStorage from '@react-native-community/async-storage';
import {styles} from '../style.js';
import { initDatabase } from "../functions/initDatabase.js";
const DB = SQLite.openDatabase(
  {name : "db", createFromLocation : "~db.sqlite"})

export default class SignIn extends Component {
    constructor(props) {
        super(props);
        this.state={
            imageLogo: require('../images/logo1.png'),
            showPass: true,
            press: false,
            TextInput_Username: '',
            TextInput_Pass: '',
            user_id_: null,
            checked: true,
            message: '',
            isUser: false,
          };
    }

    componentDidMount(){
      initDatabase();
    }

    showPass = () => {
        if(this.state.press == false){
          this.setState({showPass:false, press:true});
        } else {
          this.setState({showPass:true, press:false});
        }
      }

     isUser(){
          DB.transaction((tx) => {
          tx.executeSql('select user_id, username, password from CurrentTrackingUser where username=?', 
            [this.state.TextInput_Username],(tx, results) => {
                if(results.rows.length == 1){
                  if(results.rows.item(0).password.split(' ')[0] == this.state.TextInput_Pass){
                    this.setState({user_id_: results.rows.item(0).user_id.toString()}) // vaghti chand ta userand betoonan estefade konan khube.
                    this.whenIsUser();
                  } else { this.setState({message: ' Incorrect password. '});
                    this.whenIsNotUser()
                  }
                } else { this.setState({message: ' There is no user with this username. '});  
                  this.whenIsNotUser()
                }
          });
      });
    }

    whenIsNotUser(){
      alert(this.state.message);
    }

    whenIsUser(){
      if(this.state.checked == true){
        AsyncStorage.setItem('user_id', this.state.user_id_)// ba this.state.username kar nemikone
      }   
      console.log('is user true ');
      this.props.navigation.navigate('App')   
    }
  
   signInOnPress() {
        if (this.state.TextInput_Username == ''
        || this.state.TextInput_Pass == ''){
          alert("Please fill in  the blanks!")
      } else {
         this.isUser() }  
      }

    render() {
        return ( 
          <View style={styles.scrolStyle}>
            <ScrollView style={styles.scrolStyle} scrollEnabled contentContainerStyle={styles.scrollview}>
              <ImageBackground source={require('../images/background.png')} style={styles.backcontainer}> 
                <View style={styles.logoContainer}>
                  <Image source={this.state.imageLogo} style={styles.logo}/>
                </View>
                  <View style={styles.inputContainer}>
                    <Icon name={'ios-person'} size={18} color={'gray'}
                      style={styles.inputIcon}/>
                    <TextInput 
                      style={styles.input}
                      onChangeText={txt => {
                        this.setState({ TextInput_Username: txt.split(' ')[0] });
                      }}
                      placeholder={'Username'}
                      placeholderTextColor={'gray'}
                      underlineColorAndroid='transparent'
                     />
                  </View>
                  <View style={styles.inputContainer}>
                    <Icon name={'ios-lock'} size={18} color={'gray'}
                      style={styles.inputIcon}/>
                    <TextInput 
                      style={styles.input}
                      placeholder={'Password'}
                      onChangeText={txt => {
                        this.setState({ TextInput_Pass: txt.split(' ')[0] });
                      }}
                      secureTextEntry={this.state.showPass}
                      placeholderTextColor={'gray'}
                      underlineColorAndroid='transparent'
                    />
                    <TouchableOpacity style={styles.btnEye}
                      onPress={this.showPass.bind(this)}>
                      <Icon name={this.state.press==false ? 'ios-eye' : 'ios-eye-off'} 
                        size={28} color={'gray'}/>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.checkboxContainer}>
                  <CheckBox
                    title='Do you want to save this session ?'
                    checked={this.state.checked}
                    checkedColor='#16A085'
                    containerStyle={styles.checkboxContainer}
                    onIconPress={() => this.setState({checked: !this.state.checked})}
                    onPress={() => this.setState({checked: !this.state.checked})}
                    />
                  </View>
                  <View style={{flexDirection: 'row'}}>
                  <View style={styles.btnContainer}>
                    <TouchableOpacity style={styles.btnLogin}
                      onPress={this.signInOnPress.bind(this) }>
                      <Text style={styles.text}>SIGN IN</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.btnContainer}>
                    <TouchableOpacity style={styles.btnLogin}
                      onPress={() => this.props.navigation.navigate('SignUp')}>
                      <Text style={styles.text}>SIGN UP</Text>
                    </TouchableOpacity>
                  </View>
                  </View>
                  <View style={styles.imageContainer}>
                    <Image source={require('../images/gmother.png')} style={styles.grandmother}/>
                    <Image source={require('../images/gfather.png')} style={styles.grandfather}/>
                  </View>
                </ImageBackground>
              </ScrollView>
           </View>
        );
    }
}

