module.exports = function (RED) {
    function CURRENTNode(config) {
        RED.nodes.createNode(this, config);
        this.plate = RED.nodes.getNode(config.config_plate).plate;
        this.channel = parseInt(config.channel, 10);
        this.milliamps = 0;

        var node = this;
        node.on('input', function (msg) {
            let type = RED.nodes.getNode(config.config_plate).model;
            /* Valid CURRENTplate channels are 1 through 8 */
            let channelValid = ((type == "CURRENTplate") && (1 <= node.channel && node.channel < 8))

            if (!node.plate.plate_status && channelValid) {
                const obj = {cmd: "getI", args: {channel: node.channel}};
                node.plate.send(obj, (reply) => {
                    node.milliamps = reply.milliamps;
                    node.status({text: node.milliamps});
                    node.send({payload: node.milliamps});
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
        });

        this.on('close', function () {
            // cleanup goes here
        });
    }
    RED.nodes.registerType("ppCURRENT", CURRENTNode);
}
