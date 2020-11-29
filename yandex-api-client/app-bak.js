
const { LOG } = require('../../../../utils/util');
const { GetCodeStation } = require('../../../../rzhd/db/findstation');
const { runDialogflow } = require('./dialogflow');
const { getTrains } = require('./yandex');

const PredlogFrom = 1;
const PredlogTo = 2;

const ScenarioLookingForBuyTickets = 1;     //  покупка билета
const ScenarioLookingForHaveTickets = 2;    //  поиск билета (есть ли билеты)
const ScenarioLookingForPriceTickets = 3;   //  сколько стоит = поиск цены

let arrayTokens = [];
let arrayEntities = [];

let idScenario = 0;     //  текущий сценарий
let strStationFrom = '';
let strStationTo = '';
let age = GetJsonTomorrowDate();
let arrayTrains = [];



async function RunApp(req, res) {

    LOG("command="+req.body.request.command)
    //  Запуск диалога - начало. Запустить объяснение - что и для чего.
    if (req.body.request.command == "no text")
    {
      res.json({
        version: req.body.version,
        session: req.body.session,
        response: {
          text: "Сейчас объясню как всё работает",
          end_session: false,
        },
      });
    }
  
    //  
    else if (req.body.request.command == "no version")
    {
      res.json({
        session: req.body.session,
        response: {
          text: req.body.request.command || 'Нет версии!',
          end_session: false,
        },
      });
    }
  
    //
    else if (req.body.request.command == "no session")
    {
      res.json({
        version: req.body.version,
        response: {
          text: req.body.request.command || 'Нет сессии!',
          end_session: false,
        },
      });
    }
  
    //  Запрос на закрытие диалога
    else if (req.body.request.command == "end session")
    {
      res.json({
        version: req.body.version,
        session: req.body.session,
        response: {
          text: req.body.request.command || 'Конец сессии!',
          end_session: true,
        },
      });
    }
  
    //  Иначе - нужно обрабатывать очередную фразу...
    else 
    {
        let strCommand = req.body.request.command;
        let strOtvet = '';

        //  Достаём сохранённое состояние 
        if (req.body.state)
            if (req.body.state.session)
                ParseJsonFromSaveState(req.body.state.session)

        if (req.body.request.nlu) {
            GetTokens(req.body.request.nlu);
            GetEntities(req.body.request.nlu);
        }
        
        //  Звучит вопрос, начинающийся на как или почему
        if (arrayTokens.length)
            if ((arrayTokens[0].word === 'как') || (arrayTokens[0].word === 'почему')) {
                
                //  Ищем не спрашивают ли о помощи
                if (LookingForHelp(arrayTokens)) {
                    strOtvet = GetHelpMessage();
                }
                else {
                    //  Ничего не поняли и отправляем в Dialogflow
                    let otvetdialog = await GetDialogflow();
                    strOtvet = otvetdialog.fulfillmentText;
                }
            }


        if (strOtvet.length === 0) {
            
            
            if (idScenario === 0)
                idScenario = GetIdScenario(arrayTokens);
    

            //  Ищем не спрашивают ли о помощи
            if (LookingForHelp(arrayTokens)) {
                strOtvet = GetHelpMessage();
            }
    
            //  ищут билеты
            else if (idScenario) {
                
                LOG("By scenario")
                
                if (LookingForPayment(arrayTokens)) {
                    strOtvet = GetHowPaymentMessage();
                }
                else {
                    

                    if (LookingForReturn(arrayTokens)) {
                        let strTemp = strStationFrom;
                        strStationFrom = strStationTo;
                        strStationTo = strTemp;
                    }
        
                    LOG("strStationFrom="+strStationFrom+" strStationTo="+strStationTo)
                    if ((strStationFrom.length > 0) && (strStationTo.length > 0)) {

                        let arrayTrains = await GetVariants(strStationFrom, strStationTo);

                        strOtvet = 'По маршруту ' + strStationFrom + ' - ' + strStationTo;
                        
                        if (idScenario === ScenarioLookingForHaveTickets)
                            strOtvet = strOtvet + GetMessageTickets(arrayTrains);
                        else
                            strOtvet = strOtvet + GetMessageTrains(arrayTrains);
        
                        if (idScenario === ScenarioLookingForPriceTickets)
                            strOtvet = strOtvet + '. ' + GetNoPriceMessage();
                        
                    }
                    else if (strStationFrom.length === 0) {
                        strOtvet = GetFromMessage();
                    }
                    else if (strStationTo.length === 0) {
                        strOtvet = GetToMessage();
                    }
                    else if (age === 0) {
                        strOtvet = GetWhenMessage();
                    }
                }
            }
            
            else if (strCommand.length === 0) {
                strOtvet = GetHelpMessage();
            }
            
            else {
                //  Ничего не поняли и отправляем в Dialogflow
                let otvetdialog = await GetDialogflow();
                strOtvet = otvetdialog.fulfillmentText;
                
                //strOtvet = 'Мне жаль, но я вас пока не понимаю.';
                LOG(strOtvet);
            }
            
        }
        
        
      res.json({
        version: req.body.version,
        session: req.body.session,
        response: {
            text: strOtvet,
            
            end_session: false,
        },
        session_state: GetJsonForSaveState()
      })
    ;}
}
module.exports.RunApp = RunApp;

function DoTrains(arrayTrains) {
    if (arrayTrains)
        if (arrayTrains.length > 0) {
            let train = arrayTrains[0];
            
            LOG(train.arrival);
            LOG(train.from);
            LOG(train.to);
            
            let duration = train.duration / 60;
            LOG(duration);
            LOG(train.start_date);
        }
}

function GetMessageTrains(arrayTrains) {
    let str = ' не найдено поездов ';
    let count = 0;
    if (arrayTrains) {
        count = arrayTrains.length;
        if (count) {
            let strPoezd = 'поездов';
            if (count === 1)
                strPoezd = 'поезд';
            else if (count < 5)
                    strPoezd = 'поезда';
                    
            if (count === 1)
                str = ' найден ' + count + ' ' + strPoezd;
            else
                str = ' найдено ' + count + ' ' + strPoezd;
        }
    }
    return str;
}

function GetMessageTickets(arrayTrains) {
    let str = ' билетов не найдено ';
    let count = 0;
    if (arrayTrains) {
        count = arrayTrains.length;
        if (count) {
            let strPoezd = 'поездов';
            if (count === 1)
                strPoezd = 'поезд';
            else if (count < 5)
                    strPoezd = 'поезда';
            str = ' найдены билеты на ' + count + ' ' + strPoezd;
        }
    }
    return str;
}




async function GetVariants(strstrStationFrom, strstrStationTo) {
    
    let strCodeStartStantion = await GetCodeStation(strstrStationFrom);
    let strCodeEndStantion = await GetCodeStation(strstrStationTo);
    let arrayVarinats = await GetTrains(strCodeStartStantion, strCodeEndStantion);
    return arrayVarinats;
}
async function GetTrains(strCodeStartStantion, strCodeEndStantion) {
    LOG("strCodeStartStantion="+strCodeStartStantion+" strCodeEndStantion="+strCodeEndStantion)
    let arrayTickets = [];
    
    try {
        let json = await getTrains(strCodeStartStantion, strCodeEndStantion, GetDateFromAge(age));   //  new Date('2020-11-28')
        arrayTickets = json.segments;
        LOG("otvet poluchen")
        //LOG(arrayTickets)
    } catch(e) {
        
    }
    
    return arrayTickets;
}

function GetDateFromAge(age) {
    return new Date('' + age.year + '-' + age.month + '-' + age.day);
}

async function GetDialogflow() {
    try {
        let ret = await runDialogflow();
        return ret;
    } catch(e) {
        
    }
}


function GetTokens(jsonNLU) {
    arrayTokens = [];
    if (jsonNLU.tokens) {
        let arrayNluTokens = jsonNLU.tokens;
    
        for (let i = 0; i < arrayNluTokens.length; i++)
            arrayTokens.push({ word: arrayNluTokens[i], hash: CreateHashWord(arrayNluTokens[i]), index: i, isUse: false });
    }
}

function GetEntities(jsonNLU) {
    arrayEntities = [];
    if (jsonNLU.entities) {
        let arrayNluEntities = jsonNLU.entities;
        
        let iCountGeo = 0;
    
        for (let i = 0; i < arrayNluEntities.length; i++) {
            if (arrayNluEntities[i].type)
                if (arrayNluEntities[i].type === 'YANDEX.GEO') {
                    if (arrayNluEntities[i].value)
                        if (arrayNluEntities[i].value.city) {
                            
                            //  Если передано лишь одно слово - название станции
                            //  то засовываем его в пустой слот. Хотя это и не совсем корректно
                            if (arrayTokens.length === 1) {

                                if (strStationFrom.length === 0)
                                    strStationFrom = arrayNluEntities[i].value.city;
                                else if (strStationTo.length === 0)
                                        strStationTo = arrayNluEntities[i].value.city;
                                        
                                        LOG("strStationFrom="+strStationFrom)
                                        LOG("strStationTo="+strStationTo)
                            }
                            else {
                                let idTypePredlog = GetTypePredlog(arrayNluEntities[i]);
                                switch(idTypePredlog) {
                                    case PredlogFrom:
                                        strStationFrom = arrayNluEntities[i].value.city;
                                        LOG("strStationFrom="+strStationFrom)
                                        break;
                                    case PredlogTo:
                                        strStationTo = arrayNluEntities[i].value.city;
                                        LOG("strStationTo="+strStationTo)
                                        break;
                                    case 0:
                                        if ((iCountGeo === 0) && (strStationFrom.length === 0)) {
                                            iCountGeo++;
                                            strStationFrom = arrayNluEntities[i].value.city;
                                        }
                                        else if ((strStationTo.length === 0) || (iCountGeo === 1)) {
                                            iCountGeo++;
                                            strStationTo = arrayNluEntities[i].value.city;
                                        }
                                        break;
                                }
                            }
                        }
                }
                else if (arrayNluEntities[i].type === 'YANDEX.NUMBER') {
                    if (arrayNluEntities[i].value) {
                        
                        //  Проверяем, что после этого числа стоит слово 'число' - тогда считаем его днём месяца
                        let entity = arrayNluEntities[i];
                        let iEnd = -1;
                        if (entity.tokens)
                            if (entity.tokens.end !== undefined) {
                                iEnd = entity.tokens.end;
                                iEnd++;
                                if (arrayTokens.length > iEnd)
                                    if (arrayTokens[iEnd].word === 'число') {
                                        age = GetJsonCurrentDate();
                                        age.day = parseInt(arrayNluEntities[i].value);
                                    }
                                        
                            }
                    }
                }
                else if (arrayNluEntities[i].type === 'YANDEX.DATETIME') {
                    if (arrayNluEntities[i].value) {
                        
                        //  Сначала создаём новое текущее число, потому что в текущем текущем числе может быть не текущая дата -:)
                        let ageNew = GetJsonCurrentDate(); 
                        
                        if (arrayNluEntities[i].value.year) {
                            if (arrayNluEntities[i].value.year_is_relative)
                                ageNew.year = ageNew.year + arrayNluEntities[i].value.year;
                            else
                                ageNew.year = arrayNluEntities[i].value.year;
                        }
                        
                        if (arrayNluEntities[i].value.month) {
                            if (arrayNluEntities[i].value.month_is_relative)
                                ageNew.month = ageNew.month + arrayNluEntities[i].value.month;
                            else
                                ageNew.month = arrayNluEntities[i].value.month;
                        }
                        
                        if (arrayNluEntities[i].value.day) {
                            if (arrayNluEntities[i].value.day_is_relative)
                                ageNew.day = ageNew.day + arrayNluEntities[i].value.day;
                            else
                                ageNew.day = arrayNluEntities[i].value.day;
                        }
                        
                        if (arrayNluEntities[i].value.hour) {
                            if (arrayNluEntities[i].value.hour_is_relative)
                                ageNew.hour = ageNew.hour + arrayNluEntities[i].value.hour;
                            else
                                ageNew.hour = arrayNluEntities[i].value.hour;
                        }
                        
                        if (arrayNluEntities[i].value.minute) {
                            if (arrayNluEntities[i].value.minute_is_relative)
                                ageNew.minute = ageNew.minute + arrayNluEntities[i].value.minute;
                            else
                                ageNew.minute = arrayNluEntities[i].value.minute;
                        }
                        
                        age.year = ageNew.year;
                        age.month = ageNew.month;
                        age.day = ageNew.day;
                        age.hour = ageNew.hour;
                        age.minute = ageNew.minute;
                    }
                }
        }
    }
}


function IsFromPredlog(strPredlog) {
    if (["из","от","с"].includes(strPredlog))
        return true;
    return false;
}

function IsToPredlog(strPredlog) {
    if (["до","в","к"].includes(strPredlog))
        return true;
    return false;
}

function GetTypePredlog(entity) {
    let iStart = -1, iEnd = -1;
    if (entity.tokens) {
        if (entity.tokens.start !== undefined)
            iStart = entity.tokens.start;
        if (entity.tokens.end !== undefined)
            iEnd = entity.tokens.end;
    }

    if ((iStart > -1) && (iEnd > -1)) {
        for (let i = iStart; i <= iEnd; i++) {
            if (arrayTokens.length > i) {
                if (IsFromPredlog(arrayTokens[i].word))
                    return PredlogFrom;
                if (IsToPredlog(arrayTokens[i].word))
                    return PredlogTo;
            }
        }
    }
    return 0;
}


let arrayHelps = [
    ['что', 'умеешь'],
    ['как', 'пользоваться'],
    ['помощь'],
    ['объясни'],
    ['не', 'понимаю'],
    ['объяснение'],
];
let arraysHashHelps = CreateArraysHashWords(arrayHelps);

function LookingForHelp(arrayTokens) {
    let arrayNotUsedTokens = [];
    for (let i = 0; i < arrayTokens.length; i++)
        if (! arrayTokens[i].isUse)
            arrayNotUsedTokens.push(arrayTokens[i]);
        
    for (let i = 0; i < arrayHelps.length; i++)
        if (IsHaveEquals(arrayHelps[i], arraysHashHelps[i], arrayTokens))
            return true;
        
    return false;
}






function GetIdScenario(arrayTokens) {
    let id = 0;
    
    if (LookingForBuy(arrayTokens))
        id = ScenarioLookingForBuyTickets;
    
    if (id === 0)
        if (LookingForPrice(arrayTokens))
            id = ScenarioLookingForPriceTickets;
        
    if (id === 0)
        if (LookingForHave(arrayTokens))
            id = ScenarioLookingForHaveTickets;

    return id;
}


let arrayBuys = [
    ['купить'],
    ['заказать'],
    ['приобрести'],
    ['достать'],
    ['хочу', 'взять'],
    ['нужен', 'билет'],
    ['нужны', 'билеты']
];
let arraysHashBuys = CreateArraysHashWords(arrayBuys);

function LookingForBuy(arrayTokens) {
    let arrayNotUsedTokens = [];
    for (let i = 0; i < arrayTokens.length; i++)
        if (! arrayTokens[i].isUse)
            arrayNotUsedTokens.push(arrayTokens[i]);
        
    for (let i = 0; i < arrayBuys.length; i++)
        if (IsHaveEquals(arrayBuys[i], arraysHashBuys[i], arrayTokens))
            return true;
        
    return false;
}




let arrayPrices = [
    ['цена'],
    ['стоимость'],
    ['рублей'],
    ['по', 'чём'],
    ['по', 'чем'],
    ['за', 'сколько'],
    ['сколько','стоит'],
    ['продашь']
];
let arraysHashPrices = CreateArraysHashWords(arrayPrices);

function LookingForPrice(arrayTokens) {
    let arrayNotUsedTokens = [];
    for (let i = 0; i < arrayTokens.length; i++)
        if (! arrayTokens[i].isUse)
            arrayNotUsedTokens.push(arrayTokens[i]);
        
    for (let i = 0; i < arrayPrices.length; i++)
        if (IsHaveEquals(arrayPrices[i], arraysHashPrices[i], arrayTokens))
            return true;
        
    return false;
}




let arrayHaves = [
    ['расписание'],
    ['маршрут'],
    ['когда', 'отправляется'],
    ['сколько', 'поездов'],
    ['узнай', 'сколько', 'поездов'],
    ['сколько', 'билетов'],
    ['узнай', 'сколько', 'билетов'],
    ['есть', 'ли', 'поезда'],
    ['есть', 'ли', 'билеты'],
    ['есть', 'ли', 'билет'],
    ['мне', 'бы', 'билет'],
    ['мне', 'бы', 'билетик'],
    ['найди', 'билет'],
];
let arraysHashHaves = CreateArraysHashWords(arrayHaves);

function LookingForHave(arrayTokens) {
    let arrayNotUsedTokens = [];
    for (let i = 0; i < arrayTokens.length; i++)
        if (! arrayTokens[i].isUse)
            arrayNotUsedTokens.push(arrayTokens[i]);
        
    for (let i = 0; i < arrayHaves.length; i++)
        if (IsHaveEquals(arrayHaves[i], arraysHashHaves[i], arrayTokens))
            return true;
        
    return false;
}




let arrayReturns = [
    ['обратно'],
    ['обратный'],
    ['обратные'],
    ['назад'],
];
let arraysHashReturns = CreateArraysHashWords(arrayReturns);

function LookingForReturn(arrayTokens) {
    let arrayNotUsedTokens = [];
    for (let i = 0; i < arrayTokens.length; i++)
        if (! arrayTokens[i].isUse)
            arrayNotUsedTokens.push(arrayTokens[i]);
        
    for (let i = 0; i < arrayReturns.length; i++)
        if (IsHaveEquals(arrayReturns[i], arraysHashReturns[i], arrayTokens))
            return true;
        
    return false;
}


let arrayPayments = [
    ['ссылка', 'на', 'оплату'],
    ['ссылка', 'чтобы', 'оплатить'],
    ['оплатить'],
    ['оплата'],
    ['заплатить']
];
let arraysHashPayments = CreateArraysHashWords(arrayPayments);

function LookingForPayment(arrayTokens) {
    let arrayNotUsedTokens = [];
    for (let i = 0; i < arrayTokens.length; i++)
        if (! arrayTokens[i].isUse)
            arrayNotUsedTokens.push(arrayTokens[i]);
        
    for (let i = 0; i < arrayPayments.length; i++)
        if (IsHaveEquals(arrayPayments[i], arraysHashPayments[i], arrayTokens))
            return true;
        
    return false;
}









function IsHaveEquals(arrayWords, arrayHashs, arrayTokens) {
    
    let iCountEquals = 0;

    for (let i = 0; i < arrayTokens.length; i++)
        for (let j = 0; j < arrayWords.length; j++)
            if (arrayHashs[j] === arrayTokens[i].hash)
                if (arrayWords[j] === arrayTokens[i].word)
                    iCountEquals++;

    if (iCountEquals === arrayWords.length)
        return true;
        
    return false;
}


function CreateArraysHashWords(arrayWords) {
    let arrayHashWords = [];
    for (let i = 0; i < arrayWords.length; i++) {
        arrayHashWords.push([]);
        for (let j = 0; j < arrayWords[i].length; j++)
            arrayHashWords[i].push(CreateHashWord(arrayWords[i][j]));
    }
    return arrayHashWords;
}
function CreateArrayHashWords(arrayWords, odd=1) {
    let arrayHashWords = [];
    for (let i = 0; i < arrayWords.length; i += odd)
        arrayHashWords.push(CreateHashWord(arrayWords[i]));
    return arrayHashWords;
}
//module.exports.CreateArrayHashWords = CreateArrayHashWords;

function CreateHashWord(str) {
    let ret = 0;
    if (str)
        for (let i = 0; i < str.length; i++)
            ret = ret + (i + 1) * str.charCodeAt(i);
    return ret;
}
//module.exports.CreateHashWord = CreateHashWord;

function GetRandom(max) {
  return Math.floor(Math.random() * Math.floor(max));
}


function GetHowPaymentMessage() {
    let arrayUseHelps = [
        'Вот ссылка на оплату.',
        'Перейдите по ссылке, чтобы оплатить.',
        'Чтобы оформить билет, перейдите по ссылке.',
    ];
    let index = GetRandom(arrayUseHelps.length);
    return arrayUseHelps[index];
}

function GetNoPriceMessage() {
    let arrayUseHelps = [
        'Информации о стоимости не найдено.',
        'Простите, я не обнаружила информации о стоимости билетов.',
        'Данных о ценах нет',
    ];
    let index = GetRandom(arrayUseHelps.length);
    return arrayUseHelps[index];
}

function GetHelpMessage() {
    let arrayUseHelps = [
        'Я могу помочь с покупкой билета онлайн',
        'Просто задай вопрос о расписании и я отвечу',
        'Спроси меня о наличии билетов, указав куда и откуда нужно будет ехать.',
    ];
    let index = GetRandom(arrayUseHelps.length);
    return arrayUseHelps[index];
}

function GetFromMessage() {
    let arrayPhrases = [
        'Откуда поедете ?',
        'Назовите вокзал отправления',
        'Откуда планируете поездку ?',
        'Назовите станцию отправления ?',
    ];
    let index = GetRandom(arrayPhrases.length);
    return arrayPhrases[index];
}

function GetToMessage() {
    let arrayPhrases = [
        'Куда поедете ?',
        'Куда планируете поездку ?',
        'Назовите конечную станцию ?',
    ];
    let index = GetRandom(arrayPhrases.length);
    return arrayPhrases[index];
}

function GetWhenMessage() {
    let arrayPhrases = [
        'На какую дату ?',
        'Скажите, на какую дату нужен билет ?',
        'Когда планируете поезду ?',
        'Подскажите дату на которую поискать билеты ?',
    ];
    let index = GetRandom(arrayPhrases.length);
    return arrayPhrases[index];
}




function GetJsonForSaveState() {
    let jsonTrains = arrayTrains;
    let json = {
        scenario: idScenario,
        stations: {
            from: strStationFrom,
            to: strStationTo
        },
        age: age,
        trains: jsonTrains
    }
}

function ParseJsonFromSaveState(json) {
    if (json) {
        if (json.scenario)
            idScenario = json.scenario;
        if (json.age)
            age = json.age;
        if (json.stations) {
            if (json.stations.from)
                strStationFrom = json.json.stations.from;
            if (json.stations.to)
                strStationTo = json.json.stations.to;
        }
        if (json.trains)
            arrayTrains = json.trains;
    }
}


function GetJsonCurrentDate() {
    var date = new Date();
    //let date = new Date('December 25, 1995 23:15:30');
    return GetJsonFromDate(date);
}
function GetJsonTomorrowDate() {
    var tomorrow = new Date();
    tomorrow.setDate(new Date().getDate()+1);
    return GetJsonFromDate(tomorrow);
}
function GetJsonFromDate(date) {
    let json = {
        year: date.getFullYear(),
        month: (date.getMonth() + 1),
        day: date.getDate(),
    }
    return json;
}


