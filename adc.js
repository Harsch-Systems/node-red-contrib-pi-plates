module.exports = function (RED) {
    function ADCNode(config) {
        RED.nodes.createNode(this, config);
        this.plate = RED.nodes.getNode(config.config_plate).plate;
	this.channel = config.channel;
        var node = this;
        node.on('input', function (msg) {
            var volts = this.plate.getADC(this.channel);
            var msg = {payload: volts}
            node.send(msg);
        });

        this.on('close', function () {
            // cleanup goes here
        });
    }
    RED.nodes.registerType("ppADC", ADCNode);
}
