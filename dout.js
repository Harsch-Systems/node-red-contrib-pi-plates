module.exports = function (RED) {
    function DOUTNode(config) {
        RED.nodes.createNode(this, config);
        this.plate = RED.nodes.getNode(config.config_plate).plate;
        this.output = parseInt(config.output, 10);
        const verifier = {cmd: "VERIFY", args: {}};
        this.plate.send(verifier, (reply) => {
            var type = RED.nodes.getNode(config.config_plate).model;
            if (reply.state == 1 && ((type == "DAQCplate" || type == "DAQC2plate") && this.output < 7 || type == "TINKERplate" && this.output > 0)){
                this.status({fill: "green", shape: "ring", text: "plate validated"});
                this.verified = true;
                if (type == "TINKERplate"){
                    const conf = {cmd: "setOUT", args: {bit: this.output}};
                    this.plate.send(conf, (reply) => {});
                }
            }else{
                this.status({fill: "red", shape: "ring", text: "invalid plate or input"});
                this.verified = false;
            }
        });
        var node = this;
        node.on('input', function (msg) {
            if (node.verified){
                const obj = {args: {bit: node.output}};
                if (msg.payload == "on") {
                    obj['cmd'] = "setDOUTbit";
                } else if (msg.payload == "off") {
                    obj['cmd'] = "clrDOUTbit";
                } else if (msg.payload == "toggle") {
                    obj['cmd'] = "toggleDOUTbit";
                }
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
    RED.nodes.registerType("ppDOUT", DOUTNode);
}
