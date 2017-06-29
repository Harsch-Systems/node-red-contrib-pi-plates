module.exports = function (RED) {
    function RelayNode(config) {
        RED.nodes.createNode(this, config);
        this.plate = RED.nodes.getNode(config.config_plate).plate;
	this.relay = config.relay;
        var node = this;
        node.on('input', function (msg) {
            if (msg.payload == "on") {
                this.plate.relayON(this.relay);
            } else if (msg.payload == "off") {
                this.plate.relayOFF(this.relay);
            } else if (msg.payload == "toggle") {
                this.plate.relayTOGGLE(this.relay);
            }

            var states = this.plate.relaySTATE();
            var mystate = states[this.relay - 1];
            var msg = {payload: mystate}
            node.send(msg);
        });

        this.on('close', function () {
            this.plate.relayALL(0);
        });
    }
    RED.nodes.registerType("ppRelay", RelayNode);
}
