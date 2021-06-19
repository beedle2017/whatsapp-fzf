const { JSON } = require('./cycle');

const qrcode = require('qrcode-terminal');

const { Client } = require('whatsapp-web.js');
const {Chat} = require('whatsapp-web.js');

const fs = require('fs')

// const { exec, spawnSync } = require("child_process");

const spawn = require('await-spawn');

const shell = require('shelljs');

const client = new Client();

client.on('qr', qr => {
    qrcode.generate(qr, {small: true});
});

client.on('ready', () => {
        console.log('Client is ready!');
        })

async function middle(person)
{
    person=person.substring(0,person.length-1);

    const messages=chatmessages[person];

    const setupFile = fs.writeFileSync(`curr.txt`, person+'\n\n');

    for (message of messages)
    {
        let addition = message+'\n\n';
        const data = fs.writeFileSync(`curr.txt`, addition, { flag: 'a+' });
    }

    const interaction = shell.exec(`bash exec.sh`, {silent:false}).stdout;
        
    if(interaction.localeCompare('<--Back\n')==0)
    {
        start();
    }
    else if(interaction.localeCompare(`Past Messages\n`)==0)
    {
        middle(person+'\n');
    }
    else if(interaction.localeCompare(`Send Message\n`)==0)
    {
        const make_message = await spawn('vim',['message.txt'],{stdio:'inherit'});
        let new_message = fs.readFileSync('./message.txt', {encoding:'utf8'});

        let numberofperson = chats[person].id._serialized;

        const throwaway = chatmessages[person].shift();

        chatmessages[person].push(new_message);

        const msg= await client.sendMessage(numberofperson,new_message);

        console.log(chatmessages[person],person,numberofperson,new_message);

        middle(person+'\n');
    }
    else
    {
        process.exit(0);
    }
}

async function start()
{
    const event = shell.exec(`echo "${fzfstring}" | fzf`, {silent:false}).stdout;

    if(event.localeCompare('')==0)
    {
        process.exit(0);
    }
    else
    {
        middle(event);
    }
}

async function body()
{   
    await client.initialize();   
    let arr = await client.getChats();

    for (let i=0; i<5; i++)
    {
        let chatobj = arr[i];

        fzfstring=fzfstring+chatobj.name+'\\n';
        chats[chatobj.name]=chatobj;

        let messages=await chatobj.fetchMessages({limit: 5});

        chatmessages[chatobj.name]=[];

        console.log(`Processing ${chatobj.name}`);

        for(message of messages)
        {
            chatmessages[chatobj.name].push(message.body);
        }
    }

    start();
};

let fzfstring='';
let chats={};
let chatmessages={};
body();
