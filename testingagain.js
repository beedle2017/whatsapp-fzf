const qrcode = require('qrcode-terminal');

const { Client } = require('whatsapp-web.js');
const {GroupChat} = require('whatsapp-web.js');

const client = new Client();

client.on('qr', qr => {
    qrcode.generate(qr, {small: true});
});

client.on('ready', () => {
    console.log('Client is ready!');
});

let a= new GroupChat(client);
console.log(a.id);

client.initialize();