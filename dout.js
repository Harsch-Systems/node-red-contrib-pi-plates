module.exports = function (RED) {
    function DOUTNode(config) {
        RED.nodes.createNode(this, config);
        this.plate = RED.nodes.getNode(config.config_plate).plate;
        this.output = parseInt(config.output, 10);

        if (RED.nodes.getNode(config.config_plate).model == "TINKERplate") {
            const conf = {cmd: "setOUT", args: {bit: this.output}};
            this.plate.send(conf, (reply) => {});
        }

        var node = this;
        node.on('input', function (msg) {
            let type = RED.nodes.getNode(config.config_plate).model;
            let channelValid = type == "DAQCplate" && node.output < 7 ||
              type == "DAQC2plate" && node.output < 8 ||
              type == "TINKERplate" && node.output > 0;

            let validInputs = ["on", "off", "toggle"];
            let inputValid = (typeof msg.payload === 'string' && validInputs.includes(msg.payload));

            if (!node.plate.plate_status && channelValid && inputValid) {
                const obj = {args: {bit: node.output}};
                if (msg.payload == "on") {
                    obj['cmd'] = "setDOUTbit";
                } else if (msg.payload == "off") {
                    obj['cmd'] = "clrDOUTbit";
                } else if (msg.payload == "toggle") {
                    obj['cmd'] = "toggleDOUTbit";
                }
                node.plate.send(obj, (reply) => {
                    node.state = reply.state
                    node.status({text: node.state});
                    node.send({payload: node.state});
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
            } else if (!inputValid) {
                node.status({fill: "red", shape: "ring", text: "invalid input"});
                node.log("invalid input");
            }
        });

        this.on('close', function () {
            // cleanup goes here
        });
    }
    RED.nodes.registerType("ppDOUT", DOUTNode);
}
