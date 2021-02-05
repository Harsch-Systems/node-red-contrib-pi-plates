module.exports = function (RED) {
    function RelayNode(config) {
        RED.nodes.createNode(this, config);
        this.plate = RED.nodes.getNode(config.config_plate).plate;
        this.relay = parseInt(config.relay, 10);
        this.state = "UNKNOWN";

        var node = this;
        node.on('input', function (msg) {
            let type = RED.nodes.getNode(config.config_plate).model;
            let relayValid = (type == "RELAYplate" || type == "TINKERplate" && node.relay < 3);

            let validInputs = ["on", "off", "toggle"];
            let inputValid = (typeof msg.payload === 'string' && validInputs.includes(msg.payload));

            if (!node.plate.plate_status && relayValid && inputValid){
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
            }else if (node.plate.plate_status == 1) {
                node.status({fill: "red", shape: "ring", text: "invalid plate"});
                node.log("invalid plate");

                node.plate.update_status();
            }else if (node.plate.plate_status == 2) {
                node.status({fill: "red", shape: "ring", text: "missing python dependencies"});
                node.log("missing python dependencies");
            }else if (node.plate.plate_status == 3) {
                node.status({fill: "red", shape: "ring", text: "python process error"});
                node.log("python process error");
            }else if (!relayValid) {
                node.status({fill: "red", shape: "ring", text: "invalid relay"});
                node.log("invalid relay");
            }else if (!inputValid) {
                node.status({fill: "red", shape: "ring", text: "invalid input"});
                node.log("invalid input");
            }
        });
    }
    RED.nodes.registerType("ppRelay", RelayNode);
}
