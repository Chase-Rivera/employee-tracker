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