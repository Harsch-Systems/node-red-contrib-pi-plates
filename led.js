module.exports = function (RED) {
    function LEDNode(config) {
        RED.nodes.createNode(this, config);
        this.plate = RED.nodes.getNode(config.config_plate).plate;

        var node = this;
        node.on('input', function (msg, send, done) {
            let commands = ['on', 'off', 'toggle'];
            let colors = ['red', 'green', 'yellow', 'blue', 'magenta',
                          'cyan', 'white'];

            let inputValid = (typeof msg.payload === 'string' &&
                              commands.includes(msg.payload) ||
                              colors.includes(msg.payload));

            if (!node.plate.plate_status && inputValid) {
                const obj = { cmd: '', args: {} };

                let color = null;
                if (colors.includes(msg.payload)) {
                    color = msg.payload;
                }

                switch (msg.payload) {
                    case 'on': {
                        obj.cmd = 'setLED';
                        break;
                    }
                    case 'off': {
                        obj.cmd = 'clrLED';
                        break;
                    }
                    case 'toggle': {
                        obj.cmd = 'toggleLED';
                        break;
                    }
                    default: {
                        if (color) {
                            obj.cmd = 'setLED';
                            obj.args.color = color;
                        }
                    }
                }
                if (obj.cmd != '') {
                    node.plate.send(obj, (reply) => {
                        node.state = reply.state;
                        node.status({ text: node.state });
                        msg.payload = node.state;
                        send(msg);
                    });
                }
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
            } else if (!inputValid) {
                node.status({fill: "red", shape: "ring", text: "invalid input"});
                node.log("invalid input");
            }
            if (done) {
                done();
            }
        });

        this.on('close', function () {
            // cleanup goes here
        });
    }
    RED.nodes.registerType("ppLED", LEDNode);
}
