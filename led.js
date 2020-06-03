module.exports = function (RED) {
    function LEDNode(config) {
        RED.nodes.createNode(this, config);
        this.plate = RED.nodes.getNode(config.config_plate).plate;
        const verifier = {cmd: "VERIFY", args: {}};
        this.plate.send(verifier, (reply) => {
            var type = RED.nodes.getNode(config.config_plate).model;
            if (reply.state == 1 && type != "TINKERplate"){
                this.status({fill: "green", shape: "ring", text: "plate validated"});
                this.verified = true;
            }else{
                this.status({fill: "red", shape: "ring", text: "invalid plate or input"});
                this.verified = false;
            }
        });
        var node = this;
        node.on('input', function (msg) {
            if(node.verified){
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
            }else{
                //TODO: Handle invalid message
            }
        });

        this.on('close', function () {
            // cleanup goes here
        });
    }
    RED.nodes.registerType("ppLED", LEDNode);
}
