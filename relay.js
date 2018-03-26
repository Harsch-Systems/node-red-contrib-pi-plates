module.exports = function (RED) {
    function RelayNode(config) {
        RED.nodes.createNode(this, config);
        this.plate = RED.nodes.getNode(config.config_plate).plate;
        this.relay = parseInt(config.relay, 10);
        this.state = "UNKNOWN";
        var node = this;
        node.on('input', function (msg) {
            const obj = {args: {relay: node.relay}};
            if (msg.payload == "on") {
                obj['cmd'] = "relayON";
            } else if (msg.payload == "off") {
                obj['cmd'] = "relayOFF";
            } else if (msg.payload == "toggle") {
                obj['cmd'] = "relayTOGGLE";
            }
            node.plate.send(obj, (reply) => {
                if (reply.state != node.state) {
                    node.state = reply.state
                    node.send({payload: node.state});
                }
                node.status({text: node.state});
            });
        });
    }
    RED.nodes.registerType("ppRelay", RelayNode);
}
