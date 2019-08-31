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
import FlatListComponent from './component/FlatList.js'

const AppStack = createStackNavigator({
  Map: {
    screen: Map,
  },
   Setting: {
    screen: Setting,
    navigationOptions: {
      title: 'Setting',
      headerStyle: {  
        backgroundColor: '#023D5A',
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
    },
   },
   Profile: {
    screen: Profile,  
    navigationOptions: {
      title: 'Profile',
      headerStyle: {
        backgroundColor: '#023D5A',
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
    },
   },
   AddPerson: {
    screen: AddPerson,
    navigationOptions: {
      title: 'Add Person',
      headerStyle: {
        backgroundColor: '#023D5A',
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
    },
   },
  FlatListComponent: {
    screen: FlatListComponent,
    navigationOptions: {
      title: 'flat list',
      headerStyle: {
        backgroundColor: '#023D5A',
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
    },
  }
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
