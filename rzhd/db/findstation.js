
const { SelectRowsBySql } = require('./sqlselect');
const { LOG } = require('../../utils/util');


async function GetCodeStation(strName) {

    let sql = "SELECT strName, strCode, idHash FROM stations WHERE strName LIKE '" + strName + "%'";

    let ret = null;
    let rows = await SelectRowsBySql(sql);
    console.log(rows);

    if (rows.length > 0)
        ret = rows[0].strCode;

    return ret;
}
module.exports.GetCodeStation = GetCodeStation;


//GetCodeStation('москва');
