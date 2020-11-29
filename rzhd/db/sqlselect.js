const sqlite3 = require('sqlite3');
const { open } = require('sqlite');


async function SelectRowsBySql(sql) {
    try {

        sqlite3.verbose();
        const db = await createDbConnection('./chinook.db');

        let rows = await ExecuteSelectRows(db, sql);
        return rows;

    } catch (error) {
        console.error(error);
    }
}
module.exports.SelectRowsBySql = SelectRowsBySql;


async function ExecuteSelectRows(ordersDb, sql) {
    try {

        let rows = await ordersDb.all(sql, []);
        return rows;

    } catch (error) {
        console.error(error);
        throw error;
    }
}

function createDbConnection(filename) {
    return open({
        filename,
        driver: sqlite3.Database
    });
}


/*
async function main() {
    let strCode = 'москва';
    let sql = "SELECT strName, strCode, idHash FROM stations WHERE strName LIKE '" + strCode + "%'";

    let rows = await SelectRowsBySql(sql);
    console.log(rows);
}

main();
*/