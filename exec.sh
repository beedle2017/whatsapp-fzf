echo -e 'Past Messages\nSend Message\n<--Back' | fzf --preview='
x={2} 
if [[ "$x" == "Messages" ]]; then 
cat curr.txt 
fi '
