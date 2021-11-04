const util = require("util");
const inquirer = require("inquirer");
const mysql = require("mysql2");
const cTable = require("console.table");


const db = mysql.createConnection(
    {
        host: 'localhost',
        user: 'root',
        password: 'Washington100!',
        database: 'employees_db'
    }
);

const query = util.promisify(db.query).bind(db);

const nextAction = async () => {
    const res = await inquirer.prompt([
        {
            type: 'list',
            message: 'What is your next action?',
            name: 'nextAction',
            choices: ["View all departments", "View all roles", "View all employees", "Add a department", "Add a role", "Add an employee", "Update employee role", "Quit"]
        }
    ]);
    switch (res.nextAction) {
        case 'View all departments':
            return viewAllDep();
        case 'View all roles':
            return viewAllRoles();
        case 'View all employees':
            return viewAllEmp();
        case 'Add a department':
            return addDep();
        case 'Add a role':
            return addRole();
        case 'Add an employee':
            return addEmp();
        case 'Update an employee role':
            return updateEmpRole();
        default:
            console.log(`\nSeeUnxtTime!\n`);
            return process.exit(0);

    }
};