val="$( ps -o pid,args -C bash | awk '/startbashprogram.sh/ { print $1 }' )"
# kill -SIGUSR1 $val
pkill -P "$val"
