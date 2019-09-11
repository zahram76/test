import React from "react";
import {
  View, 
  Image,
  Alert} from "react-native";
import {styles} from '../style.js'
import SettingsList from 'react-native-settings-list';

export const Setting = function(props){ //({ get, props })=>{
    const navigation = props.navigation;
    const cb = props.cb ? props.cb : ()=> console.log('callout function not call')
    return (     
      <View style={{backgroundColor: '#F4FFFF',flex:1, marginTop: 45}}>
        <SettingsList borderColor='#c8c7cc' defaultItemSize={56}>
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
            icon={<Image style={styles.imageStyle} source={require('../asset/user-account.png')}/>}
            title='Account'
            titleInfo=' '
            titleInfoStyle={styles.titleInfoStyle}
            onPress={() => navigation.navigate('AccountSetting')}
          />
          <SettingsList.Item
            icon={<Image style={styles.imageStyle} source={require('../asset/map-setting.png')}/>}
            title='Map type'
            titleInfo=' '
            titleInfoStyle={styles.titleInfoStyle}
            onPress={() => navigation.navigate('MapSetting')}
          />
          <SettingsList.Item
            icon={<Image style={styles.imageStyle} source={require('../asset/marker-setting.png')}/>}
            title='Marker'
            onPress={() => navigation.navigate('MarkerSetting')}
          />
          <SettingsList.Item
            icon={<Image style={styles.imageStyle} source={require('../asset/users-group.png')}/>}
            title='Tracker user'
            titleInfo=' '
            titleInfoStyle={styles.titleInfoStyle}
            onPress={() => navigation.navigate('TrackerUser')}
          />
          <SettingsList.Header headerStyle={{marginTop:4}}/>
          <SettingsList.Item
            icon={<Image style={styles.imageStyle} source={require('../asset/treasure-map.png')}/>}
            title='History'
            titleInfo=' '
            titleInfoStyle={styles.titleInfoStyle}
            onPress={() => navigation.navigate('History')}
          />
          <SettingsList.Item
            icon={<Image style={styles.imageStyle} source={require('../asset/notification.png')}/>}
            title='Notifications'
            onPress={() => Alert.alert('Route To Notifications Page')}
          />
          <SettingsList.Item
            icon={<Image style={styles.imageStyle} source={require('../asset/setting.png')}/>}
            title='General setting'
            onPress={() => Alert.alert('Route To Do Not Disturb Page')}
          />
        </SettingsList>
      </View>
    );
}