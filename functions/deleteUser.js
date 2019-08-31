import SQLite from "react-native-sqlite-storage";
  
var DB = SQLite.openDatabase(
  {name : "db", createFromLocation : "~db.sqlite"});

export function deleteUser(phone_no){
      DB.transaction((tx) => {
        tx.executeSql('DELETE FROM Users where phone_no=?', [phone_no], (tx, results) => {
              console.log('Results', results.rowsAffected);
              if (results.rowsAffected > 0) {
                console.log(
                  'Success'+'\n'+'user deleted successfully') 
                } else {
                    console.log('no user to delete') 
                }  
        })});
  }