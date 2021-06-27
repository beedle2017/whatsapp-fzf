const qrcode = require('qrcode-terminal');

const { Client } = require('whatsapp-web.js');
const {Chat} = require('whatsapp-web.js');

const fs = require('fs')

const request = require('request')

// const { exec, spawnSync } = require("child_process");

const spawn = require('await-spawn');

const shell = require('shelljs');
const { time } = require('console');

const client = new Client();

const download = (url, path, callback) => {
    request.head(url, (err, res, body) => {
      request(url)
        .pipe(fs.createWriteStream(path))
        .on('close', callback)
    })
}
  

client.on('message', async(message) => {
    const personchat = await message.getContact();
    const person = personchat.name;

    if(chatmessages[person]!=null)
    {
        if(chatmessages[person].length>5)
        chatmessages[person].shift();
    }

    if(chatmessages[person]==null)
    chatmessages[person]=[];

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
        download(url,`./images/${chatobj.name}`, () => {;});
        
        if(atstartscreen)
        {
            const event = shell.exec(`bash ./killstart.sh`, {silent:true}).stdout;
        }
    }
    else if(curr_chat === person)
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

    fs.writeFileSync('status.md' , `---\n## About : ${abouts[person]}\n\n---`);

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
                
                if(new_message.localeCompare(``)!=0)
                {
                    if(chatmessages[person].length>5)
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
                    if(chatmessages[person].length>5)
                    chatmessages[person].shift();
                
                    let timestamp = new Date().toLocaleTimeString('en-US');

                    chatmessages[person].push({'body':new_message, 'from':'You', 'time':timestamp});
                    
                    await client.sendMessage(numberofperson,new_message);
                }
                
                middle(person+'\n');
            }
            else if(interaction[1].localeCompare('Profile Picture')==0)
            {
                shell.exec(`xdg-open "./images/${person}"`, {silent:false, async:true});
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

    let output = shell.exec(`echo "${s}" | fzf --layout="reverse-list" --border --info="hidden" --preview='echo "# Hit Enter to send message to the person" | mdcat '`, {silent:false, async:false}).stdout;

    if(!output)
    {
        start();
    }
    else
    {
        let person = output.substring(0,output.length-1);

        const make_message = await spawn('vim',['message.txt'],{stdio:'inherit'});
        let new_message = fs.readFileSync('./message.txt', {encoding:'utf8'});

        if(new_message.localeCompare(``)!=0)
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
                    download(url,`./images/${chatobj.name}`, () => {;});
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

    fzfstring += `Other Contacts\\nQuit\\n`;

    shell.exec(`bash startbashprogram.sh "${fzfstring}"`, {silent:false, async:true}, async function(code, stdout, stderr){

        if (code==0)
        {
            if(stdout.localeCompare('Quit\n')==0)
            {
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

async function body()
{   
    await client.initialize();   
    arr = await client.getChats();

    for (chatobj of arr)
    {
        allcontacts.push(chatobj.name);
    }

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
        
        let contact = await chatobj.getContact();
        let url = await contact.getProfilePicUrl();
        let about = await contact.getAbout();
        abouts[chatobj.name] = about;

        download(url,`./images/${chatobj.name}`, () => {;});
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
    await body();
    start();
}

main();