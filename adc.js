module.exports = function (RED) {
    function ADCNode(config) {
        RED.nodes.createNode(this, config);
        this.plate = RED.nodes.getNode(config.config_plate).plate;
        this.channel = parseInt(config.channel, 10);
        this.voltage = 0;
        const verifier = {cmd: "VERIFY", args: {}};
        this.plate.send(verifier, (reply) => {
            var type = RED.nodes.getNode(config.config_plate).model;
            if(reply.state == 1 && ((type == "DAQCplate" || type == "DAQC2plate") || type == "TINKERplate" && this.channel > 0 && this.channel < 5)){
                this.status({fill: "green", shape: "ring", text: "plate validated"});
                this.verified = true;
            }else{
                this.status({fill: "red", shape: "ring", text: "invalid plate or input"});
                this.verified = false;
            }
        });
        var node = this;
        node.on('input', function (msg) {
            if(node.verified){
                const obj = {cmd: "getADC", args: {channel: node.channel}};
                node.plate.send(obj, (reply) => {
                    node.voltage = reply.voltage
                    node.status({text: node.voltage});
                    node.send({payload: node.voltage});
                });
            }else{
                //TODO: Handle invalid message
            }
        });

        this.on('close', function () {
            // cleanup goes here
        });
    }
    RED.nodes.registerType("ppADC", ADCNode);
}
