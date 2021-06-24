module.exports = function (RED) {
    function DINNode(config) {
        RED.nodes.createNode(this, config);
        this.plate = RED.nodes.getNode(config.config_plate).plate;
        this.input = parseInt(config.input, 10);
        this.state = 0;

        var node = this;

        if (RED.nodes.getNode(config.config_plate).model  == "TINKERplate"){
            const conf = {cmd: "setIN", args: {bit: node.input}};
            node.plate.send(conf, (reply) => {});
        }

        node.on('input', function (msg) {
            let type = RED.nodes.getNode(config.config_plate).model;
            let channelValid = ((type == "DAQCplate" || type == "DAQC2plate") && node.input < 8) || type == "TINKERplate" && node.input > 0;

            if (!node.plate.plate_status && channelValid) {
                const obj = {cmd: "getDINbit", args: {bit: node.input}};
                node.plate.send(obj, (reply) => {
                    node.state = reply.state
                    node.status({text: node.state});
                    node.send({payload: node.state});
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
            }else if (!channelValid) {
                node.status({fill: "red", shape: "ring", text: "invalid channel"});
                node.log("invalid channel");
            }
        });

        this.on('close', function () {
            // cleanup goes here
        });
    }
    RED.nodes.registerType("ppDIN", DINNode);
}
