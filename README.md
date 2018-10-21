node-red-contrib-pi-plates
==========================

A <a href="http://nodered.org" target="_new">Node-RED</a> node that enables
communication with <a href="https://pi-plates.com">Pi-Plates</a> boards.

 - RELAYplate
 - DAQCplate
 - MOTORplate

Install
-------

Run the following command in your Node-RED user directory - typically `~/.node-red`

    npm install node-red-contrib-pi-plates


Usage
-----

First, make sure the Pi-Plates stack is working with the standard python interface by
following the Getting Started setup steps [here](https://pi-plates.com/getting_started/).
The node actually uses a python script under the hood (similar to the stock gpio node) so
if the Pi Plates python interface isn't setup and working, then this will not work either.

