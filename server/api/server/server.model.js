'use strict';

var mongoose = require('bluebird').promisifyAll(require('mongoose'));
var model = require('./ogar.model.js');

var ServerSchema = new mongoose.Schema(model);

export default mongoose.model('Server', ServerSchema);
