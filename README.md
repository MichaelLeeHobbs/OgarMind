# Ogar Mind

This project was generated with the [Angular Full-Stack Generator](https://github.com/DaftMonk/generator-angular-fullstack) version 3.1.1.

## Getting Started

### Prerequisites

- [Git](https://git-scm.com/)
- [Node.js and npm](nodejs.org) Node ^4.2.3, npm ^2.14.7
- [Bower](bower.io) (`npm install --global bower`)
- [Ruby](https://www.ruby-lang.org) and then `gem install sass`
- [Grunt](http://gruntjs.com/) (`npm install --global grunt-cli`)
- [MongoDB](https://www.mongodb.org/) - Keep a running daemon with `mongod`
- [PM2](http://pm2.keymetrics.io/) (`npm install pm2 -g`)

### Deploying
1. Run `git clone https://github.com/MichaelLeeHobbs/OgarMind.git` where you want to install the server. Typically this might be /var/www or ~/www.

2. Run `npm install` to install server dependencies.

3. Run `bower install` to install front-end dependencies.

4. Run `mongod` in a separate shell to keep an instance of the MongoDB Daemon running.

5. Run `pm2 web` this will start a pm2 daemon to report status of running processes.

6. Configure you firewall to open ports for Ogar Mind; port 3000, Ogar servers; ports: recommend > 1024, and pm2; port 9615. example on RedHat/Centos 7.0 or higher: 
  1 `sudo firewall-cmd --permanent --add-port=3000/tcp`
  2 `sudo firewall-cmd --permanent --add-port=9615/tcp`
  3 `sudo firewall-cmd --permanent --add-port=3001/tcp`
  4 `sudo firewall-cmd --reload`

7. Run `grunt build` to build the web server.

8. Run `pm2 start dist/server/ --name OgarMind` from this root folder of the project, i.e. `/var/www/ogarmind` or `~/www/ogarmind`.

### Todo's
1. Install script

2. Start script

3. Improve setting owner(s) of a server / support more than one owner.

4. Implement more user levels to enable delegation of server management.
  
5. Refactor pm2 interaction to use api and not child-process.

6. Add a configuration api to refactor all hardcoded config values.

7. Provide instructions on how to setup G+ login.

8. Possibly add built in support for dynamic dns.

### Contributing
Just submit a pull request but please keep your code clean.
Formatting: use .editorconfig and max line length about 120

