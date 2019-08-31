import React from "react";
import {
  View, 
  Text, 
  Image,
  Dimensions
} from "react-native";
import { Menu as Menu1, MenuProvider,renderers,
   MenuOptions, MenuOption, MenuTrigger} from "react-native-popup-menu";

const { ContextMenu, SlideInMenu, Popover } = renderers;
const height = Dimensions.get('window').height;
const width = Dimensions.get('window').width;

export const MapTypeMenu= ({onChange}) => { // onchange for pass value to map
   // console.log('in map type menu');
    
    return(
      <MenuProvider style={{paddingLeft: 12, paddingRight: 8, paddingBottom: 220,borderRadius: 50, }}>
      <Menu1 
        renderer={ContextMenu}
        onSelect={onChange}>

        <MenuTrigger  >
          <View style={{ 
              paddingHorizontal: 7,
              paddingVertical: 7,
              borderRadius: 20,
              zIndex: 9,
              width: 45,
              height: 45,
              backgroundColor: '#fff',
              borderRadius: 50,
              shadowColor: '#000000',
              elevation: 7,
              shadowRadius: 5,
              shadowOpacity: 1.0,
              justifyContent: 'space-around',
              alignItems: 'center',

            }}>
            <Image style={{
              width: 28, height: 28
            }}
              source={require('../asset/layer.png')}/>
          </View>
        </MenuTrigger >

        <MenuOptions style={{flexDirection: "column",
          backgroundColor: "rgba(255,255,255,0.8)",color: 'transparent',}} >
          <MenuOption value={"standard"} style={{ alignContent: 'center',}}>
          <Image style={{ height: 50, width: 50}} 
              resizeMode='contain'
              source={require('../images/defaultMap.png')}/>
          <Text style={{color: 'gray', fontSize: 11, marginVertical: 3}}> Default </Text>
          </MenuOption>
          <MenuOption value={"satellite"}>
            <Image style={{height: 50, width: 50}} 
              resizeMode='contain'
              source={require('../images/sateliteMap.png')}/>
          <Text style={{color: 'gray', fontSize: 11, marginVertical: 3}}> Satellite </Text>
          </MenuOption>
          <MenuOption value={"terrain"}>
            <Image style={{height: 50, width: 50}} 
              resizeMode='contain'
              source={require('../images/terrianMap.png')}/>
          <Text style={{color: 'gray', fontSize: 11, marginVertical: 3}}> Terrain </Text>
          </MenuOption>
        </MenuOptions>
      </Menu1>
    </MenuProvider>);
  }
  