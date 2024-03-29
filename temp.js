module.exports = function (RED) {
    function TEMPNode(config) {
        RED.nodes.createNode(this, config);
        this.plate = RED.nodes.getNode(config.config_plate).plate;
        this.input = parseInt(config.input, 10);
        this.scale = config.scale;
        this.temp = 0;

        var node = this;

        let type = RED.nodes.getNode(config.config_plate).model;
        let channelValid = (type == "DAQCplate" && node.input < 8 || type == "TINKERplate" && node.input > 0);

        if (RED.nodes.getNode(config.config_plate).model == "TINKERplate") {
            if (channelValid) {
                const conf = {cmd: "setTEMP", args: {bit: node.input}};
                node.plate.send(conf, (reply) => {});
            } else {
                node.status({fill: "red", shape: "ring", text: "invalid channel"});
                node.log("invalid channel");
            }
        }

        node.on('input', function (msg, send, done) {
            if (!node.plate.plate_status && channelValid) {
                const obj = {cmd: "getTEMP", args: {bit: node.input, scale: node.scale}};
                node.plate.send(obj, (reply) => {
                    node.temp = reply.temp;
                    node.status({text: node.temp});
                    msg.payload = node.temp;
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
    RED.nodes.registerType("ppTEMP", TEMPNode);
}
