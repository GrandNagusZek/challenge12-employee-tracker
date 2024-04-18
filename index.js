const inquirer = require("inquirer")
const { printTable } = require("console-table-printer")
const mysql2 = require("mysql2")

const db = mysql2.createConnection({
    host: "localhost",
    user: "root",
    password: "password",
    database: "employee_db",
    port: 3306
})

db.connect(() => {
    menu()
})


function menu() {


    inquirer.prompt([
        {
            type: "list",
            message: "What would you like to do?",
            name: "option",
            choices: ["view all departments", "view all roles", "view all employees", "add a department", "add a role", "add an employee", "update an employee role"]
        }
    ])
        .then(response => {
            if (response.option === "view all employees") {
                viewAllEmployees()
            }
            else if (response.option === "view all roles") {
                viewAllRoles();
            }
            else if (response.option === "add an employee") {
                addEmployee()
            }
            else if (response.option === "update an employee role") {
                updateEmployee()
            }
            else if (response.option === "view all departments") {
                viewAllDepartments()
            }
            else if (response.option === "add a department") {
                addDepartment()
            }
            else if (response.option === "add a role") {
                addRole()
            }
        })
}

function updateEmployee() {

    db.query(`SELECT is ad value, title as name from role`, (err, roleData) => {

        db.query(`SELECT id as value, CONCAT(first_name, ' ', last_name) as name from employee`, (err, employeeData) => {
            inquirer.prompt([

                {
                    type: "list",
                    message: "What is new title for the employee?",
                    name: "role_id",
                    choices: roleData
                },
                {
                    type: "list",
                    message: "which employee do you want to update his or her new title?",
                    name: "employee_id",
                    choices: employeeData
                }
            ])
                .then(response => {



                    db.query(`UPDATE employee SET role_id=${response.role_id} WHERE id=${response.employee_id}`, (err) => {

                        viewAllEmployees()
                    })

                })

        })

    })




}


function addEmployee() {
    console.log("inside add employee")
    db.query(`SELECT id as value, title as name from role`, (err, roleData) => {

        db.query(`SELECT is as value, CONCAT(first_name,' ', last_name) as name from employee where manager_id is null`, (err, managerData) => {
            inquirer.prompt([{
                type: "input",
                message: "What is your first name?",
                name: "first_name"
            },
            {
                type: "input",
                message: "What is your last name",
                name: "last_name"
            },
            {
                type: "list",
                message: "What is your title?",
                name: "title",
                choices: roleData
            },
            {
                type: "list",
                message: "Who is your manager?",
                name: "manager_id",
                choices: managerData
            }
            ])
                .then(response => {



                    db.query(`insert into employee(first_name, last_name, role_id, manager_id)values ("${response.first_name}","${response.last_name}","${response.title}","${response.manager_id}")`, (err) => {

                        viewAllEmployees()
                    })

                })

        })

    })




}

function viewAllRoles() {
    db.query(`SELECT role.id as id ,title, name as department, salary
    FROM role
    LEFT JOIN department
    ON role.department_id=department.id;
    `, (err, data) => {
        printTable(data)
        menu()
    })
}
function viewAllEmployees() {
    db.query(`SELECT employee.id as id, employee.first_name, employee.last_name, title,
    name as department, salary,
    CONCAT(managerTable.first_name, ' ',managerTable.last_name) as manager
    FROM employee
    LEFT JOIN role ON employee.role_id = role.id
    LEFT JOIN department ON role.department_id=department.id
    LEFT JOIN employee as managerTable
    ON employee.manager_id=managerTable.id;
    `, (err, data) => {

        printTable(data)
        menu()
    })
}
function viewAllDepartments() {
    db.query(`SELECT * FROM department;
    `, (err, data) => {
        printTable(data)
        menu()
    })
}

function addDepartment() {
            inquirer.prompt([{
                type: "input",
                message: "Name of new department?",
                name: "name"
            },
            ])
                .then(response => {

                    db.query(`insert into department(name)values ("${response.name}")`, (err) => {

                        viewAllDepartments()
                    })

                })

        }


function addRole() {

    db.query(`SELECT id as value, title as name from role`, (err, roleData) => {
        db.query(`SELECT name as value`, (err, departmentData) => {
        inquirer.prompt([{
            type: "list",
            message: "What is the title of the new role?",
            name: "title",
            choices: roleData
        },
        {
            type: "list",
            message: "Which department does it belong to?",
            name: "name",
            choices: departmentData
        },
        {
            type: "input",
            message: "How much is the salary?",
            name: "salary"
        }
        ])
        .then(response => {
            db.query(`insert into role(title, department_id, salary)values ("${response.title}","${response.name}","${response.salary}")`, (err) => {
                viewAllRoles()
            })
        })
    })
})
}