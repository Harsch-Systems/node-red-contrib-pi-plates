module.exports = function (RED) {
    function FREQNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        node.plate = RED.nodes.getNode(config.config_plate).plate;
        node.input = parseInt(config.input, 10);
        node.state = 0;
        node.on('input', function (msg) {
            const obj = {cmd: "getFREQ", args: {}};
            node.plate.send(obj, (reply) => {
                node.value = reply.value
                node.status({text: node.value});
                node.send({payload: node.value});
            });
        });

        this.on('close', function () {
            // cleanup goes here
        });
    }
    RED.nodes.registerType("ppFREQ", FREQNode);
}
