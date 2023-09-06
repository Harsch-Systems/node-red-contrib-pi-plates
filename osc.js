module.exports = function (RED) {
    function OSCNode(config) {
        RED.nodes.createNode(this, config);
        this.plate = RED.nodes.getNode(config.config_plate).plate;
        this.channel1 = config.channel1;
        this.channel2 = config.channel2;
        this.rate = parseInt(config.rate, 10);
        this.triggerType = config.triggerType;
        this.triggerEdge = config.triggerEdge;
        this.triggerLevel = parseFloat(config.triggerLevel);
        this.triggerLevel = 2048 * (1 + this.triggerLevel / 12);
        this.triggerLevel = ~~this.triggerLevel;
        this.triggerManual = config.triggerManual;
        this.triggerChannel = parseInt(config.triggerChannel);

        this.state = 0;

        var node = this;
        node.on('input', function (msg) {
            let type = RED.nodes.getNode(config.config_plate).model;
            let channelValid = (type == "DAQC2plate");

            if (!node.plate.plate_status && channelValid) {
                const obj = {cmd: "getOSCtraces", args: {
                    channel1: node.channel1,
                    channel2: node.channel2,
                    rate: node.rate,
                    triggerType: node.triggerType,
                    triggerEdge: node.triggerEdge,
                    triggerLevel: node.triggerLevel,
                    triggerManual: node.triggerManual,
                    triggerChannel: node.triggerChannel
                }};
                node.plate.send(obj, (reply) => {

                    payload = {};

                    if (node.channel1)
                    {
                        node.trace1 = reply.trace1;
                        payload.trace1 = node.trace1;
                    }

                    if (node.channel2)
                    {
                        node.trace2 = reply.trace2;
                        payload.trace2 = node.trace2;
                    }

                    node.status({text: 'received'});
                    node.send({ payload: payload });
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
    RED.nodes.registerType("ppOSC", OSCNode);
}