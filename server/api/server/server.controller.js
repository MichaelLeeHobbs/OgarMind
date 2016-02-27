/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/servers              ->  index
 * GET     /api/servers/model        ->  model
 * POST    /api/servers              ->  create
 * GET     /api/servers/:id          ->  show
 * PUT     /api/servers/:id          ->  update
 * DELETE  /api/servers/:id          ->  destroy
 */

'use strict';

import _ from 'lodash';
var Server = require('./server.model');
var ogarModel = require('./ogar.model.js');

function handleError(res, statusCode) {
  statusCode = statusCode || 500;

  return function(err) {
    console.log('error: ', err, ' status code: ', statusCode);
    res.status(statusCode).send(err);
  };
}

function responseWithResult(res, statusCode) {
  statusCode = statusCode || 200;
  return function(entity) {
    if (entity) {
      res.status(statusCode).json(entity);
    }
  };
}

function handleEntityNotFound(res) {
  return function(entity) {
    if (!entity) {
      res.status(404).end();
      return null;
    }
    return entity;
  };
}

function saveUpdates(updates) {
  return function(entity) {
    var updated = _.merge(entity, updates);
    writeServerToFile(updated);
    return updated.saveAsync()
      .spread(updated => {
        return updated;
      });
  };
}

function removeEntity(res) {
  return function(entity) {
    if (entity) {
      return entity.removeAsync()
        .then(() => {
          res.status(204).end();
        });
    }
  };
}

/**
 * Get a list of all Servers
 * restriction: 'admin'
 */
export function indexAll(req, res) {
  Server.findAsync()
    .then(responseWithResult(res))
    .catch(handleError(res));
}

/**
 * Get a list Server of Servers from the DB owned by the user
 * restriction: 'owner'
 */
export function index(req, res) {
  var userId = req.user._id;
  Server.findAsync({ownerId: userId})
    .then(responseWithResult(res))
    .catch(handleError(res));
}

/**
 * Gets the Server model
 * @param req
 * @param res
 */
export function model(req, res) {
  responseWithResult(res)(ogarModel);
}

/**
 * Get a single Server from the DB
 * restriction: 'owner'
 */
export function show(req, res) {
  var userId = req.user._id;

  Server.findAsync({_id: req.params.id, ownerId: userId})
    .then(handleEntityNotFound(res))
    .then(responseWithResult(res))
    .catch(handleError(res));
}

/**
 * Create a Server
 * restriction: 'admin'
 */
export function create(req, res) {
  Server.createAsync(req.body)
    .then(responseWithResult(res, 201))
    .catch(handleError(res));
}

/**
 * Start a Server
 * restriction: 'owner'
 */
export function start(req, res) {
  let query = {_id: req.params.id};
  if (req.user.role !== 'admin') {
    query.ownerId = req.user._id;
  }
  Server.findAsync(query)
    .then(handleEntityNotFound(res))
    .then((servers)=>{
      if (servers === []) {
        handleEntityNotFound(res)();
        return;
      }
      let server = servers[0];
      let cwd = {cwd: server.svrPath + "/Ogar/src"};
      _executePm2cmd("start -f" + server.svrPath + "/Ogar/src", cwd)
        .then(responseWithResult(res))
        .catch(handleError(res));
    })
    .catch(handleError(res));
}
/**
 * Stop a Server
 * restriction: 'owner'
 */
export function stop(req, res) {
  let query = {_id: req.params.id};
  if (req.user.role !== 'admin') {
    query.ownerId = req.user._id;
  }
  Server.findAsync(query)
    .then(handleEntityNotFound(res))
    .then((servers)=>{
      if (servers === []) {
        handleEntityNotFound(res)();
        return;
      }
      let server = servers[0];
      let cwd = {cwd: server.svrPath + "/Ogar/src"};
      _executePm2cmd("stop " + server.svrPath + "/Ogar/src", cwd)
        .then(responseWithResult(res))
        .catch(handleError(res));
    })
    .catch(handleError(res));
}

// Updates an existing Server in the DB
export function update(req, res) {
  var userId = req.params.id;

  if (req.body._id) {
    delete req.body._id;
  }
  delete req.body.active;
  delete req.body.ownerId;
  delete req.body.svrPath;
  delete req.body.serverMaxConnections;
  delete req.body.serverPort;
  delete req.body.serverStatsPort;

  Server.findByIdAsync(req.params.id)
    .then(handleEntityNotFound(res))
    .then(saveUpdates(req.body))
    .then(responseWithResult(res))
    .catch(handleError(res));
}

/**
 * Deletes a Server
 * restriction: 'admin'
 */
export function destroy(req, res) {
  Server.findByIdAsync(req.params.id)
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));
}

var clean = function (message) {
  var rtn = message.slice(0);
  rtn = rtn.replace(';', '\\;');
  return rtn;
};

const exec = require('child_process').exec;
var _executePm2cmd = function (cmd, cwd) {
  cmd = "pm2 " + clean(cmd);
  return new Promise(
    function (resolve, reject) {
      console.log("exec: " + cmd);
      exec(cmd, cwd, function (err, stdout, stderr) {
        if (err) {
          console.log('pm2 error: ', err, ' msg: ', stderr);
          reject({error: err, msg: stderr});
        }
        resolve(stdout);
      })
    }
  );
};

const fs = require('fs');
var writeServerToFile = function(server) {
  let text = "";
  let keys = Object.keys(ogarModel);
  const newline = "\n";

  delete keys.name;
  delete keys.info;
  delete keys.active;
  delete keys.ownerId;
  delete keys.svrPath;

  keys.forEach((key)=>{
    text += key + " = " + server[key] + newline;
  });
  fs.writeFile(server['svrPath'] + "Ogar/src/gameserver.ini", text, (err)=>{
    if (err){
      return console.log(err);
    }
    console.log("wrote " + server['svrPath'] + "Ogar/src/gameserver.ini")
  })
};

