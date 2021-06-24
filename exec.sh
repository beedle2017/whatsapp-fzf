# function no_ctrlc()
# {
#     echo 'Quitting'
#     exit 130
# }

# trap no_ctrlc USR1

echo -e 'Past Messages\nSend Message\n<--Back' | fzf --layout="reverse-list" --border --phony --preview-window="70%:wrap" --preview='
x={2} 
if [[ "$x" == "Messages" ]]; then 
mdcat curr.md 
fi '
