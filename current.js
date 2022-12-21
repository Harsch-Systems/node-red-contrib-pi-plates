module.exports = function (RED) {
    function CURRENTNode(config) {
        RED.nodes.createNode(this, config);
        let config_node = RED.nodes.getNode(config.config_plate);
        this.plate = config_node.plate;
        this.plate_model = config_node.model;
        this.channel = config.channel;
        this.milliamps = 0;

        var node = this;
        node.on('input', function (msg, send, done) {
            /* Valid CURRENTplate channels are 1 through 8 */
            /* Valid ADCplate channels are I0 through I3 */
            let channelValid = false;
            let channel_arg = null;
            let cmd_string = "";
            if ((node.plate_model == "CURRENTplate") &&
                typeof node.channel == "string") {
                channel_arg = parseInt(node.channel, 10);
                if (node.channel > 0 && node.channel < 9) {
                    channelValid = true;
                    cmd_string = "getI";
                }
            } else if ((node.plate_model == "ADCplate") &&
                       typeof node.channel == "string") {
                if (node.channel.match(/^I[0-3]/)) {
                    channelValid = true;
                    channel_arg = node.channel;
                    cmd_string = "getADC";
                }
            }

            if (!node.plate.plate_status && channelValid) {
                const obj = {cmd: cmd_string, args: {channel: channel_arg}};
                node.plate.send(obj, (reply) => {
                    node.milliamps = reply.milliamps;
                    node.status({text: node.milliamps + ' mA'});
                    msg.payload = node.milliamps;
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
    RED.nodes.registerType("ppCURRENT", CURRENTNode);
}
