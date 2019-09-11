
import SQLite from "react-native-sqlite-storage";

var DB = SQLite.openDatabase(
    {name : "db", createFromLocation : "~db.sqlite"});
var settingFirstInsert = false;
export function initDatabase(){
  
    console.log("Database OPEN");
      DB.transaction((tx) => {
        console.log("execute transaction");
        tx.executeSql('CREATE TABLE IF NOT EXISTS Users(user_id INTEGER PRIMARY KEY AUTOINCREMENT, phone_no VARCHAR(12) unique not null , first_name VARCHAR(20) not null, last_name VARCKAR(20) not null, user_image Blob, sending_setting text not null, interval numeric)', [], (tx, results) => {
          var len = results.rows.length;
          console.log("\n Users ");
          console.log(JSON.stringify(results) + ' ' + len);
      });
        tx.executeSql('CREATE TABLE IF NOT EXISTS Locations(loc_id integer primary key autoincrement, datatime text not null, latitude text not null, longitude text not null)', [], (tx, results) => {
          var len = results.rows.length;
          console.log("\n Locations ");
          console.log(JSON.stringify(results) + ' ' + len);
        });
        tx.executeSql('CREATE TABLE IF NOT EXISTS CurrentTrackingUser(user_id integer primary key autoincrement, username text not null, password text not null, phone_no text not null, user_image BLOB)', [], (tx, results) => {
          var len = results.rows.length;
          console.log("\n CurrentTrackingUser ");
          console.log(JSON.stringify(results) + ' ' + len);
        });
        tx.executeSql('CREATE TABLE IF NOT EXISTS Settings(setting_name text primary key, value text not null)', [], (tx, results) => {
          var len = results.rows.length;
          //settingFirstInsert = true;
          console.log("\n Settings "+ settingFirstInsert);
          console.log(JSON.stringify(results) + ' ' + len);
        });
          console.log("\n insert into settings mappppppppppp ");
          tx.executeSql('insert into Settings(setting_name, value) values(?,?)', ['mapType','standard'], (tx, results) => {
            var len = results.rowsAffected;
            console.log("\n insert maptype ");
            console.log(JSON.stringify(results) + ' ' + len);
          });
          console.log("\n insert into settings markerrrrrrrrr ");
          tx.executeSql('insert into Settings(setting_name, value) values(?,?)', ['markerImage', 'asset:/images//marker1.png'], (tx, results) => {
            var len = results.rowsAffected;
            console.log("\n insert markerImage ");
            console.log(JSON.stringify(results) + ' ' + len);
          });
      });


}