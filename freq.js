module.exports = function (RED) {
    function FREQNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        node.plate = RED.nodes.getNode(config.config_plate).plate;
        node.input = parseInt(config.input, 10);
        const verifier = {cmd: "VERIFY", args: {}};
        let python_status = node.plate.send(verifier, (reply) => {
            var type = RED.nodes.getNode(config.config_plate).model;
            if(reply.state == 1 && type == "DAQC2plate"){
                this.status({fill: "green", shape: "ring", text: "plate validated"});
                this.verified = true;
            }else{
                this.status({fill: "red", shape: "ring", text: "invalid plate or input"});
                this.verified = false;
            }
        });

        if (python_status){
            this.status({fill: "red", shape: "ring", text: "missing python dependencies"});
            this.verified = false;
        }

        node.state = 0;
        node.on('input', function (msg) {
            if (this.verified){
                const obj = {cmd: "getFREQ", args: {}};
                node.plate.send(obj, (reply) => {
                    node.value = reply.value
                    node.status({text: node.value});
                    node.send({payload: node.value});
                });
            }else if (!python_status){
                node.log("invalid plate or input");
            }else{
                node.log("missing python dependencies");
            }
        });

        this.on('close', function () {
            // cleanup goes here
        });
    }
    RED.nodes.registerType("ppFREQ", FREQNode);
}
