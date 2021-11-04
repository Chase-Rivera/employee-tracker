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

const viewAllEmp = () => {
    query(`SELECT e.id, e.first_name, e.last_name, r.title, r.department, r.salary, m.employee_name AS manager FROM employee e LEFT OUTER JOIN (SELECT r.id, r.title, d.name AS department, r.salary FROM role r JOIN department d ON r.dept_id = d.id) r ON e.role_id = r.id LEFT OUTER JOIN (SELECT id, CONCAT(first_name, " ",last_name) as employee_name FROM employee) m ON e.manager_id = m.id`)
    .then((res) => {
        console.table(res);
        return nextAction();
    })
    .catch((err) => {
        console.error(err);
    })
};

const viewAllRoles = () => {
    query(`SELECT r.id, r.title, d.name AS department, r.salary FROM role r JOIN department d ON r.dept_id = d.id`)
    .then((res) => {
        console.table(res);
        return nextAction();
    })
    .catch((err) => {
        console.error(err);
    })
};

const viewAllDep = () => {
    query(`SELECT * FROM department`)
    .then((res) => {
        console.table(res);
        return nextAction();
    })
    .catch((err) => {
        console.error(err);
    })
};

const addDep = async () => {
    const depUserRes = await inquirer.prompt([
        {
            type: 'input',
            meaasage: 'What is the name of the department?',
            name: 'depName'
        }
    ]);

    const sql = `INSERT INTO department (name) VALUES (?)`;
    const params = depUserRes.depName;

    query(sql,params)
    .then((res) => {
        console.log(`Added ${params} to the database.`)
        return nextAction();
    })
    .catch((err) => {
        console.error(err);
    })
};

const addRole = async () => {
    let strDepRes = [], listDepName = [];
    await query(`SELECT * FROM department`)
        .then((res) => {
            strDepRes = JSON.parse(JSON.stringify(res));
            for (var i =0; i < strDepRes.length; i++) {
                listDepName.push(strDepRes[i].name);
            };
        })
        .catch((err) => console.error(err));

    const roleUserRes = await inquirer.prompt([
        {
            type: 'input',
            message: 'What is the name of the role?',
            name: 'rolename'
        },
        {
            type: 'input',
            message: 'What is the salary of the role?',
            name: 'roleSalary'
        },
        {
            type: 'input',
            message: 'Which department does this role reside under?',
            name: 'roleDep',
            choices: listDepName
        }
    ]);

    const sql = `INSERT INTO role (title, salary, dept_id) VALUES (?, ?, ?)`;
    const idRoleDep = strDepRes[strDepRes.findIndex(ary => ary.name === roleUserRes.roleDep)].id;
    const params = [roleUserRes.roleName, roleUserRes.roleSalary, idRoleDep];

    query(sql, params)
        .then((res) => {
            console.log(`Added ${roleUserRes.roleName} to the database.`)
            return nextAction();
        })
        .catch((err) => {
            console.error(err);
        })
};

nextAction();