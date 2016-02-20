/**
 * Server model events
 */

'use strict';

import {EventEmitter} from 'events';
var Server = require('./server.model');
var ServerEvents = new EventEmitter();

// Set max event listeners (0 == unlimited)
ServerEvents.setMaxListeners(0);

// Model events
var events = {
  'save': 'save',
  'remove': 'remove'
};

// Register the event emitter to the model events
for (var e in events) {
  var event = events[e];
  Server.schema.post(e, emitEvent(event));
}

function emitEvent(event) {
  return function(doc) {
    ServerEvents.emit(event + ':' + doc._id, doc);
    ServerEvents.emit(event, doc);
  }
}

export default ServerEvents;
