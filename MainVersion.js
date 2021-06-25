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
    let timestamp = new Date().toLocaleTimeString('en-US');
    chatmessages[person].push({'body':message.body, 'from':person, 'time':timestamp});

    if(curr_chat === person)
    {
        const event = shell.exec(`bash ./killprocess.sh`, {silent:true}).stdout;
    }
    else if(atstartscreen && newmessages[person]==false)
    {
        newmessages[person]=true;
        const event = shell.exec(`bash ./killstart.sh`, {silent:true}).stdout;
    }
});

async function middle(person)
{
    atstartscreen=false;

    person=person.substring(0,person.length-1);

    if(person[person.length-1]==')' && person[person.length-2]=='*' && person[person.length-3]=='(')
        person=person.substring(0,person.length-4);

    if(newmessages[person])
        newmessages[person]=false;

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
        
        let interaction = stdout.split('\n');

        if(code!=0)
        {
            middle(person+'\n');
        }
    
        if(code==0)
        {
            if(interaction[1].localeCompare('<--Back')==0)
            {
                start();
            }
            else if(interaction[1].localeCompare(`Past Messages`)==0)
            {
                const show_message = await spawn('vim',['curr.md'],{stdio:'inherit'});
                middle(person+'\n');
            }
            else if(interaction[1].localeCompare(`Send Message`)==0)
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
            else if(interaction[1].localeCompare('Quick Send')==0)
            {
                new_message = interaction[0];

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
    fzfstring = '';
    atstartscreen = true;
    curr_chat = '';
    
    let prop;

    for (prop in newmessages) {
        if (newmessages.hasOwnProperty(prop)) {
            fzfstring = fzfstring + prop;
            if(newmessages[prop])
                fzfstring += ` (*)`;
            fzfstring += `\\n`;
        }
    }

    fzfstring += `Quit\\n`;

    shell.exec(`bash startbashprogram.sh "${fzfstring}"`, {silent:false, async:true}, async function(code, stdout, stderr){

        if (code==0)
        {
            if(stdout.localeCompare('Quit\n')==0)
            {
                process.exit(0);
            }
            else
            {
                middle(stdout);
            }
        }
        else
        {
            start();
        }
    });
}

async function body()
{   
    await client.initialize();   
    let arr = await client.getChats();

    for (let i=0; i<5; i++)
    {
        let chatobj = arr[i];

        // fzfstring=fzfstring+chatobj.name+'\\n';
        chats[chatobj.name]=chatobj;

        let messages=await chatobj.fetchMessages({limit: 5});

        chatmessages[chatobj.name]=[];
        newmessages[chatobj.name]=false;

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
let newmessages={};
let atstartscreen=false;

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