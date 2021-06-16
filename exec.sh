node readallchats.js
cat Allnames.txt | fzf --preview='cd ./AllChats && bat {}.txt'
