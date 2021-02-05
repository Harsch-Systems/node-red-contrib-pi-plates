module.exports = function (RED) {
    function FREQNode(config) {
        RED.nodes.createNode(this, config);
        this.plate = RED.nodes.getNode(config.config_plate).plate;
        this.input = parseInt(config.input, 10);
        this.state = 0;

        var node = this;
        node.on('input', function (msg) {
            let type = RED.nodes.getNode(config.config_plate).model;
            let channelValid = (type == "DAQC2plate");

            if (!node.plate.plate_status && channelValid) {
                const obj = {cmd: "getFREQ", args: {}};
                node.plate.send(obj, (reply) => {
                    node.value = reply.value
                    node.status({text: node.value});
                    node.send({payload: node.value});
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
    RED.nodes.registerType("ppFREQ", FREQNode);
}
