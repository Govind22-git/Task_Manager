const express = require('express');
const router = express.Router();
const user = require('../model/user');
const { getUser, createUser, updateUser, login, UpdatePassword, emailverification ,WelcomeMsg } = require('../controller/user_controller');


router.post('/signup/create', createUser);
router.get('/user/get', getUser);
router.patch('/user/update', updateUser);
router.post('/user/login', login);
router.post('/user/UpdatePassword', UpdatePassword);
router.post('/user/emailverification', emailverification);
router.post('/user/WelcomeMsg', WelcomeMsg);


module.exports = router;
