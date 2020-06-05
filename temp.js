module.exports = function (RED) {
    function TEMPNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        node.plate = RED.nodes.getNode(config.config_plate).plate;
        node.input = parseInt(config.input, 10);
        node.scale = config.scale;
        node.temp = 0;
        const verifier = {cmd: "VERIFY", args: {}};
        node.plate.send(verifier, (reply) => {
            var type = RED.nodes.getNode(config.config_plate).model;
            if (reply.state == 1 && (type == "DAQCplate" && node.input < 8 || type == "TINKERplate" && node.input > 0)){
                this.status({fill: "green", shape: "ring", text: "plate validated"});
                if (type == "TINKERplate"){
                    const conf = {cmd: "setIN", args: {bit: node.input}};
                    node.plate.send(conf, (reply) => {});
                }
                node.verified = true;
            }else{
                this.status({fill: "red", shape: "ring", text: "invalid plate or input"});
                node.verified = false;
            }
        });

        node.on('input', function (msg) {
            if (node.verified){
                const obj = {cmd: "getTEMP", args: {bit: node.input, scale: node.scale}};
                node.plate.send(obj, (reply) => {
                    node.temp = reply.temp;
                    node.status({text: node.temp});
                    node.send({payload: node.temp});
                });
            }else{
                node.log("invalid plate or input");
            }
        });

        this.on('close', function () {
            // cleanup goes here
        });
    }
    RED.nodes.registerType("ppTEMP", TEMPNode);
}
