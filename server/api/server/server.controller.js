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
const User = require('../user/user.model');
const ogarModel = require('./ogar.model.js');
const http = require('http');
const fs = require('fs');
const exec = require('child_process').exec;
const async = require('async');
const rimraf = require('rimraf');

let adminId;

User.findOneAsync({role: 'admin'})
  .then((user)=>adminId = user._id)
  .catch((err)=> {
    console.error("FATAL ERROR: failed to find an adminId in server.controller.js Error: ", err);
  });

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
 * Get a list Server of Servers from the DB owned by the user or all if user has role admin
 * restriction: 'owner'
 */
export function index(req, res) {
  let query = (req.user.role == 'admin') ? {} : {ownerId: req.user._id};
  Server.findAsync(query)
    .then((servers)=>{
      console.log("servers: ", servers);
      return servers;
    })
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
  //console.log(req.body);
  req.body.ownerId = adminId;
  Server.createAsync(req.body)
    .then(createServer)
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
      let cwd = {cwd: "/var/www/" + server._id + "/Ogar/src"};
      _executeCmd("pm2 restart " + server._id, cwd, (err, result)=>{
        if (err) throw err;
        return server;
      })
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
  Server.findOneAsync(query)
    .then(handleEntityNotFound(res))
    .then((server)=> {
      if (!server) {
        handleEntityNotFound(res)();
        return;
      }
      let cwd = {cwd: "/var/www/" + server._id + "/Ogar/src"};
      _executeCmd("pm2 stop " + server._id, cwd, (err, result)=>{
        if (err) throw err;
        return server;
      })
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

  let dir = '/var/www/' + req.params.id;
  let pm2StopCmd = "pm2 delete " + dir + "/Ogar/src --name " + req.params.id;
  let pm2Cwd = {cwd: dir + "/Ogar/src"};

  async.series([
    (cb) => _executeCmd(pm2StopCmd, pm2Cwd, cb),
    (cb) =>  rimraf(dir, (err)=>{
      if (err) {
        console.error('failed to remove folder: ' + folder, " err: ", err);
        cb(err);
      } else cb(null);
    })
  ]);
}

function writeServerToFile(server, cb) {
  // we are accepting client input so check for empty or undefined
  let svrPath = "/var/www/" + server._id;
  cb = (cb) ? cb : ()=> undefined;
  let text = "";
  let keys = Object.keys(ogarModel);
  const newline = "\n";

  keys.forEach((key)=> {
    text += key + " = " + server[key] + newline;
  });
  fs.writeFile(svrPath + "/Ogar/src/gameserver.ini", text, (err)=> {
    if (err) {
      console.log("failed to write: ", svrPath + "/Ogar/src/gameserver.ini");
      cb(err);
    } else {
      cb(null);
      console.log("wrote: " + svrPath + "/Ogar/src/gameserver.ini")
    }
  })
}

let getStatusUpdate = () => {
  // todo this should not be hard coded
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

function createServer(server) {
  // create path on disk
  // todo this should not be hardcoded
  let dir = '/var/www/' + server._id;
  let gitCmd = "git clone https://github.com/OgarProject/Ogar.git";
  let gitCwd = {cwd: dir};
  let pm2StartCmd = "pm2 start " + dir + "/Ogar/src --name " + server._id;
  let pm2StopCmd = "pm2 stop " + dir + "/Ogar/src --name " + server._id;
  let pm2Cwd = {cwd: dir + "/Ogar/src"};
  let npmCmd = "npm install";
  let npmCwd = {cwd: dir + "/Ogar"};

  async.series([
    (cb) => ensureExists(dir, cb),
    (cb) => _executeCmd(gitCmd, gitCwd, cb),
    (cb) => writeServerToFile(server, cb),
    (cb) => _executeCmd(npmCmd, npmCwd, cb),
    // todo there should be a better way to do this
    // start then stop pm2 app so that it will exist
    (cb) => _executeCmd(pm2StartCmd, pm2Cwd, cb),
    (cb) => _executeCmd(pm2StopCmd, pm2Cwd, cb)
  ]);
  return server;
}

// Based on http://stackoverflow.com/questions/21194934/node-how-to-create-a-directory-if-doesnt-exist
function ensureExists(path, mask, cb) {
  if (typeof mask == 'function') { // allow the `mask` parameter to be optional
    cb = mask;
    mask = 0o777;
  }
  console.log("ensureExists  path: ", path, " mask: ", mask);
  fs.mkdir(path, mask, function (err) {
    if (err) {
      if (err.code == 'EEXIST') {
        cb(null);
        console.log("created folder already exists");
      } // ignore the error if the folder already exists
      else {
        cb(err);
        console.log("created folder failed");
      } // something else went wrong
    } else {
      console.log("created folder");
      cb(null);
    } // successfully created folder
  });
}

function _executeCmd(cmd, options, cb) {
  console.log("exec cmd: ", cmd, " options:", options);
  exec(cmd, options, function (err, stdout, stderr) {
    if (err) {
      console.error("_executeCmd err: ", err, " stderr: ", stderr);
      cb({error: err, msg: stderr});
    } else {
      console.log("_executeCmd stdout: ", stdout);
      cb(null, stdout);
    }
  })
}
