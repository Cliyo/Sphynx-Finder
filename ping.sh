#!/bin/bash

interfaces=$(ip addr show | grep '^[0-9]' | awk '{print $2}' | cut -d ':' -f 1)

for interface in $interfaces; do
    echo "Interface: $interface"

    ipv4=$(ip addr show $interface | grep 'inet ' | awk '{print $2}' | cut -d '/' -f 1)
    echo "IPv4: $ipv4"

    subnet=$(echo $ipv4 | cut -d '.' -f 1-3)
    echo "Prefixo da Rede: $subnet"

    nmap -sn $subnet.0/24 | grep 'Nmap scan report for' | awk '{print $5}'
done
