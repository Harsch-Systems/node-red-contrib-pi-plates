node-red-contrib-pi-plates
==========================

A <a href="http://nodered.org" target="_new">Node-RED</a> node that enables
communication with <a href="https://pi-plates.com">Pi-Plates</a> boards.

 - RELAYplate
 - RELAYplate2
 - DAQCplate
 - DAQC2plate
 - TINKERplate
 - MOTORplate
 - ADCplate
 - CURRENTplate
 - DIGIplate

Prerequisites
-------
You will need the python3-venv package.  This is included by default in Raspberry Pi OS 'Bookworm' but not in previous releases.
```
sudo apt install python3-venv
```
Also, the SPI interface must be enabled.  This is done using the 'sudo raspi-config' command under 'Interface Options' -> 'SPI' 

Install
-------

As of the 0.3.0 release, this package utilizes it's own python virtual environment that contains the pi-plates python
package.  This is automatically initialized when this package is installed, so it is no longer necessary to manually
download and install the python pi-plates package.

Run the following command in your Node-RED user directory - typically `~/.node-red`

    npm install node-red-contrib-pi-plates


Usage
-----

See built-in documentation for each node.
