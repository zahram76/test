import {StyleSheet} from "react-native";

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
      backgroundColor: '#16A085',
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
        //left: '80%',
        alignSelf: 'center', //for align to right 
        borderRadius: 20,
        color: 'transparent',
      },
  });
  