val="$( ps -o pid,args -C bash | awk '/exec.sh/ { print $1 }' )"
# kill -SIGUSR1 $val
pkill -P $val