module.exports = function (RED) {
    function PlateNode(config) {
        RED.nodes.createNode(this, config);
        this.address = config.address;
        this.type = config.type;
    }
    RED.nodes.registerType("pi_plate", PlateNode);
}
