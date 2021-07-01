echo -e 'Past Messages\nAbout\nProfile Picture\nSend Message\nQuick Send\n<--Back' | fzf --layout="reverse-list" --border --phony --info="hidden" --print-query --preview-window="70%:wrap" --preview='
x={1}
SCRIPT_DIR=$(head -n 1 $HOME/.whatsappdir.txt)
y="${SCRIPT_DIR}/curr.md"
z="${SCRIPT_DIR}/status.md" 
if [[ "$x" == "Past" ]]; then 
mdcat $y 
fi
if [[ "$x" == "Quick" ]]; then 
echo "# Just type the message you want to send and hit Enter." | mdcat
fi
if [[ "$x" == "About" ]]; then 
mdcat $z
fi 
if [[ "$x" == "Profile" ]]; then 
echo "# Hit Enter to see profile picture." | mdcat
fi
if [[ "$x" == "Send" ]]; then 
echo "# Hit Enter to open text editor. Blank messages will not be sent." | mdcat
fi 
'