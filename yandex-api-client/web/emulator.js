const axios = require('axios')

function purchaseTicket(ticketInfo) {
    return axios.post('https://extrema4.herokuapp.com/api/ticket/buy', ticketInfo)
        .then((res) => {
            //TODO remove
            // console.log(res)

            return res.data;
        })
        .catch((error) => {
            console.error(error)
        })
}

//TODO remove
console.log(new Date());

let ticketInfo = {
    "currency": "RUB",
    "price":
        {
            "cents": 0,
            "whole": 4863
        },
    "name": "эконом",
    "user": 123,
    "place": 22
};

(async () => {
    await purchaseTicket(ticketInfo).then(res => {
        //TODO remove
        console.log(res);

        //TODO remove
        console.log(new Date());
    });
})()
