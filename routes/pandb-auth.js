const express = require('express');

const db = require('../data/database');

const router = express.Router();

const uuid = require('uuid').v4;

const notifier = require('node-notifier');

router.get('/master', async function (req, res) {
    if (!res.locals.user || !res.locals.isAdmin) {
        res.status(401).render('401');
        return;
    }

    const query1 = `SELECT * FROM pnb.inventory_master ORDER BY item_no DESC LIMIT 1`;
    var [item] = await db.query(query1);

    if (!item || item.length === 0) {
        item = [{
            item_no: 0,
            item_code: '',
            item_name: '',
            model: '',
            description: '',
            quantity_on_hand: 0,
            unit_of_measurement: '',
            created_by: '',
            created_date: '',
            last_updated_by: '',
            last_updated_date: '',
            make: '',
            quantity: 0,
        }];
    }

    res.render('master', { item: item[0] });
});

router.post('/master', async function (req, res) {
    if (!res.locals.user || !res.locals.isAdmin) {
        res.status(401).render('401');
        return;
    }
    const data = [
        req.body.code,
        req.body.name,
        req.body.model,
        req.body.description,
        +req.body.quantity,
        req.body.um,
        res.locals.user.id,
        req.body.createddate,
        req.body.make,
        +req.body.quantity,
    ];


    const query2 = `SELECT * FROM pnb.inventory_master WHERE item_code = ?`;
    const [items] = await db.query(query2, [req.body.code]);

    if (items && items.length > 0) {
        notifier.notify({
            title: 'Item code already exists!',
            message: 'Item code already exists! Receive the item instead.',
            sound: true,
            wait: true
        });
        res.redirect('/receive');
        return;
    }

    await db.query(`INSERT INTO pnb.inventory_master 
        (item_code, item_name, model, description, 
        quantity_on_hand, unit_of_measurement, created_by, 
        created_date, make, quantity)
        VALUES (?)`, [data]);


    const query1 = `SELECT * FROM pnb.inventory_master ORDER BY item_no DESC LIMIT 1`;
    const [item] = await db.query(query1);

    res.render('master', { item: item[0] });
});

router.get('/issue', async function (req, res) {
    if (!res.locals.user || !res.locals.isAdmin) {
        res.status(401).render('401');
        return;
    }

    const query1 = `SELECT * FROM pnb.inventory_master ORDER BY item_code LIMIT 1`;
    const [item] = await db.query(query1);

    if (!item || item.length === 0) {
        res.status(404).render('404');
        return;
    }


    res.redirect(`/issue/${item[0].item_code}`);
});

router.get('/issue/:itemcode', async function (req, res) {
    if (!res.locals.user || !res.locals.isAdmin) {
        res.status(401).render('401');
        return;
    }
    const query1 = `SELECT item_code FROM pnb.inventory_master ORDER BY item_code`;
    const [all_item_codes] = await db.query(query1);

    const query2 = `SELECT * FROM pnb.inventory_master WHERE item_code = ?`;
    const [items] = await db.query(query2, [req.params.itemcode]);


    if (!items || items.length === 0 || !all_item_codes || all_item_codes.length === 0) { //if the user manually enters some non existing item no. in the URL
        res.status(404).render('404');
        return;
    }
    res.render('issue', { item: items[0], items: all_item_codes });
});

router.post('/issue/:itemcode', async function (req, res) {
    const type = 'issue';

    if (!res.locals.user || !res.locals.isAdmin) {
        res.status(401).render('401');
        return;
    }

    const query3 = `SELECT quantity_on_hand FROM pnb.inventory_master WHERE item_code = ?`;
    const [quant] = await db.query(query3, [req.params.itemcode]);

    const updated_quantity = +(quant[0].quantity_on_hand) - (+req.body.quantity);
    if (updated_quantity < 0) {
        res.status(404).render('404');
        return;
    }

    const data = [
        req.body.itemno,
        req.params.itemcode,
        req.body.name,
        req.body.model,
        +req.body.quantity,
        req.body.um,
        req.body.issuedto,
        req.body.issuedby,
        req.body.issueddate,
        req.body.make,
        req.body.remarks,
        uuid(),
        type,
        updated_quantity,
    ];

    await db.query(`INSERT INTO pnb.pnb_transaction 
        (item_no, item_code, item_name, model, 
        quantity, unit_of_measurement, transactioned_with, transactioned_by,
        transactioned_date, make, remarks, transaction_id, transaction_type, balance) 
        VALUES (?)`, [data]);

    const query2 = `UPDATE pnb.inventory_master 
    SET quantity_on_hand = ?, last_updated_by = ?, last_updated_date = ?
    WHERE item_code = ?`;
    await db.query(query2, [updated_quantity, res.locals.user.id, req.body.issueddate, req.params.itemcode]);

    res.redirect(`/issue/${req.params.itemcode}`);
});


router.get('/receive', async function (req, res) {
    if (!res.locals.user || !res.locals.isAdmin) {
        res.status(401).render('401');
        return;
    }

    const query1 = `SELECT * FROM pnb.inventory_master ORDER BY item_code LIMIT 1`;
    const [item] = await db.query(query1);

    if (!item || item.length === 0) {
        res.status(404).render('404');
        return;
    }

    res.redirect(`/receive/${item[0].item_code}`);
});

router.get('/receive/:itemcode', async function (req, res) {
    if (!res.locals.user || !res.locals.isAdmin) {
        res.status(401).render('401');
        return;
    }
    const query1 = `SELECT item_code FROM pnb.inventory_master ORDER BY item_code`;
    const [all_item_codes] = await db.query(query1);

    const query2 = `SELECT * FROM pnb.inventory_master WHERE item_code = ?`;
    const [items] = await db.query(query2, [req.params.itemcode]);


    if (!items || items.length === 0 || !all_item_codes || all_item_codes.length === 0) { //if the user manually enters some non existing item no. in the URL
        res.status(404).render('404');
        return;
    }
    res.render('receive', { item: items[0], items: all_item_codes });
});


router.post('/receive/:itemcode', async function (req, res) {
    const type = 'receive';

    if (!res.locals.user || !res.locals.isAdmin) {
        res.status(401).render('401');
        return;
    }

    const query3 = `SELECT quantity_on_hand FROM pnb.inventory_master WHERE item_code = ?`;
    const [quant] = await db.query(query3, [req.params.itemcode]);

    const updated_quantity = +(quant[0].quantity_on_hand) + (+req.body.quantity);
    if (updated_quantity < 0) {
        res.status(404).render('404');
        return;
    }

    const data = [
        req.body.itemno,
        req.params.itemcode,
        req.body.name,
        req.body.model,
        +req.body.quantity,
        req.body.um,
        req.body.receivedfrom,
        req.body.receivedby,
        req.body.receiveddate,
        req.body.make,
        req.body.remarks,
        uuid(),
        type,
        updated_quantity,
    ];

    await db.query(`INSERT INTO pnb.pnb_transaction 
        (item_no, item_code, item_name, model, 
        quantity, unit_of_measurement, transactioned_with, transactioned_by,
        transactioned_date, make, remarks, transaction_id, transaction_type, balance) 
        VALUES (?)`, [data]);

    const query2 = `UPDATE pnb.inventory_master 
    SET quantity_on_hand = ?, last_updated_by = ?, last_updated_date = ?
    WHERE item_code = ?`;
    await db.query(query2, [updated_quantity, res.locals.user.id, req.body.receiveddate, req.params.itemcode]);

    res.redirect(`/receive/${req.params.itemcode}`);
});

router.get('/report', async function (req, res) {
    if (!res.locals.user) {
        res.status(401).render('401');
        return;
    }

    const query1 = `SELECT * FROM pnb.inventory_master ORDER BY item_no`;
    var [items] = await db.query(query1);
    var criticals = [];

    if (!items || items.length === 0) {
        items = [{
            item_no: 0,
            item_code: '',
            item_name: '',
            model: '',
            description: '',
            quantity_on_hand: 0,
            unit_of_measurement: '',
            created_by: '',
            created_date: '',
            last_updated_by: '',
            last_updated_date: '',
            make: '',
            quantity: 0,
        }];
        criticals = [0];
    }

    var todaysdate = new Date();
    var startdate = new Date(todaysdate.getFullYear() - 5, todaysdate.getMonth(), todaysdate.getDate());
    var startDate = startdate.toISOString().substring(0, 10);
    startDate = startDate.split('T')[0];

    var nextstartdate = new Date(startdate.getFullYear(), startdate.getMonth(), startdate.getDate() + 1);
    var nextStartDate = nextstartdate.toISOString().substring(0, 10);
    nextStartDate = nextStartDate.split('T')[0];

    var todaysDate = todaysdate.toISOString().substring(0, 10);
    todaysDate = todaysDate.split('T')[0];

    for (var i = 0; i < items.length; i++) {
        const query = `SELECT quantity FROM pnb.inventory_master where item_code = ? AND created_date<=?`;
        var [inventoryBalance] = await db.query(query, [items[i].item_code, startDate]);
        const query1 = `SELECT SUM(quantity) FROM pnb.pnb_transaction where item_code = ? AND transaction_type="issue" and transactioned_date BETWEEN ? AND ?`;
        var issues = await db.query(query1, [items[i].item_code, nextStartDate, todaysDate]);
        const query3 = `SELECT balance FROM pnb.pnb_transaction where item_code = ? AND transactioned_date<=? ORDER BY transactioned_date DESC LIMIT 1`;
        var [five_yo_balance] = await db.query(query3, [items[i].item_code, startDate]);
        var critical = 0;
        if (!inventoryBalance || inventoryBalance.length === 0) {
            inventoryBalance[0] = 0;
        } else {
            inventoryBalance[0] = inventoryBalance[0].quantity;
        }
        if (!issues || issues.length === 0) {
            issues = [[{ 'SUM(quantity)': 0 }]];
        }
        if (!five_yo_balance || five_yo_balance.length === 0) {
            five_yo_balance[0] = inventoryBalance[0];
        } else {
            five_yo_balance[0] = five_yo_balance[0].balance;
        }
        if (issues[0][0]['SUM(quantity)'] < five_yo_balance[0]) {
            critical = five_yo_balance[0] - issues[0][0]['SUM(quantity)'];
        }

        criticals.push(critical);
    }
    res.render('view-report', { items: items, criticals: criticals });
});


router.get('/log/:itemcode', async function (req, res) {
    if (!res.locals.user) {
        res.status(401).render('401');
        return;
    }

    const query2 = `SELECT * FROM pnb.inventory_master WHERE item_code = ?`;
    const [items] = await db.query(query2, [req.params.itemcode]);

    if (!items || items.length === 0) { //if the user manually enters some non existing item no. in the URL
        res.status(404).render('404');
        return;
    }
    res.redirect(`/datereport/${req.params.itemcode}`);
});

router.get('/datereport/:itemcode', async function (req, res) {
    if (!res.locals.user) {
        res.status(401).render('401');
        return;
    }
    res.render('date-report', { itemcode: req.params.itemcode });
});

router.get('/transaction/:itemCode/:startDate/:endDate', async function (req, res) {
    if (!res.locals.user) {
        res.status(401).render('401');
        return;
    }
    const startDate = req.params.startDate;
    const endDate = req.params.endDate;
    const itemCode = req.params.itemCode;
    // perform further actions based on the selected date range
    const query1 = `SELECT * FROM pnb.pnb_transaction where item_code = ? AND transaction_type="issue" and transactioned_date BETWEEN ? AND ? ORDER BY transactioned_date`;
    var [issues] = await db.query(query1, [itemCode, startDate, endDate]);
    const query2 = `SELECT * FROM pnb.pnb_transaction where item_code = ? AND transaction_type="receive" and transactioned_date BETWEEN ? AND ? ORDER BY transactioned_date`;
    var [receives] = await db.query(query2, [itemCode, startDate, endDate]);
    const query3 = `SELECT * FROM pnb.inventory_master WHERE item_code = ?`;
    const [items] = await db.query(query3, [itemCode]);

    if(!items || items.length === 0) { //if the user manually enters some non existing item no. in the URL
        res.status(404).render('404');
        return;
    }

    res.render(`transaction-item`, { items: items, startDate: startDate, endDate: endDate, issues: issues, receives: receives });
});

module.exports = router;