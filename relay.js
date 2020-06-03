module.exports = function (RED) {
    function RelayNode(config) {
        RED.nodes.createNode(this, config);
        this.plate = RED.nodes.getNode(config.config_plate).plate;
        this.relay = parseInt(config.relay, 10);
        this.state = "UNKNOWN";
        const verifier = {cmd: "VERIFY", args: {}};
        this.plate.send(verifier, (reply) => {
            var type = RED.nodes.getNode(config.config_plate).model;
            if (reply.state == 1 && (type == "RELAYplate" || type == "TINKERplate" && this.relay < 3)){
                this.status({fill: "green", shape: "ring", text: "plate validated"});
                this.verified = true;
            }else{
                this.status({fill: "red", shape: "ring", text: "invalid plate or input"});
                this.verified = false;
            }
        });
        var node = this;
        node.on('input', function (msg) {
            if (node.verified){
                const obj = {args: {relay: node.relay}};
                if (msg.payload == "on") {
                    obj['cmd'] = "relayON";
                } else if (msg.payload == "off") {
                    obj['cmd'] = "relayOFF";
                } else if (msg.payload == "toggle") {
                    obj['cmd'] = "relayTOGGLE";
                }
                node.plate.send(obj, (reply) => {
                    if (reply.state != node.state) {
                        node.state = reply.state
                        node.send({payload: node.state});
                    }
                    node.status({text: node.state});
                });
            }else{
                //TODO: Handle invalid message
            }
        });
    }
    RED.nodes.registerType("ppRelay", RelayNode);
}
