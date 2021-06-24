# function no_ctrlc()
# {
#     echo 'Quitting'
#     exit 130
# }

# trap no_ctrlc USR1

echo -e 'Past Messages\nSend Message\nQuick Send\n<--Back' | fzf --layout="reverse-list" --border --phony --info="hidden" --print-query --preview-window="70%:wrap" --preview='
x={2} 
if [[ "$x" == "Messages" ]]; then 
mdcat curr.md 
fi
if [[ "$x" == "Send" ]]; then 
echo "# Just type the message you want to send and hit Enter." | mdcat
fi '
