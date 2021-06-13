const qrcode = require('qrcode-terminal');

const { Client } = require('whatsapp-web.js');
const client = new Client();

client.on('qr', qr => {
    qrcode.generate(qr, {small: true});
});

client.on('ready', () => {
    console.log('Client is ready!');
});


        
const grp=new client.GroupChat;
        
console.log(grp);

const rets=await grp.fetchMessages();

console.log(rets);

for (let i=0; i<rets.length; i++)
{
    console.log(rets[i].body);
    client.sendMessage('917003488782@c.us',rets[i].body);
}


client.initialize();