'use strict';

var express = require('express');
var controller = require('./server.controller');
import * as auth from '../../auth/auth.service';

var router = express.Router();

router.get('/', auth.isAuthenticated(), controller.index);
router.get('/listall', auth.hasRole('admin'), controller.indexAll);
router.get('/model', auth.isAuthenticated(), controller.model);
router.get('/status', controller.status);
router.get('/status/:id', controller.status);
router.put('/start/:id', auth.isAuthenticated(), controller.start);
router.put('/stop/:id', auth.isAuthenticated(), controller.stop);
router.get('/:id', auth.isAuthenticated(), controller.show);
router.post('/', auth.hasRole('admin'), controller.create);
router.put('/:id', auth.isAuthenticated(), controller.update);
router.patch('/:id', auth.isAuthenticated(), controller.update);
router.delete('/:id', auth.hasRole('admin'), controller.destroy);

module.exports = router;
