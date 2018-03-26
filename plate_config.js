const { RELAYplate, DAQCplate, MOTORplate } = require('pi-plates');

module.exports = function (RED) {
    function PlateNode(config) {
        RED.nodes.createNode(this, config);
        this.model = config.model;
        this.address = config.address;
        const addr = parseInt(this.address, 10);

        switch (this.model) {
            case "RELAYplate":
                this.plate = new RELAYplate(1);
                break;
            case "DAQCplate":
                this.plate = new DAQCplate(addr);
                break;
            case "MOTORplate":
                this.plate = new MOTORplate(addr);
                break;
            default:
                this.error('incorrect plate specifier');
                break;
        }
    }
    RED.nodes.registerType("pi_plate", PlateNode);
}
