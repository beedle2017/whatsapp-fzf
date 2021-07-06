#!/usr/bin/env node
const shell = require('shelljs');
let os = require('os');

let name=os.userInfo().username;

shell.exec(`sudo chown -R "${name}":"${name}" ${__dirname}`,{silent:false});
