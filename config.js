// Whether to clear terminal screen when program starts
const clearscreen = true

// This is the number of chats from which all messages are fetched when the program starts
const numberofchats = 7

// Note: Fetching more messages and chats will require more time during initial program startup

// Number of messages per conversation to be fetched when the program starts
const numberofmessages = 5

// This represents the maximum number of messages per conversation that is shown at once
const messagelimit = 6

// Text editor to be used
const editor = 'nano'

//Whether to show a line separator between messages
const separator = true;

// Command to use to view pictures
const photoviewer = 'xdg-open'

// Whether to download media files or not
const todownloadmedia = true

// Directory where media files will be downloaded (relevant only if todownloadmedia = true)
const savedir = '$HOME/Downloads/'

module.exports = {clearscreen, numberofchats, numberofmessages, messagelimit, editor, separator, photoviewer, todownloadmedia, savedir} ;