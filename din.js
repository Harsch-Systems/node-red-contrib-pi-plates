module.exports = function (RED) {
    function DINNode(config) {
        RED.nodes.createNode(this, config);
        this.plate = RED.nodes.getNode(config.config_plate).plate;
        this.input = parseInt(config.input, 10);
        this.state = 0;

        var node = this;

        if (RED.nodes.getNode(config.config_plate).model == "TINKERplate") {
            const conf = {cmd: "setIN", args: {bit: node.input}};
            node.plate.send(conf, (reply) => {});
        }

        node.on('input', function (msg, send, done) {
            let type = RED.nodes.getNode(config.config_plate).model;
            let channelValid = false;
            let cmd_str = "getDINbit";
            if (type == "DAQCplate" || type == "DAQC2plate") {
                // valid values are 0-7
                if (node.input >= 0 && node.input <= 7) {
                    channelValid = true;
                }
            } else if (type == "DIGIplate") {
                // valid values are 1-8
                if (node.input >= 1 && node.input <= 8) {
                    channelValid = true;
                }
            } else if (type == "ADCplate") {
                // 0-3 plus TRIG is 4
                if (node.input >= 0 && node.input <= 4) {
                    channelValid = true;
                }
            } else if (type == "TINKERplate") {
                if (node.input >= 1 && node.input <= 8) {
                    channelValid = true;
                }
                cmd_str = "getDIN";
            }

            if (!node.plate.plate_status && channelValid) {
                const obj = {cmd: cmd_str, args: {bit: node.input}};
                node.plate.send(obj, (reply) => {
                    node.state = reply.state;
                    node.status({text: node.state});
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
    RED.nodes.registerType("ppDIN", DINNode);
}
