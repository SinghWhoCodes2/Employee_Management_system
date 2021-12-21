const Sequelize = require('sequelize');
var sequelize = new Sequelize('d6cbgfht98t5qf', 'nsjpacpyqqpmkh', '6563689af33f669b6e6844d766629051650bf4204bc4f4c1d90222ac02d451b3', {
    host: 'ec2-44-194-54-186.compute-1.amazonaws.com',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        ssl: {
            rejectUnauthorized: false
        }
    },
    query: {
        raw: true
    }
});




var Employee = sequelize.define('Employee', {
    employeeNum: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    firstName: Sequelize.STRING,
    lastName: Sequelize.STRING,
    email: Sequelize.STRING,
    SSN: Sequelize.STRING,
    addressStreet: Sequelize.STRING,
    addressCity: Sequelize.STRING,
    addressState: Sequelize.STRING,
    addressPostal: Sequelize.STRING,
    maritalStatus: Sequelize.STRING,
    isManager: Sequelize.BOOLEAN,
    employeeManagerNum: Sequelize.INTEGER,
    status: Sequelize.STRING,
    hireDate: Sequelize.STRING,
});

var Department = sequelize.define('Department', {
    departmentId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    departmentName: Sequelize.STRING

})

Department.hasMany(Employee, {
    foreignKey: 'department'
});


module.exports.initialize = () => {

    return new Promise((resolve, reject) => {
        sequelize.authenticate().then(() => console.log('Connection success.')).catch((err) => console.log("Unable to connect to DB.", err));
        sequelize.sync().then(() => {
            resolve();
        }).catch((err) => {
            reject("unable to sync the database : " + err)
        })



    })

}

module.exports.addEmployee = (employeeData) => {

    employeeData.isManager = (employeeData.isManager) ? true : false;
    for (let i in employeeData) {
        if (employeeData[i] == "") {
            employeeData[i] = null;
        }
      }
    var prms = new Promise((resolve, reject) => {


        sequelize.sync().then(() => {

            Employee.create({

                firstName: employeeData.firstName,
                lastName: employeeData.lastName,
                email: employeeData.email,
                SSN: employeeData.SSN,
                addressStreet: employeeData.addressStreet,
                addressCity: employeeData.addressCity,
                addressState: employeeData.addressState,
                addressPostal: employeeData.addressPostal,
                isManager: employeeData.isManager,
                employeeManagerNum: employeeData.employeeManagerNum,
                status: employeeData.status,
                hireDate: employeeData.hireDate,
                department: employeeData.department,

            }).then((data) => {
                resolve(data);
            }).catch((err) => {
                reject("unable to create employee : " + err)
            })

        })

    })

    return prms;

}

module.exports.getAllEmployees = () => {
    var prms = new Promise((resolve, reject) => {

        Employee.sync().then(() => {
            Employee.findAll().then((data) => {

                resolve(data);


            }).catch((err) => {
                reject("Error : " + err)
            })


        })


    })
    return prms;
}



module.exports.getDepartments = () => {
    var prms = new Promise((resolve, reject) => {
        sequelize.sync().then(() => {


            Department.findAll().then((data) => {

                resolve(data);

               
            }).catch((err) => {
                reject("Error : " + err)
            })

        })

    })
    return prms;
}





module.exports.getEmployeesByStatus = (employeestatus) => {
    var prms = new Promise((resolve, reject) => {

        sequelize.sync().then(() => {
            Employee.findAll({
                where: {
                    status: employeestatus
                }
            }).then((data) => {
                resolve(data);
            }).catch((err) => {
                reject("Error : " + err)
            })
        })


    });
    return prms;
};




module.exports.getEmployeesByManager = (man) => {


    var prms = new Promise((resolve, reject) => {

        sequelize.sync().then(() => {

            Employee.findAll({
                where: {
                    employeeManagerNum: man
                }
            }).then((data) => {
                if (data) {
                    resolve(data);
                }
            }).catch((err) => {
                console.log(err);
                reject("Error : " + err)
            })

        })


    });
    return prms;
};

module.exports.getEmployeesByDepartment = (dept) => {
  
    var prms = new Promise((resolve, reject) => {
        sequelize.sync().then(()=>{
            Employee.findAll({
                where: {
                    department:dept
                }
            }).then((data) => {
                if (data) {
                    resolve(data);
                }
               
                
            }).catch((err) => {
               reject(err)
            })
        })
       

    });
    return prms;
};




module.exports.updateDepartment = (departmentData) => {
   
    for (let i in departmentData) {
        if (departmentData[i] == "") {
            departmentData[i] = null;
        }
      }
      console.log(departmentData);
  //    console.log(departmentId + 'update is called');
    var prms = new Promise((resolve, reject) => {
        sequelize.sync().then(() => {

            Department.update({
                departmentName: departmentData.departmentName
            }, {
                where: {
                    departmentId: departmentData.departmentId
                    
                }
            }).then(() => {
             
                resolve("Department updated successfully");
            }).catch((err) => {
                reject("Unable to Update Department");
            })

        })

    });
    return prms;
};

module.exports.updateEmployee = (employeeData) => {
   
    employeeData.isManager = (employeeData.isManager) ? true : false;
 


    for (let i in employeeData) {
        if (employeeData[i] == "") {
            employeeData[i] = null;
        }
      }

  

    var prms = new Promise((resolve, reject) => {

     sequelize.sync().then(()=>{
        Employee.update({   
     
            firstName: employeeData.firstName,
            lastName: employeeData.lastName,
            email: employeeData.email,
            SSN: employeeData.SSN,
            addressStreet: employeeData.addressStreet,
            addressCity: employeeData.addressCity,
            addressState: employeeData.addressState,
            addressPostal: employeeData.addressPostal,
            isManager: employeeData.isManager,
            employeeManagerNum: employeeData.employeeManagerNum,
            status: employeeData.status,
            hireDate: employeeData.hireDate,
            department: employeeData.department
        }, {
            where: {
                employeeNum: employeeData.employeeNum
            }
        }).then(()=>{
            resolve('done');
        }).catch(() => {
            reject("Unable to Update");
        })
    }).catch(function(err){
        reject("Sync error in updateEmployee Function : " + err);
     })
       
    });
    return prms;
};





module.exports.addDepartment = (departmentData) => {

 
    for (let i in departmentData) {
        if (departmentData[i] == "") {
            departmentData[i] = null;
        }
      }

    var prms = new Promise((resolve, reject) => {

        sequelize.sync().then(() => {

            Department.create({

                departmentName: departmentData.departmentName

            }).then((data) => {
                if (data) {
                    resolve(data);
                }
            }).catch(() => {
                reject("unable to create new Department")
            })

        })
    })

    return prms;

}


module.exports.getEmployeeByNum = (num) => {
   
    var prms = new Promise((resolve, reject) => {
        sequelize.sync().then(()=>{
            Employee.findOne({
                where: {
                    employeeNum: num
                }
            }).then((data) => {
                if (data) {
                    resolve(data);
                }
            }).catch((err) => {
                reject("Error : " + err)
            })
        })
     
      

    });
    return prms;
};


module.exports.getDepartmentById = (id) => {
    var prms = new Promise((resolve, reject) => {
        sequelize.sync().then(()=>{
            Department.findOne({
                where: {
                    departmentId: id,
                }
            }).then((data) => {
                if (data) {
                    resolve(data);
                }
    
            }).catch((err) => {
                reject("Error : " + err)
            })
        })
      
    })
    return prms;
}


module.exports.deleteDepartmentById = (id) => {
    var prms = new Promise((resolve, reject) => {
        sequelize.sync().then(()=>{

            Department.destroy({
                where: {
                    departmentId: id,
                }
            }).then(() => {
    
                resolve("Department deleted");
    
    
            }).catch((err) => {
                reject("Error in deletion : " + err)
            })
        })
     
    })
    return prms;
}

module.exports.deleteEmployeeByNum = (id) => {
    var prms = new Promise((resolve, reject) => {

        sequelize.sync().then(()=>{

            Employee.destroy({
                where: {
                    employeeNum: id,
                }
            }).then(() => {
    
                resolve("Employee deleted");
    
    
            }).catch((err) => {
                reject("Error in deletion : " + err)
            })
        })
      
    })
    return prms;
}





