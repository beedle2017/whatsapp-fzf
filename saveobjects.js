const { JSON } = require('./cycle');

const qrcode = require('qrcode-terminal');

const { Client } = require('whatsapp-web.js');
const {Chat} = require('whatsapp-web.js');

const fs = require('fs')

// const { exec, spawnSync } = require("child_process");

// const spawn = require('await-spawn');

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

    const messages=await chats[person].fetchMessages({limit: 5});

    const setupFile = fs.writeFileSync(`curr.txt`, person+'\n\n');

    for (message of messages)
    {
        let addition = message.body+'\n\n';
        const data = fs.writeFileSync(`curr.txt`, addition, { flag: 'a+' });
    }

    const interaction = shell.exec(`bash exec.sh`, {silent:false}).stdout;
        
    if(interaction.localeCompare('<--Back\n')==0)
    {
        start();
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

    for (chatobj of arr)
    {
        fzfstring=fzfstring+chatobj.name+'\\n';
        chats[chatobj.name]=chatobj;
    }

    start();
};

let fzfstring='';
let chats={};
body();
