'use strict';

var app = require('../..');
import request from 'supertest';

var newServer;

describe('Server API:', function() {

  describe('GET /api/servers', function() {
    var servers;

    beforeEach(function(done) {
      request(app)
        .get('/api/servers')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          servers = res.body;
          done();
        });
    });

    it('should respond with JSON array', function() {
      servers.should.be.instanceOf(Array);
    });

  });

  describe('POST /api/servers', function() {
    beforeEach(function(done) {
      request(app)
        .post('/api/servers')
        .send({
          name: 'New Server',
          info: 'This is the brand new server!!!'
        })
        .expect(201)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          newServer = res.body;
          done();
        });
    });

    it('should respond with the newly created server', function() {
      newServer.name.should.equal('New Server');
      newServer.info.should.equal('This is the brand new server!!!');
    });

  });

  describe('GET /api/servers/:id', function() {
    var server;

    beforeEach(function(done) {
      request(app)
        .get('/api/servers/' + newServer._id)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          server = res.body;
          done();
        });
    });

    afterEach(function() {
      server = {};
    });

    it('should respond with the requested server', function() {
      server.name.should.equal('New Server');
      server.info.should.equal('This is the brand new server!!!');
    });

  });

  describe('PUT /api/servers/:id', function() {
    var updatedServer;

    beforeEach(function(done) {
      request(app)
        .put('/api/servers/' + newServer._id)
        .send({
          name: 'Updated Server',
          info: 'This is the updated server!!!'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if (err) {
            return done(err);
          }
          updatedServer = res.body;
          done();
        });
    });

    afterEach(function() {
      updatedServer = {};
    });

    it('should respond with the updated server', function() {
      updatedServer.name.should.equal('Updated Server');
      updatedServer.info.should.equal('This is the updated server!!!');
    });

  });

  describe('DELETE /api/servers/:id', function() {

    it('should respond with 204 on successful removal', function(done) {
      request(app)
        .delete('/api/servers/' + newServer._id)
        .expect(204)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          done();
        });
    });

    it('should respond with 404 when server does not exist', function(done) {
      request(app)
        .delete('/api/servers/' + newServer._id)
        .expect(404)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          done();
        });
    });

  });

});
