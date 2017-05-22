var rpio = require('rpio');

module.exports = function (RED) {
    function RelayNode(config) {
        RED.nodes.createNode(this, config);
        this.plate = RED.nodes.getNode(config.plate);
        var node = this;
        node.on('input', function (msg) {
            //do something
            node.debug('relay');
            //node.send(msg);
        });
    }
    RED.nodes.registerType("ppRelay", RelayNode);
}
