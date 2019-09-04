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
import SQLite from "react-native-sqlite-storage";
import {styles} from '../style.js';
import BatteryLevel from '../component/BatteryLevel.js';
import {Setting} from './Setting.js'

const color = '#028687';

var DB = SQLite.openDatabase(
  {name : "db", createFromLocation : "~db.sqlite"});

  // SQLite.DEBUG(true);
  // SQLite.enablePromise(true);

export default class Profile extends Component {
  c = 0;
    constructor(props) {
        super(props);
        this.state={
          switchValue: false,
            phone_no: '',
            username: '',
            password: '',
            user_id: '',
            avatarSource: require('../asset/defaultProfile.png'),
        };
        this.init();
       
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
                        if(key == 'uri') 
                          image = {uri : value}
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
                      console.log('ohone: '+ this.state.phone_no,)
                  }
                  console.log('Success'+'\n'+'select users Successfully');
                } else {
                  console.log('no user');
                }  
          })
      });
  }

  AddButtonPress(){
    
  }
  
    render() {
        return ( 
         <View style={styles.scrolStyle}>
            <ScrollView style={styles.scrolStyle} scrollEnabled contentContainerStyle={styles.scrollview}>
              <ImageBackground source={require('../images/background.png')} style={styles.backcontainer}> 

              <View style={{flex: 1, flexDirection: 'column', width: '100%'}}>
                <View  style={[style.avatarContainer,{flex: 1, flexDirection: 'row', width: '100%', marginBottom: 30}]}>
                  <View style={{flex: 2, flexDirection: 'column', width: '100%'}}>
                    <Text style={[style.profileText, {marginTop: 70,marginBottom: 5}]}> {this.state.username} </Text>
                    <Text style={style.profileText}> {this.state.phone_no} </Text>
                  </View>
                  <View style={{flex: 1, flexDirection: 'column', width: '100%'}}>
                    <Image source={this.state.avatarSource}
                        style={style.avatarImage} resizeMode={'cover'}/>
                  </View>                  
                </View>
  
             {/*} <Setting  />*/}
              <View style={{flex: 1}}>
                  <TouchableOpacity style={[styles.btn,{alignSelf:'center', width: 100, height: 40, 
                     marginTop: 10, marginRight: 20, backgroundColor: color}]}
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
}

//get={false} cb = {(val) => alert('s')}

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
    backgroundColor: color, //"#023D5A",
    height:130,
  },
  avatarImage: {
    width: 130,
    height: 130,
    borderRadius: 63,
    borderWidth: 4,
    borderColor: color, //"#023D5A",
    marginBottom:10,
    alignSelf: "center",
    backgroundColor: color, //"#023D5A",
    //position: 'absolute',
    marginTop:20,
    marginRight:20
  },
  labelStyle: {
    marginBottom:10,
    alignSelf: 'flex-start',
    color: 'white',
    marginTop:70,
  },
  profileText: {
    marginHorizontal: 10,
    alignSelf: 'flex-start',
    color: 'white',
    marginTop: 5,
  },

});


