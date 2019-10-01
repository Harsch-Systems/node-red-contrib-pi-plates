module.exports = function (RED) {
    function THERMONode(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        node.plate = RED.nodes.getNode(config.config_plate).plate;
        node.channel = parseInt(config.channel, 10);
        node.temperature = 0;
        node.on('input', function (msg) {
            const cmd = node.channel==0 ? 'getCOLD' : 'getTEMP';
            const obj = {cmd: cmd, args: {channel: node.channel}};
            node.plate.send(obj, (reply) => {
                node.temperature = reply.value;
                node.status({text: node.temperature});
                node.send({payload: node.temperature});
            });
        });

        this.on('close', function () {
            // cleanup goes here
        });
    }
    RED.nodes.registerType("ppTHERMO", THERMONode);
}
