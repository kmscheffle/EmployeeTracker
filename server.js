const inquirer = require('inquirer');
// Import and require mysql2
const mysql = require('mysql2');


// Connect to database
const db = mysql.createConnection(
    {
        host: 'localhost',
        // MySQL username,
        user: 'root',
        // MySQL password
        password: '',
        database: 'employee_db'
    },
    console.log(`Connected to the employee_db database.`)
);
db.on("error", (err) => {
    console.log("- STATS Mysql2 connection died:", err);
});

function menu() {
    inquirer.prompt([
        {
            type: "list",
            name: "choice",
            message: "What would you like to do?",
            choices: ["view all departments", "view all roles", "view all employees", "add a department", "add a role", "add an employee", "update employee role", "quit"]
        }
    ]).then(answer => {
        if (answer.choice === "view all departments") { viewDepartments() }
        else if (answer.choice === "view all roles") { viewRoles() }
        else if (answer.choice === "view all employees") { viewEmployees() }
        else if (answer.choice === "add a department") { addDepartment() }
        else if (answer.choice === "add a role") { addRole() }
        else if (answer.choice === "add an employee") { addEmployee() }
        else if (answer.choice === "update employee role") { updateRole() }
        else { db.end() }

    })
}
function viewDepartments() {
    db.query('SELECT * FROM department', function (err, results) {
        if (err) console.log(err);
        console.table(results);
        menu()
    });
}

function viewRoles() {
    db.query('SELECT role.id, role.title, role.salary, department.name FROM role JOIN department on role.department_id=department.id', function (err, results) {
        if (err) console.log(err);
        console.table(results);
        menu()
    });
}

function viewEmployees() {
    const sql = `SELECT employee.id, employee.first_name AS "first name", employee.last_name 
                    AS "last name", role.title, department.name AS department, role.salary, 
                    concat(manager.first_name, " ", manager.last_name) AS manager
                    FROM employee
                    LEFT JOIN role
                    ON employee.role_id = role.id
                    LEFT JOIN department
                    ON role.department_id = department.id
                    LEFT JOIN employee manager
                    ON manager.id = employee.manager_id`
    db.query(sql, function (err, results) {
        if (err) console.log(err);
        console.table(results);
        menu()
    });
}

function addDepartment() {
    inquirer.prompt([{
        type: "input",
        name: "department_name",
        message: "What is the name of the new department?"
    }])
        .then(answer => {
            db.query("insert into department(name) values(?)", [answer.department_name], (err, res) => {
                if (err) console.log(err);
                console.log("new department inserted")
                menu()
            })
        })
}

function addRole() {
    db.query("select id as value, name as name from department", (err, res) => {
        const department = res


        inquirer.prompt([{
            type: "input",
            name: "role_title",
            message: "What is the name of the new role?"
        },
        {
            type: "input",
            name: "role_salary",
            message: "What is the salary of the role?"
        },
        {
            type: "list",
            name: "department",
            message: "Choose the department for the new role",
            choices: department
        }
        ])
            .then(answer => {
                db.query("insert into role(title, salary, department_id) values(?, ?, ?)", [answer.role_title, answer.role_salary, answer.department], (err, res) => {
                    if (err) console.log(err);
                    console.log("new role inserted")
                    menu()
                })
            })
    })
}

function addEmployee() {
    db.query("select id as value, title as name from role", (err, res) => {
        const roles = res
        db.query("select id as value, concat(first_name, ' ', last_name) as name from employee", (err, res) => {
            const employees = res


            inquirer.prompt([{
                type: "input",
                name: "fname",
                message: "What is the first name of the new employee?"
            },
            {
                type: "input",
                name: "lname",
                message: "What is the last name of the new employee?"
            },
            {
                type: "list",
                name: "roleid",
                message: "Choose the new employee's role",
                choices: roles
            },
            {
                type: "list",
                name: "empid",
                message: "Choose the new employee's manager",
                choices: employees
            }
            ])
                .then(answer => {
                    db.query("insert into employee(first_name, last_name, role_id, manager_id) values(?, ?, ?, ?)", [answer.fname, answer.lname, answer.roleid, answer.empid], (err, res) => {
                        if (err) console.log(err);
                        console.log("new employee inserted")
                        menu()
                    })
                })
        })
    })
}

function updateRole() {
    db.query("select id as value, title as name from role", (err, res) => {
        const roles = res
        db.query("select id as value, concat(first_name, ' ', last_name) as name from employee", (err, res) => {
            const employees = res


            inquirer.prompt([{
                type: "list",
                name: "fname",
                message: "What is the first name of the employee you would like to update?",
                choices: first_name
            },

            {
                type: "list",
                name: "lname",
                message: "What is the last name of the employee you would like to update?",
                choices: last_name
            },

            {
                type: "list",
                name: "roleid",
                message: "Choose the employee's new role",
                choices: roles
            },
            {
                type: "list",
                name: "empid",
                message: "Choose the new employee's manager",
                choices: employees
            }
            ])
                .then(answer => {
                    db.query("insert into employee(role_id, manager_id) values(?, ?)", [answer.roleid, answer.empid], (err, res) => {
                        if (err) console.log(err);
                        console.log("employee's role updated")
                        menu()
                    })
                })
        })
    })
}
menu()





