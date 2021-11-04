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
            type: "list",
            message: "What is your next action?",
            name: "nextAction",
            choices: ["View all departments", "View all roles", "View all employees", "Add a department", "Add a role", "Add an employee", "Update employee role", "Quit"]
        }
    ]);
    switch (res.nextAction) {
        case "View all departments":
            return viewAllDep();
        case "View all roles":
            return viewAllRoles();
        case "View all employees":
            return viewAllEmp();
        case "Add a department":
            return addDep();
        case "Add a role":
            return addRole();
        case "Add an employee":
            return addEmp();
        case "Update an employee role":
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
            type: "input",
            meaasage: "What is the name of the department?",
            name: "depName"
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
            type: "input",
            message: "What is the name of the role?",
            name: "rolename"
        },
        {
            type: "input",
            message: "What is the salary of the role?",
            name: "roleSalary"
        },
        {
            type: "input",
            message: "Which department does this role reside under?",
            name: "roleDep",
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

const addEmp = async () => {
    let strRoleRes = [], listRoleTit = [], strMngRes = [], listMngName = [];
    await query(`SELECT r.id, r.title FROM role r`)
        .then((res) => {
            strRoleRes = JSON.parse(JSON.stringify(res));
            for (var i = 0; i < strRoleRes.length; i++) {
                listRoleTit.push(strRoleRes[i].title);
            };
        })
        .catch((err) => console.error(err));

    await query(`SELECT e.id, CONCAT(e.first_name, " " , e.last_name) AS name FROM employee e`)
        .then((res) => {
            strMngRes = JSON.parse(JSON.stringify(res));
            strMngRes.push({ id: null, name: 'None'});
            for (var i = 0; i < strMngRes.length; i++) {
                listMngName.push(strMngRes[i].name);
            };
        })
        .catch((err) => console.error(err));
    
    const empUserRes = await inquirer.prompt([
        {
            type: "input",
            message: "What is the employee's first name?",
            name: "empFirstName"
        },
        {
            type: "input",
            message: "What is the employee's last name?",
            name: "empLastName"
        },
        {
            type: "list",
            message: "What is the employee's role?",
            name: "empRole",
            choices: listRoleTit
        },
        {
            type: "list",
            message: "Who is the employee's manager?",
            name: "empMng",
            choices: listMngName
        }
    ]);

    const sql = `INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)`;
    const idEmpRole = strRoleRes[strRoleRes.findIndex(ary => ary.title === empUserRes)].id;
    const idEmpMng = strMngRes[strMngRes.findIndex(ary => ary.name === empUserRes.empMng)].id;
    const params = [empUserRes.empFirstname, empUserRes.empLastName, idEmpRole, idEmpMng];

    query(sql, params)
        .then((res) => {
            console.log(`Added ${empUserRes.empFirstName + " " + empUserRes.empLastName} to the database.`)
            return nextAction();
        })
        .catch((err) => {
            console.error(err);
        })
};

const updateEmpRole = async () => {
    let strEmpRes = [], listEmpName = [], strRoleRes = [], listRoleTit = [];
    await query(`SELECT e.id, CONCAT(e.first_name, " " , e.last_name) AS name FROM employee e`)
        .then((res) => {
            strEmpRes = JSON.parse(JSON.stringify(res));
            for (var i = 0; i < strEmpRes.length; i++) {
                listEmpName.push(strEmpRes[i].name);
            };
        })
        .catch((err) => console.error(err));

    await query(`SELECT r.id, r.title FROM role r`)
        .then((res) => {
            strRoleRes = JSON.parse(JSON.stringify(res));
            for (var i = 0; i < strRoleRes.length; i++) {
                listRoleTit.push(strRoleRes[i].title);
            };
        })
        .catch((err) => console.error(err));

    const updateEmpRoleRes = await inquirer.prompt([
        {
            type: "list",
            message: "Which employee's role would you like to update?",
            name: "empName",
            choices: listEmpName
        },
        {
            type: "list",
            message: "Which role would you like to assign to this employee?",
            name: "empUpdatedRole",
            choices: listRoleTit
        }
    ]);

    const sql = `UPDATE employee SET role_id = ? WHERE id = ?`;
    const idEmpName = strEmpRes[strEmpRes.findIndex(ary => ary.name === updateEmpRoleRes.empName)].id;
    const idRoleTit = strRoleRes[strRoleRes.findIndex(ary => ary.title === updateEmpRoleRes.empUpdatedRole)].id;
    const params = [idRoleTit, idEmpName];

    query(sql, params)
        .then((res) => {
            console.log(`Updated ${updateEmpRoleRes.empName}'s role in the database.`)
            return whatToDo();
        })
        .catch((err) => {
            console.error(err);
        })

}

nextAction();