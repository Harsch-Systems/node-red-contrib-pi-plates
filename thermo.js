module.exports = function (RED) {
    function THERMONode(config) {
        RED.nodes.createNode(this, config);
        this.plate = RED.nodes.getNode(config.config_plate).plate;
        this.channel = parseInt(config.channel, 10);
        this.temperature = 0;

        var node = this;
        node.on('input', function (msg) {
            let type = RED.nodes.getNode(config.config_plate).model;
            let channelValid = (type == "THERMOplate");

            if (!node.plate.plate_status && channelValid) {
                const cmd = node.channel==0 ? 'getCOLD' : 'getTEMP';
                const obj = {cmd: cmd, args: {channel: node.channel}};
                node.plate.send(obj, (reply) => {
                    node.temperature = reply.value;
                    node.status({text: node.temperature});
                    node.send({payload: node.temperature});
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
            }else if (!channelValid){
                node.status({fill: "red", shape: "ring", text: "invalid plate type"});
                node.log("invalid plate type");
            }
        });

        this.on('close', function () {
            // cleanup goes here
        });
    }
    RED.nodes.registerType("ppTHERMO", THERMONode);
}
