import SmsListener from 'react-native-android-sms-listener';
import SmsAndroid from 'react-native-get-sms-android';
import SQLite from "react-native-sqlite-storage";

var DB = SQLite.openDatabase({name : "db", createFromLocation : "~db.sqlite"});

export function parseMessage(message){ 
  const res = message.body.split(' ');
  var m = ''
    if (res[0] == 'hello' && res[1] == 'can' && res[2] == 'i' && res[3] == 'access' && res[4] == 'to'
    && res[5] == 'your' && res[6] == 'location?'){
      console.log(' map for init setting');
      DB.transaction((tx) => {
        console.log("execute transaction");
        tx.executeSql('select user_id from Users where phone_no=?', [message.originatingAddress], (tx, results) => {
            if(results.rows.length == 1){
                m = 'hello new_tracking_user yes';
            } else m = 'no'

            SmsAndroid.autoSend(message.originatingAddress, m, (fail) => {
                console.log("Failed with this error: " + fail)
            }, (success) => {
                console.log("SMS sent successfully" + success);
            });
        });
    });
  }
  else if (res[0] == 'hello' && res[1] == 'set' && res[2] == 'interval'){
      var type = res[4] 
      var interval = 20
      if (type == 'interval')
        interval = parseInt(res[5])
      console.log(' map for init setting');
      DB.transaction((tx) => {
        console.log("execute transaction");
        tx.executeSql('update Users set sending_setting=?, interval=? where phone_no=?', [type,interval,message.originatingAddress], (tx, results) => {
            if(results.rows.length == 1){
                m = 'hello interval is ok';
            } else m = 'no'

            SmsAndroid.autoSend(message.originatingAddress, m, (fail) => {
                console.log("Failed with this error: " + fail)
            }, (success) => {
                console.log("SMS sent successfully" + success);
            });
        });
    });
  }
}

