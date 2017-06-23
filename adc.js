var DAQCplate = require('pi-plates').DAQCplate;

module.exports = function (RED) {
    function ADCNode(config) {
        RED.nodes.createNode(this, config);
        this.config_plate = RED.nodes.getNode(config.config_plate);
	this.control_plate = new DAQCplate(0);
	this.channel = config.channel;
        var node = this;
        node.on('input', function (msg) {
            var volts = this.control_plate.getADC(this.channel);
            var msg = {payload: volts}
            node.send(msg);
        });

        this.on('close', function () {
            // cleanup goes here
        });
    }
    RED.nodes.registerType("ppADC", ADCNode);
}
