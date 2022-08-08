module.exports = function (RED) {
    function ADCNode(config) {
        RED.nodes.createNode(this, config);
        let config_node = RED.nodes.getNode(config.config_plate);
        this.plate = config_node.plate;
        this.plate_model = config_node.model;
        this.channel = null;
        this.voltage = 0;
        this.milliamps = 0;

        var node = this;

        if (this.plate_model !== "ADCplate") {
            this.channel = parseInt(config.channel, 10)
        } else {
            this.channel = config.channel;
            // set to Easy Mode (Medium accuracy)
            const conf = {cmd: "setMODE", args: {mode: 'MED'}};
            node.plate.send(conf, (reply) => {});
        }

        node.on('input', function (msg) {
            let type = RED.nodes.getNode(config.config_plate).model;

            /* Valid DAQC/DAQC2 channels are 0 through 8.  Valid TINKER channels are 1 through 4 */
            let channelValid =
                ((type == "DAQCplate" || type == "DAQC2plate") && (0 <= node.channel && node.channel < 9)) ||
                (type == "TINKERplate" && (1 <= node.channel && node.channel < 5)) ||
                (type == "ADCplate" && (node.channel.match(/^S[0-7]/) || node.channel.match(/^D[0-3]/) ));

            if (!node.plate.plate_status && channelValid) {
                const obj = {cmd: "getADC", args: {channel: node.channel}};
                node.plate.send(obj, (reply) => {
                    node.voltage = reply.voltage
                    node.status({text: node.voltage});
                    node.send({payload: node.voltage});
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
    RED.nodes.registerType("ppADC", ADCNode);
}
