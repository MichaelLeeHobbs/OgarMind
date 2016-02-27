/**
 * Populate DB with sample data on server start
 * to disable, edit config/environment/index.js, and set `seedDB: false`
 */

'use strict';
import User from '../api/user/user.model';
import Server from '../api/server/server.model';
import * as seeds from './seedUserAndServers'

seeds.users.forEach((user)=>{
  User.findOne({name: user.name})
  .then((aUser)=>{
    if (!aUser) {
      User.createAsync({
        provider: user.provider,
        name: user.name,
        email: user.example,
        password: user.test
      })
      .then((newUser)=>{
        Server.create({
          name: seeds.servers[newUser.name].name,
          ownerId: newUser._id,
          serverPort: seeds.servers[newUser.name].port,
          svrPath: seeds.servers[newUser.name].svrPath
        });
      })
    }
  })
});
