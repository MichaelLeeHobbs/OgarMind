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
const Server = require('./server.model');
const ogarModel = require('./ogar.model.js');
const http = require('http');
const fs = require('fs');
const exec = require('child_process').exec;

function handleError(res, statusCode) {
  statusCode = statusCode || 500;

  return function (err) {
    console.log('handleError: ', err, ' status code: ', statusCode);
    res.status(statusCode).send(err);
  };
}

function responseWithResult(res, statusCode) {
  statusCode = statusCode || 200;
  return function (entity) {
    if (entity) {
      res.status(statusCode).json(entity);
    }
  };
}

function handleEntityNotFound(res) {
  return function (entity) {
    if (!entity) {
      res.status(404).end();
      return null;
    }
    return entity;
  };
}

function saveUpdates(updates) {
  return function (entity) {
    var updated = _.merge(entity, updates);
    writeServerToFile(updated);
    return updated.saveAsync()
      .spread(updated => {
        return updated;
      });
  };
}

function removeEntity(res) {
  return function (entity) {
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
 * Get a status of one or all Server from pm2 web
 */
export function status(req, res) {
  let id = req.id;
  let fields = 'name status uri serverPort';
  let query = (id) ? Server.findByIdAsync(id, fields) : Server.findAsync(undefined, fields);

  query.then(handleEntityNotFound(res))
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
  Server.findOneAsync(query)
    //.then(handleEntityNotFound(res))
    .then((server)=> {
      if (!server) {
        return handleEntityNotFound(res)();
      }
      let cwd = {cwd: server.svrPath + "/Ogar/src"};
      return _executePm2cmd("restart " + server.svrPath + "/Ogar/src --name " + server._id, cwd)
        //.then((result)=>result);
      // todo if we let this error bubble up it crashes the server :(
        .catch((err)=>console.error(err));
    })
    .then(responseWithResult(res))
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
    .then((servers)=> {
      if (servers === []) {
        handleEntityNotFound(res)();
        return;
      }
      let server = servers[0];
      let cwd = {cwd: server.svrPath + "/Ogar/src"};
      _executePm2cmd("stop " + server.svrPath + "/Ogar/src --name " + server._id, cwd)
        // todo if we let this error bubble up it crashes the server :(
        .catch((error)=>console.error(error));
    })
    .then(responseWithResult(res))
    .catch(handleError(res));
}

// Updates an existing Server in the DB
export function update(req, res) {
  if (req.body._id) {
    delete req.body._id;
  }
  if (req.user.role !== 'admin') {
    delete req.body.active;
    delete req.body.ownerId;
    delete req.body.svrPath;
    delete req.body.serverMaxConnections;
    delete req.body.serverPort;
    delete req.body.serverStatsPort;
    delete req.body.status;
  }

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

var _executePm2cmd = function (cmd, cwd) {
  cmd = "pm2 " + clean(cmd);
  return new Promise(
    function (resolve, reject) {
      console.log("exec: " + cmd);
      exec(cmd, cwd, function (err, stdout, stderr) {
        if (err) {
          reject({error: err, msg: stderr});
        }
        resolve(stdout);
      })
    }
  );
};

let writeServerToFile = function (server) {
  let text = "";
  let keys = Object.keys(ogarModel);
  const newline = "\n";

  keys.forEach((key)=> {
    text += key + " = " + server[key] + newline;
  });
  fs.writeFile(server['svrPath'] + "/Ogar/src/gameserver.ini", text, (err)=> {
    if (err) {
      console.log(err);
    }
    console.log("wrote " + server['svrPath'] + "/Ogar/src/gameserver.ini")
  })
};

let getStatusUpdate = function status() {
  //let url = 'http://localhost:9615';
  let url = 'http://192.168.1.50:9615';

  http.get(url, function (httpRes) {
    let body = '';

    httpRes
      .on('data', (chunk)=>body += chunk)
      .on('end', ()=> {
        let response = JSON.parse(body);
        response["processes"].forEach((process)=> {
          Server.findByIdAndUpdateAsync(process.name, {status: process["pm2_env"]["status"]})
            .catch((err)=> {
              if (err.name !== "CastError") {
                throw err;
              }
            });
        });
      });
  }).on('error', (err)=>console.error(err));
};
let peroidicStatusUpdate = setInterval(getStatusUpdate.bind(this), 5000);
