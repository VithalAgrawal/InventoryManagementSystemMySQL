const express = require('express');

const db = require('../data/database');

const router = express.Router();

const notifier = require('node-notifier');

router.get('/capexmaster', async function (req, res) {
    if (!res.locals.user || !res.locals.isAdmin) {
        res.status(401).render('401');
        return;
    }
    const query1 = `SELECT * FROM pnb.capex_inventory_master ORDER BY item_no DESC LIMIT 1`;
    var [item] = await db.query(query1);

    if(!item || item.length===0){
        item = [{
            item_no: 0,
            item_code: '',
            item_name: '',
            model: '',
            description: '',
            unit_of_measurement: '',
            created_by: '',
            created_date: '',
            make: '',
        }];
    }

    res.render('capex-master', { item: item[0] });
});

router.post('/capexmaster', async function (req, res) {
    if (!res.locals.user || !res.locals.isAdmin) {
        res.status(401).render('401');
        return;
    }
    const data = [
        req.body.code,
        req.body.name,
        req.body.model,
        req.body.description,
        req.body.um,
        res.locals.user.id,
        req.body.createddate,
        req.body.make,
    ];


    const query2 = `SELECT * FROM pnb.capex_inventory_master WHERE item_code = ?`;
    const [items] = await db.query(query2, [req.body.code]);

    if (items && items.length > 0) {
        notifier.notify({
            title: 'Item code already exists!',
            message: 'Item code already exists! Select different item code.',
            sound: true,
            wait: true
        });
        return;
    }

    await db.query(`INSERT INTO pnb.capex_inventory_master 
        (item_code, item_name, model, description, 
        unit_of_measurement, created_by, 
        created_date, make)
        VALUES (?)`, [data]);


    const query1 = `SELECT * FROM pnb.capex_inventory_master ORDER BY item_no DESC LIMIT 1`;
    const [item] = await db.query(query1);

    res.render('capex-master', { item: item[0] });
});


router.get('/capexinventory', async function (req, res) {
    if (!res.locals.user) {
        res.status(401).render('401');
        return;
    }
    const query1 = `SELECT * FROM pnb.capex_inventory_master ORDER BY item_no`;
    const [items] = await db.query(query1);

    res.render('capex-inventory', { items: items });
});







module.exports = router;