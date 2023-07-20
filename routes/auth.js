const express = require('express');

const db = require('../data/database');

const router = express.Router();

// router.get('/trigger-error', (req, res) => {
//     throw new Error('This is a demo error');
// });


router.get('/login', function (req, res) {
    //checking if we have signup data (here named inputData) in case of redirecting due to incorrect data
    let sessionInputData = req.session.inputData;
    if (!sessionInputData) { //if visiting first time i.e., not redirected
        sessionInputData = {
            hasError: false,
            id: '',
            password: '',
        };
    }

    req.session.inputData = null; //clearing inputData from session after storing it in another variable

    res.render('login', { inputData: sessionInputData });
});

router.post('/login', async function (req, res) { //login
    const userData = req.body;
    const enteredId = userData.id;
    const enteredPassword = userData.password;

    const query = `SELECT * FROM pnb.users WHERE id = ?`;
    const [existingUsers] = await db.query(query, enteredId);
    if (!existingUsers || existingUsers.length === 0) {
        req.session.inputData = {
            hasError: true,
            message: 'Could not log you in - please check your credentials!',
            id: enteredId,
            password: enteredPassword
        };
        req.session.save(function () {
            res.redirect('/login');
        });
        return;
    }

    if (enteredPassword !== existingUsers[0].password) {
        // console.log('Could not log in - Passwords are not equal!');
        req.session.inputData = {
            hasError: true,
            message: 'Could not log you in - please check your credentials!',
            id: enteredId,
            password: enteredPassword
        };
        req.session.save(function () {
            res.redirect('/login');
        });
        return;
    }

    req.session.user = {
        id: existingUsers[0].id,
    }; //storing user data in session to check for authenticated (logged-in) users 
    //and for getting user specific data in other routes
    req.session.isAdmin = existingUsers[0].isAdmin,
        req.session.isAuthenticated = true;
    //request coming in connected to this session with user data stored in it are authenticated requests

    req.session.save(function () { //forces session data to be saved in DB and function executes only after saving is finished
        console.log('User is authenticated!');
        res.redirect('/');
    });

});

router.post('/logout', function (req, res) {
    req.session.user = null;
    req.session.isAdmin = false;
    req.session.isAuthenticated = false;
    //setting isAdmin to false so that when admin logs out and then another user logs in then he/she is not admin by default
    res.redirect('/');
});

module.exports = router;