module.exports = function (RED) {
    function LEDNode(config) {
        RED.nodes.createNode(this, config);
        this.plate = RED.nodes.getNode(config.config_plate).plate;
        var node = this;

        node.on('input', function (msg) {
            const obj = {
                cmd: 'setLED',
                args: { color: msg.payload }
            };

            const pt = node.plate.plate_type;
            if (pt == 'THERMO' || pt == 'RELAY') {
                obj['cmd'] = (msg.payload == 'off' ? "clrLED" : "setLED");
            }

            node.plate.send(obj, (reply) => {
                node.state = reply.state
                node.status({ text: node.state });
                node.send({ payload: node.state });
            });
        });

        this.on('close', function () {
            // cleanup goes here
        });
    }
    RED.nodes.registerType("ppLED", LEDNode);
}
