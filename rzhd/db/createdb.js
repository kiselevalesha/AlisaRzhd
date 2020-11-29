
"use strict";

const { ExecuteQuery } = require('./dbsqlite');
const { LOG } = require('../../utils/util');

const sqlCreateTable = "CREATE TABLE IF NOT EXISTS ";
const sqlDropTable = "DROP TABLE IF EXISTS ";
const sqlCreateIndex = "CREATE INDEX IF NOT EXISTS ";
const sqlDropIndex = "DROP INDEX IF EXISTS ";

let arraySQLs = [];
let sqlTable, sqlIndex;
let strTableName, strIndexName;



//  Таблица поездов
strTableName = 'trains';
strIndexName = 'trainsIndex';

sqlTable = ` (
    id INTEGER PRIMARY KEY,
    idType INTEGER DEFAULT 0,
    strNomer TEXT DEFAULT ""
);`;
sqlIndex = '(strNomer)';
AddSql(strTableName, sqlTable, strIndexName, sqlIndex);



//  Таблица маршрутов
strTableName = 'routers';
strIndexName = 'routersIndex';

sqlTable = ` (
    id INTEGER PRIMARY KEY,
    idTrain INTEGER DEFAULT 0,
    idStation INTEGER DEFAULT 0,
    ageStart INTEGER DEFAULT 0,
    ageEnd INTEGER DEFAULT 0
);`;
sqlIndex = '(idTrain, idStation)';
AddSql(strTableName, sqlTable, strIndexName, sqlIndex);



//  Таблица вагонов
strTableName = 'vags';
strIndexName = 'vagsIndex';

sqlTable = ` (
    id INTEGER PRIMARY KEY,
    idType INTEGER DEFAULT 0,
    countTotalTickets INTEGER DEFAULT 0,
    countSoldTickets INTEGER DEFAULT 0
);`;
sqlIndex = '(strNomer)';
AddSql(strTableName, sqlTable, strIndexName, sqlIndex);



//  Таблица станций
strTableName = 'stations';
strIndexName = 'stationsIndex';

sqlTable = ` (
    id INTEGER PRIMARY KEY,
    idType INTEGER DEFAULT 0,
    idHash INTEGER DEFAULT 0,
    strCode TEXT DEFAULT "",
    strName TEXT DEFAULT ""
);`;
sqlIndex = '(strName)';
AddSql(strTableName, sqlTable, strIndexName, sqlIndex);



//  Таблица мест
strTableName = 'places';
strIndexName = 'placesIndex';

sqlTable = ` (
    id INTEGER PRIMARY KEY,
    idType INTEGER DEFAULT 0,
    idVag INTEGER DEFAULT 0,
    idTrain INTEGER DEFAULT 0
);`;
sqlIndex = '(idVag, idTrain)';
AddSql(strTableName, sqlTable, strIndexName, sqlIndex);



//  Таблица билетов
strTableName = 'tickets';
strIndexName = 'ticketsIndex';

sqlTable = ` (
    id INTEGER PRIMARY KEY,
    idType INTEGER DEFAULT 0,
    idPlace INTEGER DEFAULT 0,
    idVag INTEGER DEFAULT 0,
    idTrain INTEGER DEFAULT 0,
    idNomer INTEGER DEFAULT 0
);`;
sqlIndex = '(idPlace, idVag, idTrain)';
AddSql(strTableName, sqlTable, strIndexName, sqlIndex);



//  Таблица продаж - оплатно-возвратных операций
strTableName = 'sales';
strIndexName = 'salesIndex';

sqlTable = ` (
    id INTEGER PRIMARY KEY,
    idUser INTEGER DEFAULT 0,
    ageCreated INTEGER DEFAULT 0,
    ageSold INTEGER DEFAULT 0,
    summa INTEGER DEFAULT 0,
    idTypePayment INTEGER DEFAULT 0,
    isDeleted INTEGER DEFAULT 0,
    strComment TEXT DEFAULT ""
);`;
sqlIndex = '(idUser)';
AddSql(strTableName, sqlTable, strIndexName, sqlIndex);



//  Таблица покупателей
strTableName = 'clients';
strIndexName = 'clientsIndex';

sqlTable = ` (
    id INTEGER PRIMARY KEY,
    idUser INTEGER DEFAULT 0,
    strName TEXT DEFAULT "",
    strPatronymic TEXT DEFAULT "",
    strSurname TEXT DEFAULT "",
    strPhone TEXT DEFAULT ""
);`;
sqlIndex = '(strNomer)';
AddSql(strTableName, sqlTable, strIndexName, sqlIndex);



//  Таблица пользователей
strTableName = 'users';
strIndexName = 'usersIndex';

sqlTable = ` (
    id INTEGER PRIMARY KEY,
    idYandexUser INTEGER DEFAULT 0,
    strLogin TEXT DEFAULT "",
    strPassword TEXT DEFAULT ""
);`;
sqlIndex = '(strLogin)';
AddSql(strTableName, sqlTable, strIndexName, sqlIndex);






function AddSql(strTableName, sqlTable, strIndexName, sqlIndex) {

    let sql = sqlDropTable + strTableName + ';';
    arraySQLs.push(sql);
    
    sql = sqlDropIndex + strIndexName + ';';
    arraySQLs.push(sql);
    
    
    sql = sqlCreateTable + strTableName + sqlTable;
    arraySQLs.push(sql);
    
    
    sql = sqlCreateIndex + strIndexName + ' ON ' + strTableName + sqlIndex + ';';
    arraySQLs.push(sql);
    
}

async function CreateDBTables() {
    arraySQLs.forEach(async function(item, index) {
        await CreateDBTable(item, (index +1 == arraySQLs.length));        
    });
}

async function CreateDBTable(sql, flagIsFinish) {
    try {
        LOG(sql);
        let result = await ExecuteQuery(sql);
        LOG(result);

    } catch (err) {
        //LOG(err);
        throw err;
    } finally {

        if (flagIsFinish) {
            LOG("End");
            process.exit(0);            
        }

    }
}

CreateDBTables();
