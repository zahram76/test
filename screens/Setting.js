import React from "react";
import {
  View, 
  Image,
  Alert,
TouchableOpacity} from "react-native";
import {styles} from '../style.js'
import SettingsList from 'react-native-settings-list';
import Menu, { MenuItem } from 'react-native-material-menu';
import Icon from "react-native-vector-icons/Ionicons";
import AsyncStorage from '@react-native-community/async-storage';

export const Setting = function(props){ //({ get, props })=>{
    var bgColor = '#DCE3F4';

    const cb = props.cb ? props.cb : ()=> console.log('callout function not call')
    return (     
      <View style={{backgroundColor:'#EFEFF4',flex:1}}>
        <SettingsList borderColor='#c8c7cc' defaultItemSize={50}>
          {/* <SettingsList.Header headerStyle={{marginTop:15}}/> */}
          {/* <SettingsList.Item
            icon={
                <Image style={styles.imageStyle} source={require('../images/cartoon-marker-48.png')}/>
            }
            hasSwitch={true}
            switchState={get}
            switchOnValueChange={(val) => cb(val)}
            hasNavArrow={false}
            title='Background Geo'
          /> */}
          <SettingsList.Item
            icon={<Image style={styles.imageStyle} source={require('../images/cartoon-marker-48.png')}/>}
            title='Accountt'
            titleInfo=' '
            titleInfoStyle={styles.titleInfoStyle}
            onPress={() => Alert.alert('Route to add account Page')}
          />
          <SettingsList.Item
            icon={<Image style={styles.imageStyle} source={require('../images/cartoon-marker-48.png')}/>}
            title='Markers'
            titleInfo=' '
            titleInfoStyle={styles.titleInfoStyle}
            onPress={() => Alert.alert('Route to markers Page')}
          />
          <SettingsList.Item
            icon={<Image style={styles.imageStyle} source={require('../images/cartoon-marker-48.png')}/>}
            title='Distance filter'
            onPress={() => Alert.alert('Route To distance filter Page')}
          />
          <SettingsList.Item
            icon={<Image style={styles.imageStyle} source={require('../images/cartoon-marker-48.png')}/>}
            title='Map'
            titleInfo=' '
            titleInfoStyle={styles.titleInfoStyle}
            onPress={() => Alert.alert('Route To map setting Page')}
          />
          <SettingsList.Header headerStyle={{marginTop:15}}/>
          <SettingsList.Item
            icon={<Image style={styles.imageStyle} source={require('../images/cartoon-marker-48.png')}/>}
            title='Notifications'
            onPress={() => Alert.alert('Route To Notifications Page')}
          />
          <SettingsList.Item
            icon={<Image style={styles.imageStyle} source={require('../images/cartoon-marker-48.png')}/>}
            title='Theme'
            onPress={() => Alert.alert('Route To Theme Page')}
          />
          <SettingsList.Item
            icon={<Image style={styles.imageStyle} source={require('../images/cartoon-marker-48.png')}/>}
            title='General setting'
            onPress={() => Alert.alert('Route To Do Not Disturb Page')}
          />
        </SettingsList>
      </View>
    );
}