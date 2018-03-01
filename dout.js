module.exports = function (RED) {
    function DOUTNode(config) {
        RED.nodes.createNode(this, config);
        this.plate = RED.nodes.getNode(config.config_plate).plate;
	this.output = config.output;
        var node = this;
        node.on('input', function (msg) {
            if (msg.payload == "on") {
                this.plate.setDOUTbit(this.output);
                this.status({text: '1'});
            } else if (msg.payload == "off") {
                this.plate.clrDOUTbit(this.output);
                this.status({text: '0'});
            }
            var state = this.plate.getDOUTbit(this.output);
            var msg = {payload: state}
            node.send(msg);
        });

        this.on('close', function () {
            // cleanup goes here
        });
    }
    RED.nodes.registerType("ppDOUT", DOUTNode);
}
