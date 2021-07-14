#!/usr/bin/env node

const {clearscreen, numberofchats, numberofmessages, messagelimit, editor, separator, photoviewer, todownloadmedia, savedir} = require('./config.js'); 

const qrcode = require('qrcode-terminal');

const { Client } = require('whatsapp-web.js');
const {Chat} = require('whatsapp-web.js');

const fs = require('fs')

const axios = require('axios')

const spawn = require('await-spawn');

const shell = require('shelljs');
const { dirname } = require('path');

const client = new Client();

const download = (url, path, callback) => 
axios({
    url,
    responseType: 'stream',
    }).then(
    response =>
        new Promise((resolve, reject) => {
        response.data
            .pipe(fs.createWriteStream(path))
            .on('finish', () => resolve())
            .on('error', e => reject(e));
    }),
);

  

client.on('message', async(message) => {
    const personchat = await message.getContact();
    const person = personchat.name;

    if(chatmessages[person]!=null)
    {
        if(chatmessages[person].length>=messagelimit)
        chatmessages[person].shift();
    }

    if(chatmessages[person]==null)
    chatmessages[person]=[];

    if(message.hasMedia)
    {
        if(todownloadmedia)
        {
            try
            {
                let media = await message.downloadMedia();
                let buffer = Buffer.from(media.data,'base64');
                message.body+=`\n[Message contains media. Media saved at ${savedir}\n]`;
                shell.exec(`touch "${__dirname}/${person}_whatsapp_${message.timestamp}"`,{silent:true, async:false});
                fs.writeFileSync(`${__dirname}/${person}_whatsapp_${message.timestamp}`,buffer);
                shell.exec(`mv "${__dirname}/${person}_whatsapp_${message.timestamp}"  "${savedir}${person}_whatsapp_${message.timestamp}"`,{silent:true, async:false});
            }
            catch(e)
            {
                message.body+=`\n[Message contains media.\n]`;
            }
        }
        else
        {
            message.body+=`\n[Message contains media.\n]`;
        }
    }

    let timestamp = new Date().toLocaleTimeString('en-US');
    chatmessages[person].push({'body':message.body, 'from':person, 'time':timestamp});

    if(newmessages[person]==null)
    {
        newmessages[person]=true;
        const chatobj = await message.getChat();
        chats[person] = chatobj;
        let about = await personchat.getAbout();
        abouts[person] = about;
        let url = await personchat.getProfilePicUrl();

        try
        {
            await download(url,`${__dirname}/images/${chatobj.name}`, () => {;});
        }
        catch(e)
        {
            ;
        }

        if(atstartscreen)
        {
            const event = shell.exec(`bash "${__dirname}/killstart.sh"`, {silent:true}).stdout;
        }
    }
    else if(curr_chat === person)
    {
        const event = shell.exec(`bash "${__dirname}/killprocess.sh"`, {silent:true}).stdout;
    }
    else if(atstartscreen && newmessages[person]==false)
    {
        newmessages[person]=true;
        const event = shell.exec(`bash "${__dirname}/killstart.sh"`, {silent:true}).stdout;
    }
    else if(newmessages[person]==false)
    {
        newmessages[person]=true;
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

    let sep = '';

    if(separator)
    sep='\n---\n';

    let flag=0;

    for (message of messages)
    {
        let addition = `###### ${message.from} (${message.time})\n${message.body}\n${sep}\n`;

        if(flag==0)
        {
            const data = fs.writeFileSync(`${__dirname}/curr.md`, addition);
            flag=1;
        }
        else
        {
            const data = fs.writeFileSync(`${__dirname}/curr.md`, addition, {flag : 'a+'});
        }
    }

    fs.writeFileSync(`${__dirname}/status.md` , `---\n## About : ${abouts[person]}\n\n---`);

    shell.exec(`bash "${__dirname}/exec.sh"`, {silent:false, async:true}, async function(code, stdout, stderr) {
        
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
                const show_message = await spawn(`${editor}`,['curr.md'],{stdio:'inherit'});
                middle(person+'\n');
            }
            else if(interaction[1].localeCompare(`Send Message`)==0)
            {
                shell.exec(`echo -n "" > "${__dirname}/message.txt"`, {silent:true, async:false});
                const make_message = await spawn(`${editor}`,[`${__dirname}/message.txt`],{stdio:'inherit'});
                let new_message = fs.readFileSync(`${__dirname}/message.txt`, {encoding:'utf8'});
    
                let numberofperson = chats[person].id._serialized;

                const regex = new RegExp(/^\s*$/);
                
                if(!regex.test(new_message))
                {
                    if(chatmessages[person].length>=messagelimit)
                    chatmessages[person].shift();
                    
                    let timestamp = new Date().toLocaleTimeString('en-US');
        
                    chatmessages[person].push({'body':new_message, 'from':'You', 'time':timestamp});
                    
                    await client.sendMessage(numberofperson,new_message);
                }

                middle(person+'\n');
            }
            else if(interaction[1].localeCompare('Quick Send')==0)
            {
                new_message = interaction[0];

                let numberofperson = chats[person].id._serialized;
                
                if(new_message.localeCompare(``)!=0)
                {
                    if(chatmessages[person].length>=messagelimit)
                    chatmessages[person].shift();
                
                    let timestamp = new Date().toLocaleTimeString('en-US');

                    chatmessages[person].push({'body':new_message, 'from':'You', 'time':timestamp});
                    
                    await client.sendMessage(numberofperson,new_message);
                }
                
                middle(person+'\n');
            }
            else if(interaction[1].localeCompare('Profile Picture')==0)
            {
                if (fs.existsSync(`${__dirname}/images/${person}`))
                shell.exec(`${photoviewer} "${__dirname}/images/${person}"`, {silent:false, async:true});
                middle(person+'\n');
            }
            else
            {
                middle(person+'\n');
            }
        }

        // console.log(code);
    
    });

}

async function other()
{
    let s = '';

    for(person of allcontacts)
    {
        if(newmessages[person]==null)
        {
            s += `${person}\\n`;
        }
    }

    s+='<--Back';

    let output = shell.exec(`bash "${__dirname}/otherexec.sh" "${s}"`, {silent:false, async:false}).stdout;

    if(!output)
    {
        start();
    }
    else if (output.localeCompare('<--Back\n')==0)
    {
        start();
    }
    else
    {
        let person = output.substring(0,output.length-1);

        shell.exec(`echo -n "" > "${__dirname}/message.txt"`, {silent:true, async:false});
        const make_message = await spawn(`${editor}`,[`${__dirname}/message.txt`],{stdio:'inherit'});
        let new_message = fs.readFileSync(`${__dirname}/message.txt`, {encoding:'utf8'});
        
        const regex = new RegExp(/^\s*$/);

        if(!regex.test(new_message))
        {
            for (chatobj of arr)
            {
                if (chatobj.name == person)
                {
                    chats[person] = chatobj;
                    let contact = await chatobj.getContact();
                    let about = await contact.getAbout();
                    abouts[person] = about;
                    let url = await contact.getProfilePicUrl();
                    await download(url,`${__dirname}/images/${chatobj.name}`, () => {;});
                }
            }
            
            let timestamp = new Date().toLocaleTimeString('en-US');

            chatmessages[person] = [];
            chatmessages[person].push({'body':new_message, 'from':'You', 'time':timestamp});

            newmessages[person] = false;

            let numberofperson = chats[person].id._serialized;
            
            await client.sendMessage(numberofperson,new_message);
        }

        start();

    }
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

    fzfstring += `Other Contacts\\nQuit`;

    shell.exec(`bash "${__dirname}/startbashprogram.sh" "${fzfstring}"`, {silent:false, async:true}, async function(code, stdout, stderr){

        if (code==0)
        {
            if(stdout.localeCompare('Quit\n')==0)
            {
                await onexit();
                process.exit(0);

            }
            else if(stdout.localeCompare('Other Contacts\n')==0)
            {
                other();
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

async function onexit()
{
    shell.exec(`rm -f "${__dirname}/curr.md"`,{silent:true,async:false});
    shell.exec(`rm -f "${__dirname}/status.md"`,{silent:true,async:false});
    shell.exec(`rm -f "${__dirname}/message.txt"`,{silent:true,async:false});
    shell.exec(`rm -rf "${__dirname}/images"`,{silent:true,async:false});
    shell.exec(`rm -f $HOME/.whatsappdir.txt`,{silent:true,async:false});
    return;
}

async function body()
{   
    await client.initialize();   
    arr = await client.getChats();

    for (chatobj of arr)
    {
        allcontacts.push(chatobj.name);
    }

    for (let i=0; i<numberofchats; i++)
    {
        let chatobj = arr[i];

        // fzfstring=fzfstring+chatobj.name+'\\n';
        chats[chatobj.name]=chatobj;

        let messages=await chatobj.fetchMessages({limit: numberofmessages});

        chatmessages[chatobj.name]=[];
        newmessages[chatobj.name]=false;

        console.log(`Processing ${chatobj.name}`);

        for(message of messages)
        {
            let timestamp = new Date(message.timestamp*1000).toLocaleTimeString('en-US');
            let from = await message.getContact();
            from = from.name;

            if(message.hasMedia)
            {
                if(todownloadmedia)
                {
                    let media;
                    try
                    {
                        media = await message.downloadMedia();
                        let buffer = Buffer.from(media.data,'base64');
                        message.body+=`\n[Message contains media. Media saved at ${savedir}\n]`;
                        shell.exec(`touch "${__dirname}/${from}_whatsapp_${message.timestamp}"`,{silent:true, async:false});
                        fs.writeFileSync(`${__dirname}/${from}_whatsapp_${message.timestamp}`,buffer);
                        shell.exec(`mv "${__dirname}/${from}_whatsapp_${message.timestamp}"  "${savedir}${from}_whatsapp_${message.timestamp}"`,{silent:true, async:false});
                    }
                    catch(e)
                    {
                        message.body+='\n[Message contains media.\n]';
                    }
                }
                else
                {
                    message.body+=`\n[Message contains media.\n]`;
                }
            }
           
            chatmessages[chatobj.name].push({'body':message.body, 'from':(message.fromMe?'You':from), 'time':timestamp});
        }
        
        let contact = await chatobj.getContact();
        let url = await contact.getProfilePicUrl();
        let about = await contact.getAbout();
        abouts[chatobj.name] = about;

        try
        {
            await download(url,`${__dirname}/images/${chatobj.name}`, () => {;});
        }
        catch(e)
        {
            ;
        }
    }
    return;
};

let curr_chat='';
let fzfstring='';
let chats={};
let chatmessages={};
let newmessages={};
let abouts={};
let atstartscreen=false;
let allcontacts=[];
let arr = {}

client.on('qr', qr => {
    qrcode.generate(qr, {small: true});
});

client.on('ready', () => {
        console.log('Client is ready!');
        })


async function main()
{
    if (!fs.existsSync(`${__dirname}/curr.md`))
    shell.exec(`touch "${__dirname}/curr.md"`,{silent:true,async:false});

    if (!fs.existsSync(`${__dirname}/status.md`))
    shell.exec(`touch "${__dirname}/status.md"`,{silent:true,async:false});

    if (!fs.existsSync(`${__dirname}/message.txt`))
    shell.exec(`touch "${__dirname}/message.txt"`,{silent:true,async:false});

    if (!fs.existsSync(`${__dirname}/images`))
    shell.exec(`mkdir "${__dirname}/images"`,{silent:true,async:false});

    shell.exec(`echo "${__dirname}" > $HOME/.whatsappdir.txt`,{silent:true, async:false});
    
    await body();

    if(clearscreen)
    shell.exec('clear',{silent:false, async:false});
    
    start();
}

main();