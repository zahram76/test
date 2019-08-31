import SQLite from "react-native-sqlite-storage";
  
var DB = SQLite.openDatabase(
  {name : "db", createFromLocation : "~db.sqlite"});

  export function insertUser(phone_no){
    DB.transaction((tx) => {
          console.log("execute transaction");
            tx.executeSql('insert into Users(phone_no, first_name, last_name) values (?,?,?)', 
              [phone_no,"first_name", "last_name"],
                (tx, results) => {    
                  console.log('Results', results.rowsAffected);
                  if (results.rowsAffected > 0) {
                    console.log('Success'+'\n'+'You are Registered Successfully');
                  } else {
                    console.log('Registration Failed');
                  }
            });
          });
    }