import React, { Component } from 'react';
import {Dimensions, View, Text, TouchableOpacity, StyleSheet, Image} from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

const height = Dimensions.get('window').height;
const width = Dimensions.get('window').width;

export const CurrentLocationButton = function(props){
    const cb = props.cb ? props.cb : ()=> console.log('callout function not call')
    const bottom = props.bottom ? props.bottom : 65
    return(
        <View style={[styles.container, {top: '90%'}]}>
            <TouchableOpacity onPress ={() => { cb() }}>
            <Image 
                source={require('../asset/myLocation.png')}
                style={{width:28, height:28}}/>
            </TouchableOpacity>
        </View>
    )
}

const styles= StyleSheet.create({
    container: {
        zIndex: 9,
        position: 'absolute',
        width: 45,
        height: 45,
        backgroundColor: '#fff',
        left: width-70,
        borderRadius: 50,
        shadowColor: '#000000',
        elevation: 7,
        shadowRadius: 5,
        shadowOpacity: 1.0,
        justifyContent: 'space-around',
        alignItems: 'center',
       // alignSelf: 'flex-end'
    }
})