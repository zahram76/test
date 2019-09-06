import {StyleSheet, Dimensions} from 'react-native';

const {width : WIDTH} = Dimensions.get('window'); 
const {height : HEIGHT} = Dimensions.get('window'); 

const color = '#349e9f';

export const styles = StyleSheet.create({
    container: {
      ...StyleSheet.absoluteFillObject,
      justifyContent: "flex-start",
      alignItems: "center"
    },
    map: {
      ...StyleSheet.absoluteFillObject
    },
    bubble: {
      flex: 1,
      backgroundColor: "rgba(255,255,255,0.7)",
      paddingHorizontal: 18,
      paddingVertical: 12,
      borderRadius: 20
    },
    latlng: {
      width: 200,
      alignItems: "stretch"
    },
    button: {
      width: 80,
      paddingHorizontal: 12,
      alignItems: "center",
      marginHorizontal: 10
    },
    buttonContainer: {
      flexDirection: "row",
      marginVertical: 20,
      backgroundColor: "transparent"
    },
    MarkerImage: {
      width: 35,
      height: 45,
    },
    button1: {
      width: 100,
      height: 45,
      borderRadius: 25,
      backgroundColor: color,
      justifyContent: "center",
      marginTop: 20,
      alignItems: "center",
      marginHorizontal: 7
    },
    btnView: {
       marginBottom: 20,
       justifyContent: "center",
       flexDirection: "row-reverse",
       alignContent: "space-between",
     },
     text: {
      color: 'rgba(255,255,255,255)',
      fontSize: 16,
      textAlign: "center"
    },
    Addtext: {
      color: color,
      fontSize: 18,
      textAlign: "center"
    },
    
    backcontainer:{
      flex: 1,
      alignItems: "center",
      width: null,
      height: null,
      justifyContent: "center",
      backgroundColor: '#ffffff',
    },
    scrollView: {
      position: "absolute",
      bottom: 30,
      left: 0,
      right: 0,
      paddingVertical: 10,
    },
    MapTypeMenuStyle: {
        position: 'absolute',//use absolute position to show button on top of the map
        top: '3%', //for top align
        left: WIDTH-70,
        alignSelf: 'flex-end', //for align to right 
        borderRadius: 50,
        color: 'transparent',
      },
    btnEye: {
      position: 'absolute',
      top: 10,
      right: 42
    },
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#F5FCFF',
    },
    backcontainer:{
      flex: 1,
      alignItems: "center",
      width: null,
      height: null,
      justifyContent: "center",
      backgroundColor: '#ffffff',
    },
    scrolStyle: {
     flex: 1,
     backgroundColor: 'white',
    },
    inputContainer: {
      marginTop: 7
    },
    input: {
      width: WIDTH-55,
      height: 45,
      borderRadius: 25,
      fontSize: 16,
      paddingLeft: 45,
      backgroundColor: 'rgba(0,0,0,0.1)',
      color: '#000000',
      marginHorizontal: 25
    },
    inputIcon: {
      position: 'absolute',
      top: 14,
      left: 42
    },
    btnEye: {
      position: 'absolute',
      top: 10,
      right: 42
    },
    btnContainer:{
      flexDirection: "row",
    },
    btnLogin: { 
      width: WIDTH*(0.3),
      height: 45,
      borderRadius: 25,
      backgroundColor: color,
      justifyContent: "center",
      marginTop: 10,
      alignItems: "center",
      marginHorizontal: 7
    },
    btn:{
      height: 45,
      borderRadius: 25,
      color: color,
      backgroundColor: '#ffffff',
      justifyContent: "center",
      marginTop: 10,
      alignItems: "center",
      marginRight: 7, 
    },
    logo: {
      width: 100,
      height: 100
    },
    logoContainer: {
      alignItems: "center",
      marginTop: 50,
      marginBottom: 30
    },
    imageContainer: {
      marginTop: 40,
      justifyContent: "flex-end",
      flexDirection: "row-reverse",
      alignContent: "space-between",
    },
    grandmother: {
      marginTop: 26,
      width: 150,
      height: 225,
      position: "relative",
    },
    grandfather: {
      width: 170,
      height: 255,
      position: "relative",
    },
    grandmotherSignUp: {
      marginTop: 18,
      width: 120,
      height: 195,
      position: "relative",
    },
    grandfatherSignUp: {
      width: 140,
      height: 215,
      position: "relative",
    },
    checkboxContainer:{
      backgroundColor: '#ffffff',
      borderColor: '#ffffff'
    },
    addinput: {
      zIndex: 9,
      //borderBottomColor: '#BFBFBF',
      borderBottomWidth: 1,
      height: 40,
      fontSize: 16,
      //paddingLeft: 45, // if have icon
      color: '#000000',
      marginLeft: 25,
      marginRight: 25
    },
    felan: {
      zIndex: 9,
      position: 'absolute',
      height: 45,
      backgroundColor: '#fff',
      left: '5%',
      top: '2%',
      borderRadius: 50,
      shadowColor: '#000000',
      elevation: 7,
      shadowRadius: 5,
      shadowOpacity: 1.0,
      justifyContent: 'space-around',
      alignItems: 'center',
      alignSelf: 'center'
  },
  imageStyle:{
    width: 22,
    height: 22,
    alignSelf: 'center',
    left: 6,
    right: 10
  }
  });
  