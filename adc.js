module.exports = function (RED) {
    function ADCNode(config) {
        RED.nodes.createNode(this, config);
        this.plate = RED.nodes.getNode(config.config_plate).plate;
        this.channel = parseInt(config.channel, 10);
        this.voltage = 0;
        var node = this;
        node.on('input', function (msg) {
            const obj = {cmd: "getADC", args: {channel: node.channel}};
            node.plate.send(obj, (reply) => {
                node.voltage = reply.voltage
                node.status({text: node.voltage});
                node.send({payload: node.voltage});
            });
        });

        this.on('close', function () {
            // cleanup goes here
        });
    }
    RED.nodes.registerType("ppADC", ADCNode);
}
