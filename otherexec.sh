echo -e "$1" | fzf --layout="reverse-list" --border --info="hidden" --preview='echo "# Hit Enter to send message to the person from text editor. Blank messages will not be sent." | mdcat '