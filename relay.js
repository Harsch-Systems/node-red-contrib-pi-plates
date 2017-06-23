var RELAYplate = require('pi-plates').RELAYplate;

module.exports = function (RED) {
    function RelayNode(config) {
        RED.nodes.createNode(this, config);
        this.config_plate = RED.nodes.getNode(config.config_plate);
	this.control_plate = new RELAYplate(0);
	this.relay = config.relay;
        var node = this;
        node.on('input', function (msg) {
            if (msg.payload == "on") {
                this.control_plate.relayON(this.relay);
            } else if (msg.payload == "off") {
                this.control_plate.relayOFF(this.relay);
            } else if (msg.payload == "toggle") {
                this.control_plate.relayTOGGLE(this.relay);
            }

            var states = this.control_plate.relaySTATE();
            var mystate = states[this.relay - 1];
            var msg = {payload: mystate}
            node.send(msg);
        });

        this.on('close', function () {
            this.control_plate.relayALL(0);
        });
    }
    RED.nodes.registerType("ppRelay", RelayNode);
}
