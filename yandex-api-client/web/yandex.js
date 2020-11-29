const https = require('https');
const url = require('url')

function getTrains(from, to, date) {
    const requestUrl = url.parse(url.format({
        protocol: 'https',
        hostname: 'api.rasp.yandex.net',
        pathname: '/v3.0/search/',
        query: {
            apikey: 'c3d615b6-f346-42e8-a571-b01889420d87',
            format: 'json',
            from: from,
            to: to,
            lang: 'ru_RU',
            transport_types: 'train',
            page: 1,
            date: date.toISOString()
        }
    }));

    let options = {
        hostname: requestUrl.hostname,
        path: requestUrl.path,
        port: 443,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    };

    return new Promise((resolve, reject) => {
        https.get(options, (res) => {
            let {statusCode} = res;
            let contentType = res.headers['content-type'];

            let error;

            if (statusCode !== 200) {
                error = new Error('Request Failed.\n' +
                    `Status Code: ${statusCode}`);
            } else if (!/^application\/json/.test(contentType)) {
                error = new Error('Invalid content-type.\n' +
                    `Expected application/json but received ${contentType}`);
            }

            if (error) {
                console.error(error.message);
                // consume response data to free up memory
                res.resume();
            }

            res.setEncoding('utf8');
            let rawData = '';

            res.on('data', (chunk) => {
                rawData += chunk;
            });

            res.on('end', () => {
                try {
                    const parsedData = JSON.parse(rawData);
                    resolve(parsedData);
                } catch (e) {
                    reject(e.message);
                }
            });
        }).on('error', (e) => {
            reject(`Got error: ${e.message}`);
        });

    });
}

//TODO remove
// console.log(new Date());
// getTrains('c51', 'c213', new Date('2020-11-28')).then(response => {
//     console.log(response);
// }).catch(error => {
//     console.log(error);
// });
// console.log(new Date());

async function getTrainsRange(from, to, startDate, endDate) {
    if (+startDate > +endDate) {
        return;
    }
    let segments = [];
    let currentDate = startDate;
    let tasks = [];
    while (+currentDate <= +endDate) {
        tasks.push(new Promise((resolve, reject) => {
            getTrains(from, to, currentDate).then(response => {
                segments = segments.concat(response.segments);
                resolve();
            }).catch(error => {
                console.log(error);
                reject();
            });
            currentDate = currentDate.addDays(1);
        }))
    }
    await Promise.all(tasks);
    return segments;
}

Date.prototype.addDays = function (days) {
    let date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
}

//TODO remove
console.log(new Date());
(async () => {
    await getTrainsRange('c51', 'c213', new Date('2020-11-28'), new Date('2020-12-12')).then(res => {
        //TODO remove
        console.log(res);
        //TODO remove
        console.log(new Date());
    });
})()

