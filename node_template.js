module.exports = function (RED) {
    function FooNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        node.on('input', function (msg) {
            //do something
            node.send(msg);
        });
    }
    RED.nodes.registerType("foo", FooNode);
}
