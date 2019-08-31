import SQLite from "react-native-sqlite-storage";
import { insertUser } from "../functions/insertUser.js";

var DB = SQLite.openDatabase(
    {name : "db", createFromLocation : "~db.sqlite"});

export const DbHelper= () =>{
    isRepeatedUser: (username, phone) => {
    console.log("Database OPEN");
    DB.transaction((tx) => {
    console.log("execute transaction " + "isRepeatedU");
    tx.executeSql('select username from CurrentTrackingUser where username=?', 
      [username],
         (tx, results) => {
          console.log('username Results',JSON.stringify(results.rows));
          if(results.rows.length == 0){
            tx.executeSql('select phone_no from CurrentTrackingUser where phone_no=?', 
            [phone],
              (tx, results) => {
                console.log('phone Results',JSON.stringify(results.rows));
                if(results.rows.length == 0){
                    callback(false)
              } else {
                alert('This mobile number is already in use. '); callback(true)
              }});
          } else { alert('This username is already in use. '); callback(true) }
        });
    });
  }
}