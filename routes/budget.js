const express = require('express');

const router = express.Router();


router.get('/', function (req, res) {
    res.render('landing-page');
});

router.get('/capex', function (req, res) {
    res.render('capex');
});

router.get('/smallcapex', function (req, res) {
    res.render('smallcapex');
});

router.get('/itcapex', function (req, res) {
    res.render('itcapex');
});

router.get('/pandb', function (req, res) {
    res.render('pandb'); //revenue
});

module.exports = router;