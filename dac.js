module.exports = function (RED) {
    function DACNode(config) {
        RED.nodes.createNode(this, config);
        this.plate = RED.nodes.getNode(config.config_plate).plate;
        this.channel = parseInt(config.channel, 10);
        this.voltage = 0;
        var node = this;
        node.on('input', function (msg) {
            if (typeof msg.payload == "number" &&
                (msg.payload >= 0) &&
                (msg.payload <= 4.095)) {
                const obj = {cmd: "setDAC", args: {channel: node.channel, value: msg.payload}};
                node.plate.send(obj, (reply) => {
                    node.value = reply.value;
                    //node.status({text: node.value});
                    node.send({payload: node.value});
                });
            } else {
                this.warn("invalid DAC value: ignoring");
            }
        });

        this.on('close', function () {
            // cleanup goes here
        });
    }
    RED.nodes.registerType("ppDAC", DACNode);
}
