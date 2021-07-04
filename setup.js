#!/usr/bin/env node
const shell = require('shelljs');
let os = require('os');

let name=os.userInfo().username;

shell.exec(`chown -R "${name}":"${name}" ${__dirname}`,{silent:false});
