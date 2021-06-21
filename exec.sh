# function no_ctrlc()
# {
#     echo 'Quitting'
#     exit 130
# }

# trap no_ctrlc USR1

echo -e 'Past Messages\nSend Message\n<--Back' | fzf --preview='
x={2} 
if [[ "$x" == "Messages" ]]; then 
cat curr.txt 
fi '
