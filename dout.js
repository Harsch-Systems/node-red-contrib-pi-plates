module.exports = function (RED) {
    function DOUTNode(config) {
        RED.nodes.createNode(this, config);
        this.plate = RED.nodes.getNode(config.config_plate).plate;
        this.output = parseInt(config.output, 10);
        var node = this;
        node.on('input', function (msg) {
            const obj = {args: {bit: node.output}};
            if (msg.payload == "on") {
                obj['cmd'] = "setDOUTbit";
            } else if (msg.payload == "off") {
                obj['cmd'] = "clrDOUTbit";
            } else if (msg.payload == "toggle") {
                obj['cmd'] = "toggleDOUTbit";
            }
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
    RED.nodes.registerType("ppDOUT", DOUTNode);
}
