module.exports = function (RED) {
    function THERMONode(config) {
        RED.nodes.createNode(this, config);
        this.plate = RED.nodes.getNode(config.config_plate).plate;
        this.channel = parseInt(config.channel, 10);
        this.temperature = 0;
        if (config.scale) {
            this.scale = config.scale;
        } else {
            this.scale = 'c';
        }

        if (config.tc_type) {
            this.tc_type = config.tc_type;
        } else {
            this.tc_type = 'k';
        }

        if (this.channel >= 1 && this.channel <= 8 && this.tc_type == 'j') {
            let typeobj = {cmd: 'setTYPE', args: {channel: this.channel, tc_type: this.tc_type}};
            this.plate.send(typeobj, (reply) => {
                // thermocouple set to J-type
            });
        }

        var node = this;
        node.on('input', function (msg, send, done) {
            let type = RED.nodes.getNode(config.config_plate).model;
            let channelValid = (type == "THERMOplate");

            if (!node.plate.plate_status && channelValid) {
                const cmd = node.channel==0 ? 'getCOLD' : 'getTEMP';
                const obj = {cmd: cmd, args: {channel: node.channel, scale: node.scale}};
                node.plate.send(obj, (reply) => {
                    node.temperature = reply.value;
                    node.status({text: node.temperature});
                    msg.payload = node.temperature;
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
                node.status({fill: "red", shape: "ring", text: "invalid plate type"});
                node.log("invalid plate type");
            }
            if (done) {
                done();
            }
        });

        this.on('close', function () {
            // cleanup goes here
        });
    }
    RED.nodes.registerType("ppTHERMO", THERMONode);
}
