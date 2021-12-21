/*********************************************************************************
*  WEB322 – Assignment 05
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source
*  (including 3rd party web sites) or distributed to other students.
*
*  Name: Navpreet singh Student ID: 150629194 Date: 18-November-2021
*
*  Online (Heroku) Link:    https://mysterious-brook-95773.herokuapp.com/
citation
<a href='https://www.freepik.com/vectors/infographic'>Infographic vector created by macrovector - www.freepik.com</a>
********************************************************************************/
var express = require('express');
var app = express();
var path = require("path");
var multer = require('multer');
var fs = require('fs');
var bodyParser = require('body-parser');
app.use(express.static('public'));
const exphbs = require('express-handlebars');
app.engine('.hbs', exphbs({
    extname: '.hbs',
    defaultLayout: "main",
    helpers: {
        navLink: function (url, options) {
            return '<li' +
                ((url == app.locals.activeRoute) ? ' class="active" ' : '') +
                '><a href="' + url + '">' + options.fn(this) + '</a></li>';
        },
        equal: function (lvalue, rvalue, options) {
            if (arguments.length < 3)
                throw new Error("Handlebars Helper equal needs 2 parameters");
            if (lvalue != rvalue) {
                return options.inverse(this);
            } else {
                return options.fn(this);
            }
        }
    }
}));
app.set('view engine', '.hbs');
var dataService = require('./data-service')
var dataServiceAuth = require('./data-service-auth')
const clientSessions = require("client-sessions");
app.use(express.static('image'));

// app.use(function (req, res, next) {
//     let route = req.baseUrl + req.path;
//     app.locals.activeRoute = (route == "/") ? "/" : route.replace(/\/$/, "");
//     next();
// });


app.use(bodyParser.urlencoded({
    extended: true
}));

var HTTP_PORT = process.env.PORT || 9100;





app.use(clientSessions({
    cookieName: "session",
    secret: "once_upon_a_time_there_was_a_thirsty_monkey_mr_honkyDonky",
    duration: 2 * 60 * 1000,
    activeDuration: 1000 * 60
}));

app.use(function (req, res, next) {
    res.locals.session = req.session;
    next();
});

function ensureLogin(req, res, next) {
    if (!req.session.user) {
        res.redirect('/login');
    } else {
        next();
    }
}



app.get("/", function (req, res) {
    res.render("home");
});

app.get("/about", function (req, res) {
    res.render("about");
});






app.get("/employees", ensureLogin, function (req, res) {
    if (req.query.status) {
        dataService.getEmployeesByStatus(req.query.status).then((data) => {
            if (data) {
                res.render("employees", {
                    employees: data
                });
            } else {
                res.render("employees", {
                    message: "no results"
                });
            }

        }).catch(function (err) {
            res.render({
                message: "there is problem in getEmployeesByStatus"
            });
        });
    } else if (req.query.department) {
        dataService.getEmployeesByDepartment(req.query.department).then((data) => {
            if (data) {
                res.render("employees", {
                    employees: data
                });
            } else {
                res.render("employees", {
                    message: "no results"
                });
            }
        }).catch(function (err) {
            res.render({
                message: "there is problem in getEmployeesBydept"
            });
        });
    } else if (req.query.manager) {
        dataService.getEmployeesByManager(req.query.manager).then((data) => {
            if (data) {
                res.render("employees", {
                    employees: data
                });
            } else {
                res.render("employees", {
                    message: "no results"
                });
            }
        }).catch(function (err) {
            res.render({
                message: "there is problem in getEmployeesByManager"
            });
        });
    } else {

        dataService.getAllEmployees().then((data) => {

            res.render("employees", {
                employees: data
            });


        }).catch(function (err) {

            res.render({
                message: "there is problem in employee"
            });

        });
    }


});

app.get("/employee/:empNum", ensureLogin, (req, res) => {

    // initialize an empty object to store the values
    let viewData = {};

    dataService.getEmployeeByNum(req.params.empNum).then((data) => {
        if (data) {
            viewData.employee = data; //store employee data in the "viewData" object as "employee"
        } else {
            viewData.employee = null; // set employee to null if none were returned
        }
    }).catch(() => {
        viewData.employee = null; // set employee to null if there was an error
    }).then(dataService.getDepartments).then((data) => {
        viewData.departments = data; // store department data in the "viewData" object as "departments"

        // loop through viewData.departments and once we have found the departmentId that matches
        // the employee's "department" value, add a "selected" property to the matching 
        // viewData.departments object

        for (let i = 0; i < viewData.departments.length; i++) {
            if (viewData.departments[i].departmentId == viewData.employee.department) {
                viewData.departments[i].selected = true;
            }
        }

    }).catch(() => {
        viewData.departments = []; // set departments to empty if there was an error
    }).then(() => {
        if (viewData.employee == null) { // if no employee - return an error
            res.status(404).send("Employee Not Found");
        } else {
            res.render("employee", {
                viewData: viewData
            }); // render the "employee" view
        }
    });
});


app.post('/employee/update', ensureLogin, (req, res) => {
    dataService.updateEmployee(req.body).then(res.redirect('/employees'))
        .catch(function () {
            res.status(500).send("Unable to Update");
        });
});
app.get("/departments", ensureLogin, function (req, res) {


    dataService.getDepartments().then((data) => {
        res.render("departments", {
            departments: data
        });
    }).catch(function (err) {
        res.render({
            message: "there is problem in getDepartments"
        });

    });
});



app.get("/employees/add", ensureLogin, function (req, res) {
    dataService.getDepartments().then(data => {
        res.render("addEmployee", {
            departments: data
        })
    }).catch(er => {
        res.render("addEmployee", {
            departments: []
        });
    })
});

app.post("/employees/add", ensureLogin, (req, res) => {
    dataService.addEmployee(req.body).then(
        res.redirect("/employees"))
});


const storage = multer.diskStorage({
    destination: "./public/images/uploaded",
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage
});

app.get("/images", ensureLogin, function (req, res) {
    fs.readdir(path.join(__dirname, "/public/images/uploaded"), (err, data) => {

        res.render('images', {
            image: data
        });
    })
});

app.get("/Images/add", ensureLogin, function (req, res) {
    res.render("addImage");
});

app.post("/Images/add", ensureLogin, upload.single("imageFile"), (req, res) => {
    res.redirect("/images");
});



// department section 


app.get("/departments/add", ensureLogin, function (req, res) {
    res.render("addDepartment");
});


app.post("/departments/add", ensureLogin, (req, res) => {
    dataService.addDepartment(req.body).then(
        res.redirect("/departments"))
});


app.post('/department/update', ensureLogin, (req, res) => {
    dataService.updateDepartment(req.body).then(res.redirect('/departments'))
        .catch(function () {
            res.render({
                message: "error in updating"
            });
        });
});

app.get('/department/:departmentId', ensureLogin, (req, res) => {
    dataService.getDepartmentById(req.params.departmentId).then((data) => {
            res.render('department', {
                department: data
            });
        })
        .catch((err) => {
            res
                .status(404)
                .render('department', {
                    message: '404: Department Not Found'
                });
        });
});


app.post('/departments/delete/:departmentId', ensureLogin, (req, res) => {
    dataService.deleteDepartmentById(req.params.departmentId).then(res.redirect('/departments'))
        .catch(function () {
            res.status(500).render('department', {
                message: 'Unable to Remove Department / Department not found)',
            });
        });
});

app.post('/employees/delete/:employeeNum', ensureLogin, (req, res) => {
    dataService.deleteEmployeeByNum(req.params.employeeNum).then(res.redirect('/employees'))
        .catch(function () {
            res.status(500).render('department', {
                message: 'Unable to Remove employees / employees not found)',
            });
        });
});

app.get("/login", (req, res) => {
    res.render("login");
})

app.get("/register", (req, res) => {
    res.render("register");
})

app.post("/register", (req, res) => {
    dataServiceAuth.registerUser(req.body).then(() => {
        res.render(('register'),{successMessage: "User created"}
        )
    }).catch((err) => {
        res.render('register', {errorMessage: err, userName: req.body.userName} )
    })
})

app.post('/login',(req,res)=>{
    req.body.userAgent = req.get('User-Agent');
    dataServiceAuth.checkUser(req.body).then((user) => {
        req.session.user = {
        userName:user.userName ,
        email: user.email,
        loginHistory:user.loginHistory 
        }
        res.redirect('/employees');
       }).catch((e)=>{
           res.render('login',{ errorMessage: e, userName: req.body.userName })
       })
       
})

app.get("/logout", function(req, res) {
    req.session.reset();
    res.redirect('/');
});

app.get('/userHistory', ensureLogin, (req, res) => {
    res.render('userHistory');
  });



app.use((req, res) => {

    res.status(404).sendFile(path.join(__dirname, "/views/notfound.html"));

});











dataService.initialize()
    .then(dataServiceAuth.initialize)
    .then(function () {
        app.listen(HTTP_PORT, function () {
            console.log("app listening on: " + HTTP_PORT)
        });
    }).catch(function (err) {
        console.log("unable to start server: " + err);
    });