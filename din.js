 module.exports = function (RED) {
    function DINNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        node.plate = RED.nodes.getNode(config.config_plate).plate;
        node.input = parseInt(config.input, 10);
        const verifier = {cmd: "VERIFY", args: {}};
        this.plate.send(verifier, (reply) => {
            var type = RED.nodes.getNode(config.config_plate).model;
            if (reply.state == 1 && ((type == "DAQCplate" || type == "DAQC2plate") && node.input < 8 || type == "TINKERplate" && node.input > 0)){
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
        node.state = 0;
        node.on('input', function (msg) {
            if(node.verified){
                const obj = {cmd: "getDINbit", args: {bit: node.input}};
                node.plate.send(obj, (reply) => {
                    node.state = reply.state
                    node.status({text: node.state});
                    node.send({payload: node.state});
                });
            }else{
                throw "invalid plate or input";
            }
        });

        this.on('close', function () {
            // cleanup goes here
        });
    }
    RED.nodes.registerType("ppDIN", DINNode);
}
