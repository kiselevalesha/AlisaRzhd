
const { Router } = require('express');
const { RunApp } = require('./app');
const { StrError404 } = require('../../../../languages/russian');

const router = Router();


// /api/yandex/alise/rzhd-bot/v1/
router.post('/', RunApp);


router.all('*', async (req, res, next) => {
    res.status(404).json({ message: StrError404 });
});


module.exports = router;
