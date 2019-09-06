import React, {Component} from "react";
import{
  AppRegistry,
} from "react-native";
import {
  createStackNavigator,
  createAppContainer,
  createSwitchNavigator,
} from 'react-navigation';
import Map from './screens/Map.js';
import SignIn from './screens/SignIn';
import SignUp from './screens/SignUp';
import Profile from './screens/Profile.js';
import Setting from './screens/Setting';
import AddPerson from './screens/AddPerson.js';
import AuthLoadingScreen from './screens/AuthLoading.js';
import TrackerUser from './component/FlatList.js'
import imagePicker from './screens/imagePicker.js';
import MapSetting from './screens/MapSetting.js';
import AccountSetting from './screens/AccountSetting.js';

const color = '#349e9f';

const AppStack = createStackNavigator({
  Map: {
    screen: Map,
  },
   Profile: {
    screen: Profile,  
   },
   AddPerson: {
    screen: AddPerson,
   },
   AccountSetting: {
    screen: AccountSetting,
  },
   TrackerUser: {
    screen: TrackerUser,
  },
  MapSetting: {
    screen: MapSetting,
    navigationOptions: {
      title: 'Map setting',
      headerStyle: {
        backgroundColor: color,
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
    },
  },
  imagePicker: {
    screen: imagePicker,
    navigationOptions: {
      title: 'image Picker',
      headerStyle: {  
        backgroundColor: color,
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
    },
   },
});

const AuthStack = createStackNavigator({ 
  SignIn: { 
    screen: SignIn ,
    navigationOptions: {
    header: null, //this will hide the header
    },
  },
  SignUp: { 
    screen: SignUp ,
    navigationOptions: {
    header: null, //this will hide the header
    },
  },
 });

const AuthLoading = createAppContainer(createSwitchNavigator(
  {
    AuthLoading: AuthLoadingScreen,
    App: AppStack,
    Auth: AuthStack,
    
  },
  {
    initialRouteName: 'AuthLoading',
  }
));

export default class App extends Component {
  render(){
    return(
      <AuthLoading>
         
      </AuthLoading>
     
    )
  }
}

AppRegistry.registerComponent('test', () => App)
