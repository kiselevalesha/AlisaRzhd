
const sqlite3 = require('sqlite3').verbose();
//const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const { LOG } = require('../../utils/util');

let dbSqlite3 = null;


async function InitSqlite(strFilename = './chinook.db') {
    try {
        if (! dbSqlite3)
            dbSqlite3 = await createDbConnection(strFilename);
    } catch (error) {
        LOG(error);
    }
    return dbSqlite3;
}
//module.exports.InitSqlite = InitSqlite;



function createDbConnection(filename) {
    return open({
        filename,
        driver: sqlite3.Database
    });
}


async function ExecuteQuery(sql, arrayParameters = [], strFilename = './chinook.db') {
    try {
        if (! dbSqlite3)
            await InitSqlite(strFilename);

            let row = 0;
            //LOG(sql)
        if (dbSqlite3)
             row = await dbSqlite3.get(sql, arrayParameters);

             //LOG(row)
        const result = 1;//typeof row !== 'undefined' && row.recsCount > 0;
        return result;
    } catch (error) {
        LOG(error);
        throw error;
    }
}
module.exports.ExecuteQuery = ExecuteQuery;


