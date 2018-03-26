module.exports = function (RED) {
    function TEMPNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        node.plate = RED.nodes.getNode(config.config_plate).plate;
        node.input = parseInt(config.input, 10);
        node.scale = config.scale;
        node.temp = 0;
        node.on('input', function (msg) {
            const obj = {cmd: "getTEMP", args: {bit: node.input, scale: node.scale}};
            node.plate.send(obj, (reply) => {
                node.temp = reply.temp;
                node.status({text: node.temp});
                node.send({payload: node.temp});
            });
        });

        this.on('close', function () {
            // cleanup goes here
        });
    }
    RED.nodes.registerType("ppTEMP", TEMPNode);
}
