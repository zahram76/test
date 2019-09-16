import SQLite from "react-native-sqlite-storage";
import Geohash from 'latlon-geohash';
var DB = SQLite.openDatabase(
  {name : "db", createFromLocation : "~db.sqlite"});
    
export function insertLocation(latitude, longitude, lastlat, lastlong){

    var geo = Geohash.encode(latitude, longitude, 8);
    var lastgeo = Geohash.encode(lastlat, lastlong, 8);
    if(geo != lastgeo){
      console.log('location are not equl then is save: ' , geo, lastgeo )
      var today = new Date();
      var date = today.getFullYear()+'-'+(today.getMonth()+1<10? '0'+(today.getMonth()+1) : today.getMonth()+1)+
        '-'+(today.getDate()<10? '0'+today.getDate() : today.getDate());
      var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
      var dateTime = date+' '+time;
      console.log('time in insert locaiton ', dateTime);

      DB.transaction((tx) => {
        tx.executeSql('insert into Locations(datatime, latitude, longitude) values (?,?,?)', 
          [dateTime, latitude, longitude],
             (tx, results) => {
              console.log('Results', results.rowsAffected, dateTime);
        })})
    }
    else {
      console.log('location are equl then is not save: ' , geo, lastgeo )
    }
  }