import SQLite from "react-native-sqlite-storage";
    
var DB = SQLite.openDatabase({name : "db", createFromLocation : "~db.sqlite"});
export function deleteLacationByTime(date, user_id){
 
      DB.transaction((tx) => {
        tx.executeSql('DELETE FROM Locations where user_id=? and substr(datatime,1,10)=?', [user_id, date], (tx, results) => {
              console.log('Results', results.rowsAffected);
              if (results.rowsAffected > 0) {
                alert(
                  'Success'+'\n'+'loacations deleted successfully') }
                  
        })})
  }