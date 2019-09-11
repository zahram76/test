import SmsAndroid  from 'react-native-get-sms-android';

export function sendsms(lat,long,phoneNumber){
   // phoneNumber = '+989336812618';
    message = 'hello long:' + long + ' lat:' + lat;
    SmsAndroid.autoSend(phoneNumber, message, (fail) => {
        console.log("Failed with this error: " + fail)
    }, (success) => {
        console.log("SMS sent successfully" + success);
    });
  }
