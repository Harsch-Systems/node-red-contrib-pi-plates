module.exports = function (RED) {
    function DACNode(config) {
        RED.nodes.createNode(this, config);
        this.plate = RED.nodes.getNode(config.config_plate).plate;
        this.channel = parseInt(config.channel, 10);
        this.voltage = 0;

        var node = this;
        node.on('input', function (msg) {
            let type = RED.nodes.getNode(config.config_plate).model;
            let channelValid = (type == "DAQCplate" && node.channel < 2 || type == "DAQC2plate");
            let inputValid = (typeof msg.payload === 'number' && msg.payload >= 0 && msg.payload <= 4.095);

            if (!node.plate.plate_status && inputValid && channelValid) {
                const obj = {cmd: "setDAC", args: {channel: node.channel, value: msg.payload}};
                node.plate.send(obj, (reply) => {
                    node.value = reply.value;
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
            }else if (!inputValid) {
                node.status({fill: "red", shape: "ring", text: "invalid DAC value: ignoring"});
                node.log("invalid DAC value: ignoring");
            }
        });

        this.on('close', function () {
            // cleanup goes here
        });
    }
    RED.nodes.registerType("ppDAC", DACNode);
}
