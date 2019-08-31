import SQLite from "react-native-sqlite-storage";

var DB = SQLite.openDatabase(
  {name : "db", createFromLocation : "~db.sqlite"});
    
export function insertLocation(locType,latitude, longitude){
    var today = new Date();
    var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
    var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    var dateTime = date+' '+time;

      DB.transaction((tx) => {
        tx.executeSql('insert into Locations(datatime,locType, latitude, longitude) values (?,?,?,?)', 
          [dateTime, locType, latitude, longitude,],
             (tx, results) => {
              console.log('Results', results.rowsAffected);
        })})
  }