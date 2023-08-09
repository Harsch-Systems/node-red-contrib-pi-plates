module.exports = function (RED) {
    function UPSNode(config) {
        RED.nodes.createNode(this, config);
        this.plate = RED.nodes.getNode(config.config_plate).plate;

        var node = this;
        node.on('input', function (msg, send, done) {
            let type = RED.nodes.getNode(config.config_plate).model;
            let plateValid = (type == "POWERplate24");

            if (!node.plate.plate_status && plateValid) {
                const obj = {cmd: "getPOWstatus", args: {}};
                node.plate.send(obj, (reply) => {
                    msg1 = {payload: reply['NO_AC']};
                    msg2 = {payload: reply['LOW_BAT']};
                    msg3 = {payload: reply['LOW_DC_IN']};
                    status_text = "";
                    if (msg1.payload) {
                        status_text += "NO AC";
                    }
                    if (msg2.payload) {
                        status_text += " LOW BAT";
                    }
                    if (msg2.payload) {
                        status_text += " LOW DC IN";
                    }
                    node.status({text: status_text});
                    send([msg1, msg2, msg3]);
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
            } else if (!channelValid) {
                node.status({fill: "red", shape: "ring", text: "invalid channel"});
                node.log("invalid channel");
            }
            if (done) {
                done();
            }
        });

        this.on('close', function () {
            // cleanup goes here
        });
    }
    RED.nodes.registerType("ppUPS", UPSNode);
}
