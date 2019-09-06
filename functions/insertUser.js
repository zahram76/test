import SQLite from "react-native-sqlite-storage";
  
var DB = SQLite.openDatabase(
  {name : "db", createFromLocation : "~db.sqlite"});

  export function insertUser(phone_no, first_name, last_name, user_image){
    // console.log('image insert' + JSON.stringify(user_image));
    // console.log('image insert' + phone_no);
    // console.log('image insert' + first_name);
    // console.log('image insert' + last_name);
    DB.transaction((tx) => {
          console.log("execute transaction");
            tx.executeSql('insert into Users(phone_no, first_name, last_name, user_image) values (?,?,?,?)', 
              [phone_no,first_name, last_name, JSON.stringify(user_image)],
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