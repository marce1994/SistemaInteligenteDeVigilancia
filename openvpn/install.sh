sudo apt-get install openvpn

sudo cp start-openvpn.service /etc/systemd/system/start-openvpn.service

sudo mkdir /home/pi/ovpn
sudo cp *.ovpn /home/pi/ovpn/config.ovpn
sudo cp *.pass /home/pi/ovpn/config.pass