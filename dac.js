module.exports = function (RED) {
    function DACNode(config) {
        RED.nodes.createNode(this, config);
        this.plate = RED.nodes.getNode(config.config_plate).plate;
        this.channel = parseInt(config.channel, 10);
        this.voltage = 0;
        const verifier = {cmd: "VERIFY", args: {}};
        this.plate.send(verifier, (reply) => {
            var type = RED.nodes.getNode(config.config_plate).model;
            if (reply.state == 1 && (type == "DAQCplate" && this.channel < 2 || type == "DAQC2plate")){
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
                if (typeof msg.payload == "number" &&
                    (msg.payload >= 0) &&
                    (msg.payload <= 4.095)) {
                    const obj = {cmd: "setDAC", args: {channel: node.channel, value: msg.payload}};
                    node.plate.send(obj, (reply) => {
                        node.value = reply.value;
                        //node.status({text: node.value});
                        node.send({payload: node.value});
                    });
                } else {
                    node.log("invalid DAC value: ignoring");
                }
            }else{
                node.log("invalid plate or input");
            }
        });

        this.on('close', function () {
            // cleanup goes here
        });
    }
    RED.nodes.registerType("ppDAC", DACNode);
}
