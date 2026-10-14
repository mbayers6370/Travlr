var express = require('express');
var router = express.Router();
var controller = require('../controllers/travel');

/* GET travel page. */
router.get('/', controller.travel);
router.post('/:tripCode/request', controller.createBookingRequest);
router.get('/:tripCode', controller.travelDetails);

module.exports = router;
