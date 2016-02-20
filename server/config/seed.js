/**
 * Populate DB with sample data on server start
 * to disable, edit config/environment/index.js, and set `seedDB: false`
 */

'use strict';
import Thing from '../api/thing/thing.model';
import User from '../api/user/user.model';
import Server from '../api/server/server.model';

Thing.find({}).removeAsync()
  .then(() => {
    Thing.create({
      name: 'Development Tools',
      info: 'Integration with popular tools such as Bower, Grunt, Babel, Karma, ' +
      'Mocha, JSHint, Node Inspector, Livereload, Protractor, Jade, ' +
      'Stylus, Sass, and Less.'
    }, {
      name: 'Server and Client integration',
      info: 'Built with a powerful and fun stack: MongoDB, Express, ' +
      'AngularJS, and Node.'
    }, {
      name: 'Smart Build System',
      info: 'Build system ignores `spec` files, allowing you to keep ' +
      'tests alongside code. Automatic injection of scripts and ' +
      'styles into your index.html'
    }, {
      name: 'Modular Structure',
      info: 'Best practice client and server structures allow for more ' +
      'code reusability and maximum scalability'
    }, {
      name: 'Optimized Build',
      info: 'Build process packs up your templates as a single JavaScript ' +
      'payload, minifies your scripts/css/images, and rewrites asset ' +
      'names for caching.'
    }, {
      name: 'Deployment Ready',
      info: 'Easily deploy your app to Heroku or Openshift with the heroku ' +
      'and openshift subgenerators'
    });
  });

User.find({}).removeAsync()
  .then(() => {
    User.createAsync({
        provider: 'local',
        name: 'Test User',
        email: 'test@example.com',
        password: 'test'
      }, {
        provider: 'local',
        role: 'admin',
        name: 'Admin',
        email: 'admin@example.com',
        password: 'admin'
      }, {
        provider: 'local',
        name: 'Isaiah',
        email: 'isaiah@example.com',
        password: '1qa!QA1qa'
      }, {
        provider: 'local',
        name: 'Isaac',
        email: 'isaac@example.com',
        password: '-pl,_PL<'
      })
      .then((users) => {
        console.log('finished populating users');
        Server.find({}).removeAsync();
        users.forEach((user) =>{
          if (user.name === "Isaiah") {
            Server.create({
              name: "Isaiah's Ogar Server",
              ownerId: user._id,
              serverPort: 4002,
              svrPath: "/var/www/isaiah4002"
            });
          } else if (user.name === "Isaac") {
            Server.create({
              name: "Isaac's Ogar Server",
              ownerId: user._id,
              serverPort: 4001,
              svrPath: "/var/www/isaac4001"
            });
          }
        })
      });
  });
