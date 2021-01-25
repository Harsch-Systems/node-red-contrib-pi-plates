module.exports = function (RED) {
    function LEDNode(config) {
        RED.nodes.createNode(this, config);
        this.plate = RED.nodes.getNode(config.config_plate).plate;

        var node = this;
        node.on('input', function (msg) {
            let type = RED.nodes.getNode(config.config_plate).model;
            let channelValid = (type != "TINKERplate");
            let inputValid = (typeof msg.payload === 'string');

            if(!node.plate.plate_status && channelValid && inputValid) {
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
            }else if (node.plate.plate_status == 1) {
                node.status({fill: "red", shape: "ring", text: "invalid plate"});
                node.log("invalid plate");
            }else if (node.plate.plate_status == 2) {
                node.log("python process error");
            }else if (!channelValid) {
                node.status({fill: "red", shape: "ring", text: "invalid plate type"});
                node.log("invalid plate type");
            }else if (!inputValid) {
                node.log("invalid input type");
            }
        });

        this.on('close', function () {
            // cleanup goes here
        });
    }
    RED.nodes.registerType("ppLED", LEDNode);
}
