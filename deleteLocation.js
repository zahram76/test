import SQLite from "react-native-sqlite-storage";

var DB = SQLite.openDatabase(
    {name : "database", createFromLocation : "~database.sqlite"});
    
export function deleteLacation(){
      DB.transaction((tx) => {
        tx.executeSql('DELETE FROM Locations', [], (tx, results) => {
              console.log('Results', results.rowsAffected);
              if (results.rowsAffected > 0) {
                alert(
                  'Success'+'\n'+'loacations deleted successfully') }
                  
        })})
  }