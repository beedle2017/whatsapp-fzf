# whatsapp-fzf
Send and receive Whatsapp messages from terminal. 
Uses [fzf-menu](https://github.com/junegunn/fzf) as an interface for the user.

Currently works only on Linux.

**NOTE** : Internally [whatsapp-web.js](https://www.npmjs.com/package/whatsapp-web.js) is being used to send and receive messages. Though it has been safe as per my testing, I cannot promise that your number will not be blocked by Whatsapp. Also, this project is not affiliated, associated, authorized or endorsed with [Whatsapp](https://whatsapp.com) or any of its subsidiaries or affiliates in any way.

## Features:
- Send and receive messages from all your contacts
- View recent messages from contacts
- Receive media files.
- View *about* and *profile picture* of contacts

## Installation:
`npm install -g whatsapp-fzf`

You also need to install [fzf](https://github.com/junegunn/fzf) (for the interface) and [mdcat](https://github.com/lunaryorn/mdcat) (for previewing messages)

## Usage:
In terminal, just enter `whatsapp-fzf` to start chatting.

