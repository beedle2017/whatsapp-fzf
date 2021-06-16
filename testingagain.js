const qrcode = require('qrcode-terminal');

const { Client } = require('whatsapp-web.js');
const {Chat} = require('whatsapp-web.js');

const client = new Client();

client.on('qr', qr => {
    qrcode.generate(qr, {small: true});
});

client.on('ready', () => {
        console.log('Client is ready!');
        })

message = 'I have successfully read your previous messages. This message is being sent from our Whatsapp projects. The last 2 messages were: ';

async function body()
{   
    await client.initialize();   
    let arr = await client.getChats();
    let person = arr[1];
    console.log(person);
    let numberofperson = person.id._serialized;

    const rets=await person.fetchMessages({limit: 2});

    client.sendMessage(numberofperson,message);

    rets.forEach(text =>
        {
            console.log(text.body);
            client.sendMessage(numberofperson,text.body);
        });
 
};

body();



