const qrcode = require('qrcode-terminal');

const { Client } = require('whatsapp-web.js');
const {Chat} = require('whatsapp-web.js');

const fs = require('fs')

// const { exec, spawnSync } = require("child_process");

const spawn = require('await-spawn');

const shell = require('shelljs');
const { time } = require('console');

const client = new Client();

client.on('message', async(message) => {
    const personchat = await message.getContact();
    const person = personchat.name;

    const throwaway = chatmessages[person].shift();
    let timestamp = new Date(message.timestamp).toLocaleTimeString('en-US');
    chatmessages[person].push({'body':message.body, 'from':person, 'time':timestamp});

    if(curr_chat === person)
    {
        const event = shell.exec(`bash ./killprocess.sh`, {silent:true}).stdout;
    }
});

async function middle(person)
{
    person=person.substring(0,person.length-1);

    curr_chat = person;

    const messages=chatmessages[person];

    let flag=0;

    for (message of messages)
    {
        let addition = `###### ${message.from} (${message.time})\n${message.body}\n\n---\n\n`;

        if(flag==0)
        {
            const data = fs.writeFileSync(`curr.md`, addition);
            flag=1;
        }
        else
        {
            const data = fs.writeFileSync(`curr.md`, addition, {flag : 'a+'});
        }
    }

    shell.exec(`bash exec.sh`, {silent:false, async:true}, async function(code, stdout, stderr) {
        
        let interaction = stdout;

        if(code!=0)
        {
            middle(person+'\n');
        }
    
        if(code==0)
        {
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
                
                let timestamp = new Date().toLocaleTimeString('en-US');
    
                chatmessages[person].push({'body':new_message, 'from':'You', 'time':timestamp});
    
                const msg= await client.sendMessage(numberofperson,new_message);
    
                middle(person+'\n');
            }
            else
            {
                process.exit(0);
            }
        }

        // console.log(code);
    
    });

}

async function start()
{
    const event = shell.exec(`echo "${fzfstring}" | fzf --layout="reverse-list" --border`, {silent:false}).stdout;

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
            let timestamp = new Date(message.timestamp).toLocaleTimeString('en-US');
            let from = await message.getContact();
            from = from.name;
            chatmessages[chatobj.name].push({'body':message.body, 'from':(message.fromMe?'You':from), 'time':timestamp});
        }        
    }

    return;
};

let curr_chat='';
let fzfstring='';
let chats={};
let chatmessages={};

client.on('qr', qr => {
    qrcode.generate(qr, {small: true});
});

client.on('ready', () => {
        console.log('Client is ready!');
        })


async function main()
{    
    await body();
    start();
}

main();