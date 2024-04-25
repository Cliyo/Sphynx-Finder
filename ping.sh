#!/bin/bash
tempo_inicio=$(date +%s)

interfaces=$(ip -o link show | awk -F': ' '{print $2}'  | grep -vE '^lo|^tailscale')

ping_subnets(){
    subnet="$1"
    for i in $(seq 1 254); do
        ping -c 1 -W 0.1 $subnet.$i &> /dev/null
        if [ $? -eq 0 ]; then
            echo "Dispositivo ativo: $subnet.$i"
        fi
    done
}

subnets=()

for interface in $interfaces; do
    echo "Interface: $interface"

    ipv4_info=$(ip addr show $interface | grep -E '\binet\b')
    if [ -n "$ipv4_info" ]; then
        ipv4=$(echo "$ipv4_info" | awk '{print $2}' | cut -d '/' -f 1)

        subnet=$(echo $ipv4 | cut -d '.' -f 1-3)
        echo "Prefixo da Rede: $subnet"

        subnets+=("$subnet")

    else
        echo "IPV4 inexistente em $interface."
    fi
done

for subnet in "${subnets[@]}"; do
    ping_subnets "$subnet" &
done

wait

tempo_fim=$(date +%s)
tempo_exec=$((tempo_fim - tempo_inicio))

echo "Tempo de scan: $tempo_exec segundos"
