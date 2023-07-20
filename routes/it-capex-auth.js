    const express = require('express');

    const db = require('../data/database');

    const router = express.Router();

    const uuid = require('uuid').v4;

    const notifier = require('node-notifier');

    router.get('/itcapexproject', async function (req, res) {
        if (!res.locals.user || !res.locals.isAdmin) {
            res.status(401).render('401');
            return;
        }
        const query1 = `SELECT * FROM pnb.it_capex_projects ORDER BY no DESC LIMIT 1`;
        var [item] = await db.query(query1);

        if (!item || item.length === 0) {
            item = [{
                no: 0,
                cp_no: '',
                description: '',
                category: '',
                planned: '',
                fy: '',
                created_by: '',
                created_date: '',
            }];
        }

        res.render('it-capex-project-master', { item: item[0] });
    });

    router.post('/itcapexproject', async function (req, res) {
        if (!res.locals.user || !res.locals.isAdmin) {
            res.status(401).render('401');
            return;
        }
        const data = [
            req.body.cpno,
            req.body.description,
            req.body.category,
            req.body.planned,
            req.body.fy,
            res.locals.user.id,
            req.body.createddate,
        ];

        const query2 = `SELECT * FROM pnb.it_capex_projects WHERE cp_no = ?`;
        const [items] = await db.query(query2, [req.body.cpno]);

        if (items && items.length > 0) {
            notifier.notify({
                title: 'CP No. already exists!',
                message: 'CP No. already exists! Select different CP No.',
                sound: true,
                wait: true
            });
            return;
        }

        const query = `INSERT INTO pnb.it_capex_projects (cp_no, description, category, planned, fy, created_by, created_date) VALUES (?, ?, ?, ?, ?, ?, ?)`;
        try {
            await db.query(query, data);
            res.redirect('/itcapexproject');
        } catch (err) {
            console.log(err);
            notifier.notify({
                title: 'Error',
                message: 'IT Capex Project Master could not be updated',
                sound: true,
                wait: true,
            });
            res.redirect('/itcapexproject');
        }
    });


    router.get('/itcapexprojectedit', async function (req, res) {
        if (!res.locals.user || !res.locals.isAdmin) {
            res.status(401).render('401');
            return;
        }

        const query1 = `SELECT * FROM pnb.it_capex_projects ORDER BY cp_no LIMIT 1`;
        const [item] = await db.query(query1);

        if (!item || item.length === 0) {
            res.status(404).render('404');
            return;
        }

        const uri = `${item[0].cp_no}`;
        const encodedUri = encodeURIComponent(uri);
        res.redirect(`/itcapexprojectedit/${encodedUri}`);
    });


    router.get('/itcapexprojectedit/:cpno', async function (req, res) {
        if (!res.locals.user || !res.locals.isAdmin) {
            res.status(401).render('401');
            return;
        }
        const cpNo = decodeURIComponent(req.params.cpno);
        const query1 = `SELECT * FROM pnb.it_capex_projects ORDER BY cp_no`;
        const [all_cpnos] = await db.query(query1);

        const query2 = `SELECT * FROM pnb.it_capex_projects where cp_no = ?`;
        const [items] = await db.query(query2, [cpNo]);


        if (!items || items.length === 0 || !all_cpnos || all_cpnos.length === 0) { //if the user manually enters some non existing item no. in the URL
            res.status(404).render('404');
            return;
        }
        res.render('it-capex-project-edit', { item: items[0], items: all_cpnos });
    });

    router.post('/itcapexprojectedit', async function (req, res) {
        if (!res.locals.user || !res.locals.isAdmin) {
            res.status(401).render('401');
            return;
        }

        if (!req.body.cpno || !req.body.description || !req.body.category || !req.body.planned || !req.body.fy || !req.body.createddate) {
            notifier.notify({
                title: 'Error',
                message: 'All fields are mandatory',
                sound: true,
                wait: true,
            });
            res.redirect('/itcapexprojectedit');
            return;
        }

        const query = `UPDATE pnb.it_capex_projects SET fy = ?, description = ? WHERE cp_no = ?`;
        try {
            await db.query(query, [req.body.fy, req.body.description, req.body.cpno]);
            res.redirect('/itcapexprojectedit');
        } catch (err) {
            console.log(err);
            notifier.notify({
                title: 'Error',
                message: 'IT Capex Project Master could not be updated',
                sound: true,
                wait: true,
            });
            res.redirect('/itcapexprojectedit');
        }
    });

    router.get('/itcapexissue', async function (req, res) {
        if (!res.locals.user || !res.locals.isAdmin) {
            res.status(401).render('401');
            return;
        }

        const query1 = `SELECT * FROM pnb.capex_inventory_master ORDER BY item_code LIMIT 1`;
        const [item] = await db.query(query1);

        if (!item || item.length === 0) {
            res.status(404).render('404');
            return;
        }

        res.redirect(`/itcapexissue/${item[0].item_code}`);
    });


    router.get('/itcapexissue/:itemcode', async function (req, res) {
        if (!res.locals.user || !res.locals.isAdmin) {
            res.status(401).render('401');
            return;
        }
        const query1 = `SELECT item_code FROM pnb.capex_inventory_master ORDER BY item_code`;
        const [all_item_codes] = await db.query(query1);

        const query2 = `SELECT * FROM pnb.capex_inventory_master WHERE item_code = ?`;
        const [items] = await db.query(query2, [req.params.itemcode]);

        const query3 = `SELECT * FROM pnb.it_capex_projects ORDER BY cp_no`;
        const [projects] = await db.query(query3);

        if (!items || items.length === 0 || !all_item_codes || all_item_codes.length === 0 || !projects || projects.length === 0) { //if the user manually enters some non existing item no. in the URL
            res.status(404).render('404');
            return;
        }
        res.render('it-capex-issue', { item: items[0], items: all_item_codes, projects: projects });
    });

    router.post('/itcapexissue/:itemcode', async function (req, res) {
        const type = 'issue';

        if (!res.locals.user || !res.locals.isAdmin) {
            res.status(401).render('401');
            return;
        }


        const query3 = `SELECT * FROM pnb.it_capex_transaction WHERE item_code = ? AND cp_no = ? ORDER BY transaction_no DESC LIMIT 1`;
        const [quant] = await db.query(query3, [req.params.itemcode, req.body.cpno]);
        var balance = +0;


        if (!quant || quant.length === 0) {
            notifier.notify({
                title: 'Error',
                message: 'Receive the item before issuing it',
                sound: true,
                wait: true,
            });
            res.redirect(`/itcapexreceive/${req.params.itemcode}`);
            return;
        }
        else {
            balance = +(quant[0].balance);
        }


        const updated_quantity = +((+balance) - (+req.body.quantity));
        if (updated_quantity < 0) {
            notifier.notify({
                title: 'Error',
                message: 'Receive the item before issuing it',
                sound: true,
                wait: true,
            });
            res.redirect(`/itcapexreceive/${req.params.itemcode}`);
            return;
        }

        const data = [
            req.body.itemno,
            req.params.itemcode,
            req.body.name,
            req.body.model,
            +req.body.quantity,
            req.body.um,
            req.body.cpno,
            req.body.issuedto,
            req.body.issuedby,
            req.body.issueddate,
            req.body.make,
            req.body.remarks,
            uuid(),
            type,
            updated_quantity,
        ];

        await db.query(`INSERT INTO pnb.it_capex_transaction 
                (item_no, item_code, item_name, model, 
                quantity, unit_of_measurement, cp_no, transactioned_with, transactioned_by,
                transactioned_date, make, remarks, transaction_id, transaction_type, balance) 
                VALUES (?)`, [data]);

        res.redirect(`/itcapexissue/${req.params.itemcode}`);
    });

    router.get('/itcapexreceive', async function (req, res) {
        if (!res.locals.user || !res.locals.isAdmin) {
            res.status(401).render('401');
            return;
        }

        const query1 = `SELECT * FROM pnb.capex_inventory_master ORDER BY item_code LIMIT 1`;
        const [item] = await db.query(query1);

        if (!item || item.length === 0) {
            res.status(404).render('404');
            return;
        }

        res.redirect(`/itcapexreceive/${item[0].item_code}`);
    });


    router.get('/itcapexreceive/:itemcode', async function (req, res) {
        if (!res.locals.user || !res.locals.isAdmin) {
            res.status(401).render('401');
            return;
        }
        const query1 = `SELECT item_code FROM pnb.capex_inventory_master ORDER BY item_code`;
        const [all_item_codes] = await db.query(query1);

        const query2 = `SELECT * FROM pnb.capex_inventory_master WHERE item_code = ?`;
        const [items] = await db.query(query2, [req.params.itemcode]);

        const query3 = `SELECT * FROM pnb.it_capex_projects ORDER BY cp_no`;
        const [projects] = await db.query(query3);

        if (!items || items.length === 0 || !all_item_codes || all_item_codes.length === 0 || !projects || projects.length === 0) { //if the user manually enters some non existing item no. in the URL
            res.status(404).render('404');
            return;
        }
        res.render('it-capex-receive', { item: items[0], items: all_item_codes, projects: projects });
    });

    router.post('/itcapexreceive/:itemcode', async function (req, res) {
        const type = 'receive';

        if (!res.locals.user || !res.locals.isAdmin) {
            res.status(401).render('401');
            return;
        }

        const query3 = `SELECT * FROM pnb.it_capex_transaction WHERE item_code = ? AND cp_no = ? ORDER BY transaction_no DESC LIMIT 1`;
        const [quant] = await db.query(query3, [req.params.itemcode, req.body.cpno]);
        var balance = +0;


        if (!quant || quant.length === 0) {
            balance = +0;
        }
        else {
            balance = +(quant[0].balance);
        }


        const updated_quantity = +((+balance) + (+req.body.quantity));
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
            req.body.cpno,
            req.body.receivedfrom,
            req.body.receivedby,
            req.body.receiveddate,
            req.body.make,
            req.body.remarks,
            uuid(),
            type,
            updated_quantity,
        ];

        await db.query(`INSERT INTO pnb.it_capex_transaction 
                (item_no, item_code, item_name, model, 
                quantity, unit_of_measurement, cp_no, transactioned_with, transactioned_by,
                transactioned_date, make, remarks, transaction_id, transaction_type, balance) 
                VALUES (?)`, [data]);

        res.redirect(`/itcapexreceive/${req.params.itemcode}`);
    });


    router.get('/viewitcapexproject', async function (req, res) {
        if (!res.locals.user) {
            res.status(401).render('401');
            return;
        }

        const query1 = `SELECT * FROM pnb.it_capex_projects ORDER BY no`;
        const [projects] = await db.query(query1);

        if (!projects || projects.length === 0) {
            res.status(404).render('404');
            return;
        }

        res.render('view-it-projects', { projects: projects });
    });

    router.get('/viewitcapexproject/:no', async function (req, res) {
        if (!res.locals.user) {
            res.status(401).render('401');
            return;
        }

        const query1 = `SELECT * FROM pnb.it_capex_projects WHERE no = ?`;
        const [projects] = await db.query(query1, [req.params.no]);

        if (!projects || projects.length === 0) {
            res.status(404).render('404');
            return;
        }

        const query2 = `SELECT * FROM pnb.it_capex_transaction WHERE cp_no = ? order by item_no`;
        const [transactions] = await db.query(query2, [projects[0].cp_no]);

        res.render('view-it-project', { project: projects[0], transactions: transactions });
    });











    module.exports = router;