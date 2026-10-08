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

Upgrading from 0.3.0 to 0.4.0
-----------------------------

Existing flows work without changes: node types and settings are the same. Upgrade with:

    npm install node-red-contrib-pi-plates@0.4.0

This also installs pi-plates 0.4.0, which it requires. Then restart Node-RED.

What behaves differently:

 - **Failed commands raise errors.** If a command fails, the node shows a red
   "command failed" status and raises an error that Catch nodes receive. In 0.3.0
   the message was silently lost, and if the python co-process crashed every node
   went silent until Node-RED was restarted.
 - **Recovery is automatic.** If the python co-process crashes it restarts by itself,
   and nodes carry on once it is back.
 - **"plate not ready" status.** Messages that arrive before a plate has been verified,
   or while the co-process is restarting, are dropped with a yellow
   "plate not ready" status.
 - **LED node output.** The LED node now outputs the new LED state (`1`/`0`) in cases
   where 0.3.0 output `undefined`, e.g. toggling a DAQC2plate LED.

**Upgrade both packages together.** node-red-contrib-pi-plates 0.3.0 accepts any
pi-plates version from 0.3.0 up, but it is not compatible with pi-plates 0.4.0: some
nodes can crash Node-RED when a command fails. If you need to stay on
node-red-contrib-pi-plates 0.3.0, pin pi-plates to 0.3.0 by adding this to the
`package.json` in your Node-RED user directory and running `npm install` there:

    "overrides": {
        "pi-plates": "0.3.0"
    }

Usage
-----

See built-in documentation for each node.
