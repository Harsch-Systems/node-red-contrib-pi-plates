module.exports = function (RED) {
    function DINNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        node.plate = RED.nodes.getNode(config.config_plate).plate;
        node.input = parseInt(config.input, 10);
        node.state = 0;
        node.on('input', function (msg) {
            const obj = {cmd: "getDINbit", args: {bit: node.input}};
            node.plate.send(obj, (reply) => {
                node.state = reply.state
                node.status({text: node.state});
                node.send({payload: node.state});
            });
        });

        this.on('close', function () {
            // cleanup goes here
        });
    }
    RED.nodes.registerType("ppDIN", DINNode);
}
