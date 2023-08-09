module.exports = function (RED) {
    function RelayNode(config) {
        RED.nodes.createNode(this, config);
        this.config_node = RED.nodes.getNode(config.config_plate);
        this.plate = this.config_node.plate;
        this.plate_model = this.config_node.model;
        if (this.plate_model !== "POWERplate24") {
            this.relay = parseInt(config.relay, 10);
        } else {
            this.relay = config.relay;
        }
        this.state = "UNKNOWN";

        var node = this;
        node.on('input', function (msg, send, done) {
            let type = RED.nodes.getNode(config.config_plate).model;
            let relayValid = (type == "RELAYplate2" && node.relay <= 8 ||
                              type == "RELAYplate" && node.relay < 8 ||
                              type == "POWERplate24" && node.relay == "fan" ||
                              type == "TINKERplate" && node.relay < 3);

            let validInputs = ["on", "off", "toggle", "state"];
            let validFanInputs = ["on", "off", "state"];
            let inputValid =
                (type !== "POWERplate24" && typeof msg.payload === 'string' && validInputs.includes(msg.payload)) ||
                (type == "POWERplate24" && typeof msg.payload === 'string' && validFanInputs.includes(msg.payload));

            if (!node.plate.plate_status && relayValid && inputValid) {
                const obj = {args: {relay: node.relay}};

                if (type !== "POWERplate24") {
                    if (msg.payload == "on") {
                        obj['cmd'] = "relayON";
                    } else if (msg.payload == "off") {
                        obj['cmd'] = "relayOFF";
                    } else if (msg.payload == "toggle") {
                        obj['cmd'] = "relayTOGGLE";
                    } else if (msg.payload == "state") {
                        obj['cmd'] = "relaySTATE";
                    }
                } else if (type == "POWERplate24")
                    if (msg.payload == "on") {
                        obj['cmd'] = "fanON";
                    } else if (msg.payload == "off") {
                        obj['cmd'] = "fanOFF";
                    } else if (msg.payload == "state") {
                        obj['cmd'] = "fanSTATE";
                    }

                node.plate.send(obj, (reply) => {
                    if (reply.state != node.state) {
                        node.state = reply.state
                        node.status({text: node.state});
                    }
                    msg.payload = node.state;
                    send(msg);
                });
            } else if (node.plate.plate_status == 1) {
                node.status({fill: "red", shape: "ring", text: "invalid plate"});
                node.log("invalid plate");

                node.plate.update_status();
            } else if (node.plate.plate_status == 2) {
                node.status({fill: "red", shape: "ring", text: "missing python dependencies"});
                node.log("missing python dependencies");
            } else if (node.plate.plate_status == 3) {
                node.status({fill: "red", shape: "ring", text: "python process error"});
                node.log("python process error");
            } else if (!relayValid) {
                node.status({fill: "red", shape: "ring", text: "invalid relay"});
                node.log("invalid relay");
            } else if (!inputValid) {
                node.status({fill: "red", shape: "ring", text: "invalid input"});
                node.log("invalid input");
            }
            if (done) {
                done();
            }
        });
    }
    RED.nodes.registerType("ppRelay", RelayNode);
}
