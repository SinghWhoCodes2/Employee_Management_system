const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
var Schema = mongoose.Schema;

var userSchema = new Schema({
  userName: {
    type: String,
    unique: true,
  },
  password: String,
  email: String,
  loginHistory: [{
    dateTime: Date,
    userAgent: String,
  }, ],
});

let User;

module.exports.initialize = function () {
  return new Promise(function (resolve, reject) {
    let pass1 = encodeURIComponent("Gapoldnav123123");
    let db = mongoose.createConnection(
      `mongodb+srv://nasingh:${pass1}@web1.0ykmk.mongodb.net/web1?retryWrites=true&w=majority`, {
        useNewUrlParser: true
      }
    );
    db.on('error', (err) => {
      reject(err + 'hahahhahahahahahahahahahahahhahahahahahhahahahahaha');
    });
    db.once('open', () => {
      User = db.model("users", userSchema);
      resolve();
    });
  });
};


module.exports.registerUser = (data) => {
  var prms = new Promise((resolve, reject) => {
    if (data.password != data.password2) {
      reject('oooo kaka tera password nhi chalda')
    } else {

      bcrypt.genSalt(10).then(salt => bcrypt.hash(data.password, salt)).then(hash => {
        data.password = hash;
        var newAccount = new User(data);
        newAccount.save((error) => {

          if (error) {
            if (error.code == 11000) {
              reject("User Name already taken")
            } else {
              reject("There was an error creating the user: " + error);
            }
          }
          resolve();

        })
      }).catch((err) => {
        reject('sorry sir there is problem in bcrypt' + err)
      })


    }
  });
  return prms;
};


module.exports.checkUser = (userData) => {
  console.log(userData);
  var prms = new Promise((resolve, reject) => {

    User.find({
        userName: userData.userName
      }).exec()
      .then((users) => {
        if (users.length == 0) {
          reject("Unable to find the Username" + users.userName);

        } else {

          bcrypt.compare(userData.password, users[0].password).then((result) => {
console.log(result);
            if (result == true) {

              if (users[0].loginHistory == null) {
                users[0].loginHistory = [];
              }
                users[0].loginHistory.push({
                  
                  dateTime: (new Date()).toString(),
                  userAgent: userData.userAgent
                })

                User.updateOne({
                  userName: users[0].userName
                }, {
                  $set: {
                    loginHistory: users[0].loginHistory
                  }
                }).exec().then(() => {
                  console.log('Success we did it');
                  resolve(users[0])
                }).catch((er)=>{
                  reject("Sorry Sir we are not able to get user"+er)
                })


            } else {
              reject("Unable to find Username:" + userData.userName);
            }

          })


        } 
      }).catch((err) => {
        reject("No user Found" + err);
      })
  })
  return prms;



}