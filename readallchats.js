const qrcode = require('qrcode-terminal');

const { Client } = require('whatsapp-web.js');
const {Chat} = require('whatsapp-web.js');

const fs = require('fs')

const { exec } = require("child_process");

const client = new Client();

client.on('qr', qr => {
    qrcode.generate(qr, {small: true});
});

client.on('ready', () => {
        console.log('Client is ready!');
        })

async function body()
{   
    await client.initialize();   
    let arr = await client.getChats();

    arr.forEach(async(chatobj) =>
        {
            let content = chatobj.name+'\n';
            try {
                const data = fs.writeFileSync('./Allnames.txt', content, { flag: 'a+' });
                //file written successfully
              } catch (err) {
                console.error(err);
              }

              exec(`touch "./AllChats/${chatobj.name}.txt"`, (error, stdout, stderr) => {
                if (error) {
                    console.log(`error: ${error.message}`);
                    return;
                }
                if (stderr) {
                    console.log(`stderr: ${stderr}`);
                    return;
                }
                console.log('Still going');
            });

            const messages=await chatobj.fetchMessages({limit: 10});

            messages.forEach( message =>
                {
                    let addition = message.body+'\n\n';
                    try {
                        const data = fs.writeFileSync(`./AllChats/${chatobj.name}.txt`, addition, { flag: 'a+' });
                        console.log(`Still writing in ${chatobj.name}.`);
                        //file written successfully
                      } catch (err) {
                        console.error(err);
                      }
                });

        });

};

body();