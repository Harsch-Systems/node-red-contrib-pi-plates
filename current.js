module.exports = function (RED) {
    function CURRENTNode(config) {
        RED.nodes.createNode(this, config);
        let config_node = RED.nodes.getNode(config.config_plate);
        this.plate = config_node.plate;
        this.plate_model = config_node.model;
        this.channel = null;
        this.milliamps = 0;

        if (this.plate_model !== "ADCplate") {
            this.channel = parseInt(config.channel, 10);
        } else {
            this.channel = config.channel;
        }

        console.log('channel is: ' + this.channel)

        var node = this;
        node.on('input', function (msg) {
            /* Valid CURRENTplate channels are 1 through 8 */
            /* Valid ADCplate channels are I0 through I3 */
            let channelValid = false;
            if ((node.plate_model == "CURRENTplate") && (1 <= node.channel &&
                 node.channel <= 8)) {
                channelValid = true;
            } else if ((node.plate_model == "ADCplate") &&
                       typeof node.channel == "string") {
                if (node.channel.match(/^I[0-3]/)) {
                    channelValid = true;
                }
            }

            console.log('valid: ' + channelValid + ' channel: ' + node.channel);
            if (!node.plate.plate_status && channelValid) {
                const obj = {cmd: "getADC", args: {channel: node.channel}};
                node.plate.send(obj, (reply) => {
                    node.milliamps = reply.milliamps;
                    node.status({text: node.milliamps + ' mA'});
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
