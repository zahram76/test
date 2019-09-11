import React ,{ Component } from 'react';  
import {Image, StyleSheet, Text, View, Animated, FlatList, TouchableOpacity, Dimensions} from 'react-native';  
import SQLite from "react-native-sqlite-storage";
import {styles} from '../style.js';
import { CheckBox } from 'react-native-elements';
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

const color = '#349e9f';
SQLite.DEBUG(true);

var DB = SQLite.openDatabase({name : "db", createFromLocation : "~db.sqlite"}); 

export default class MarkerSetting extends Component {
constructor(){
    super();
    this.state =  {
        checked: false,
        FlatListItems: [{
            key: 'Marker_1',
            value: true, 
            image: 'asset:/images/marker1.png'
        },{
            key: 'MapType_2',
            value: false,
            image: 'asset:/images/marker2.png'
        },{
            key: 'Marker_3',
            value: false,
            image: 'asset:/images/marker3.png'
        },{
          key: 'Marker_4',
          value: true, 
          image: 'asset:/images/marker4.png'
        },{
            key: 'MapType_5',
            value: false,
            image: 'asset:/images/border-marker.png'
        },{
            key: 'Marker_6',
            value: false,
            image: 'asset:/images/border-marker1.png'
        }],
        selectedImage : '',
        showingImage : 'asset:/images/marker1.png',
        imageuri: '',
        lastImage: '',
    }
    this.init();
}
   
init(){
    console.log(' marker type setting');
    var a = this.state.FlatListItems;
    DB.transaction((tx) => {
      console.log("execute transaction");
        tx.executeSql('select value from Settings where setting_name=?', ['markerImage'], (tx, results) => {
              console.log('Results', results.rows.length);
              if (results.rows.length > 0) {
               this.setState({lastImage: results.rows.item(0).value})
               this.setState({showingImage: results.rows.item(0).value})
                console.log('marker image : ' + this.state.lastImage)
              } else { console.log('can not find marker setting ') }  
        });
        tx.executeSql('select user_image from CurrentTrackingUser', [], (tx, results) => {
          console.log('Results marker in marker setting', results.rows.item(0).user_image);
          if (results.rows.length > 0) {
            console.log('Results marker in marker setting', ' lentgh > 0');
            JSON.parse(results.rows.item(0).user_image, (key,value) => {
              console.log('Results marker in marker setting ghable if', key, value);
              if(key == 'uri') {
                console.log('Results marker in marker setting', key, value);
                this.setState({imageuri : value}); }
            });
 
              console.log(' dddddddddddddddddddddddd11111111111111111111: ', JSON.stringify(this.state.imageuri))
              console.log('Success'+'\n'+'select users Successfully');
          } else {
            this.setState({imageuri : 'asset:/images/defaultProfile.png'})
            console.log(' dddddddddddddddddddddddd: ', JSON.stringify(this.state.imageuri))
            console.log('no user');
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
          backgroundColor: "#ffffff"}}/>);
  }

  changeMarkerImage(name){
   console.log(' update markerImage setting');
    DB.transaction((tx) => {
      console.log("execute transaction");
        tx.executeSql('update Settings set value=? where setting_name=?', [this.state.showingImage,'markerImage'], 
            (tx, results) => {
              console.log('Results', results.rowsAffected);
              if (results.rowsAffected > 0) {
                console.log('markerImageupdate : ' + results.rowsAffected)
              } else { console.log('can not find markerImage setting ') }  
        });
    });
}

componentWillUnmount(){
    
}

ifChecked(ItemImage, checked){
  console.log(' dddddddddddddddddddddddd2222: ', JSON.stringify(this.state.imageuri))
  var image = checked ? this.state.imageuri : ItemImage 
  this.setState({showingImage : image})
  console.log('in if checked : ' + checked + this.state.imageuri + JSON.stringify(image))
  this.changeMarkerImage(this.state.showingImage)
}

render(){
return (  
  <View style={style.MainContainer}>
    <View style={{flex: 1, marginTop: 50, marginBottom: 30}}>    
      <View style={styles.checkboxContainer}>
        <CheckBox
          title='Do you want to use your image insted ?'
          checked={this.state.checked}
          checkedColor='#16A085'
          containerStyle={styles.checkboxContainer}
          onIconPress={() => {
            this.ifChecked(this.state.showingImage, !this.state.checked)
            console.log('checcccccccccccccccccccccck: ',this.state.checked)
            this.setState({checked: !this.state.checked});
          }}
          onPress={() => {
            this.ifChecked(this.state.showingImage, !this.state.checked)
            console.log('checcccccccccccccccccccccckaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa: ',this.state.checked)
            this.setState({checked: !this.state.checked});
          }}
        />
      </View> 
    </View>   
    
    <View style={{flex: 4}}>
      <Text> Select image : </Text>
      <FlatList
        data={ this.state.FlatListItems }   
        ItemSeparatorComponent = {this.FlatListItemSeparator}
        numColumns={4}
        renderItem={({item}) => 
        <View key={item.key} style={style.container}>
          <TouchableOpacity onPress={()=> {
            this.setState({checked: false});
            this.ifChecked(item.image, false);
          }}>
            <View style={{flex: 1}}>
                <Image source={{uri: item.image}} style={style.photo} resizeMode={'contain'}/>
            </View>
          </TouchableOpacity>
        </View>
        }
      />
    </View> 
    <View style={{flex: 2, justifyContent : 'center', alignItems: 'center', alignSelf: 'center'}}>
      <Image source={{uri : this.state.showingImage}} style={{width: 150, height: 150, borderRadius: 80}}  resizeMode={'cover'}/>
    </View>
  </View>   
    );
  }
}

const style = StyleSheet.create({
  MainContainer :{
      justifyContent: 'center',
      flexDirection: 'column',
      flex:1,
      paddingHorizontal: 16
    },
  container: {
      //flex: 1,
      flexDirection: 'row',
      padding: 10,
      marginLeft:3,
      marginRight:3,
      marginTop: 3,
      marginBottom: 3,
      borderRadius: 5,
      backgroundColor: '#FFF',
      elevation: 2,
      justifyContent: 'center',
      alignSelf: 'center',
      alignItems: 'center',
      borderWidth: 1,
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
      height: 50,
      width: 50,
      borderRadius: 30,
      alignSelf: 'center'
  },
  iconImage: {alignSelf: 'center', alignContent: 'center'}
});
