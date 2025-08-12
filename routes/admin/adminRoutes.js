const express = require('express');
const router = express.Router();
const {adminRegister}= require('../../controller/admin/adminController');

router.post('/adminregister', adminRegister);

module.exports = router;
