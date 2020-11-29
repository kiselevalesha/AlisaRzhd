
"use strict";

const { ExecuteQuery } = require('./dbsqlite');
const { LOG } = require('../../utils/util');

var jsonStations = require('./stations.json');


async function LoadStations() {

    let result = await ExecuteQuery('DELETE FROM stations');

    for (let i = 0; i < jsonStations.countries.length; i++) {
        //LOG(jsonStations.countries[i].regions);
        if (jsonStations.countries[i].title)
            if (jsonStations.countries[i].title === 'Россия') {
                LOG(jsonStations.countries[i].title);

                if (jsonStations.countries[i].regions)
                    for (let j = 0; j < jsonStations.countries[i].regions.length; j++) {
                        //LOG(jsonStations.countries[i].regions[j].title);


                        //if (j === 0)
                        for (let z = 0; z < jsonStations.countries[i].regions[j].settlements.length; z++) {
                            //LOG(jsonStations.countries[i].regions[j].settlements[z].title);

                            if (jsonStations.countries[i].regions[j].settlements[z].title)
                                if (jsonStations.countries[i].regions[j].settlements[z].codes)
                                    if (jsonStations.countries[i].regions[j].settlements[z].codes.yandex_code) {
                                        LOG('\n' + jsonStations.countries[i].regions[j].settlements[z].title)
                                        let code = jsonStations.countries[i].regions[j].settlements[z].codes.yandex_code;
                                        let title = jsonStations.countries[i].regions[j].settlements[z].title.toLowerCase();
                                        await SaveNameCode(title, code);
                                    }


                                    //if (z === 0)
                                    for (let u = 0; u < jsonStations.countries[i].regions[j].settlements[z].stations.length; u++) {
                                        let code = jsonStations.countries[i].regions[j].settlements[z].stations[u].codes.yandex_code;
                                        let title = jsonStations.countries[i].regions[j].settlements[z].stations[u].title.toLowerCase();
                                        let station_type = jsonStations.countries[i].regions[j].settlements[z].stations[u].station_type;
                                        //LOG("code=" + code + " title=" + title)
                                        if (station_type === 'train_station') {

                                            await SaveNameCode(title, code);
                                        }

                                    }
                            
                        }
                    }
            }
    }
}


async function SaveNameCode(title, code) {
    let strTile = title.replace(/"/g, '').replace(/'/g, '');
    let sql = 'INSERT INTO stations (strName,strCode,idHash)' +
            ' VALUES("'+ strTile +'","' + code +'",' +	CreateHashWord(strTile) +');'
    //LOG(sql);
    await CreateRow(sql);
}

function CreateHashWord(str) {
    let ret = 0;
    if (str)
        for (let i = 0; i < str.length; i++)
            ret = ret + (i + 1) * str.charCodeAt(i);
    return ret;
}


async function CreateRow(sql, flagIsFinish=false) {
    try {
        //LOG(sql);
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

LoadStations();
