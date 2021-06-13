const prompt = require('prompt-sync')();
  
numbers=[]

const phone1=prompt("Enter number 1: ");
numbers.push('91'+phone1+'@c.us');

const phone2=prompt("Enter number 2: ");
numbers.push('91'+phone2+'@c.us');

const qrcode = require('qrcode-terminal');

const { Client } = require('whatsapp-web.js');
const client = new Client();



client.on('qr', qr => {
    qrcode.generate(qr, {small: true});
});

client.on('ready', () => {
    console.log('Client is ready!');
});

client.on('message', async(msg) => {
    console.log(msg)
    if (msg.body) {
        
        const grp=await msg.getChat();
        
        console.log(grp);

        const rets=await grp.fetchMessages({limit: 1});

        console.log(rets);

        rets.forEach(message =>
        {
            console.log(message.body);
            client.sendMessage(numbers[0],message.body);
            client.sendMessage(numbers[1],message.body);
        });
    }
});


client.initialize();