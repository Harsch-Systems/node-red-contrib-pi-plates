module.exports = function (RED) {
    function THERMONode(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        node.plate = RED.nodes.getNode(config.config_plate).plate;
        node.channel = parseInt(config.channel, 10);
        node.temperature = 0;
        const verifier = {cmd: "VERIFY", args: {}};
        this.plate.send(verifier, (reply) => {
            var type = RED.nodes.getNode(config.config_plate).model;
            if (reply.state == 1 && type == "THERMOplate"){
                node.status({fill: "green", shape: "ring", text: "plate validated"});
                node.verified = true;
            }else{
                node.status({fill: "red", shape: "ring", text: "invalid plate or input"});
                node.verified = false;
            }
        });
        node.on('input', function (msg) {
            if(node.verified){
                const cmd = node.channel==0 ? 'getCOLD' : 'getTEMP';
                const obj = {cmd: cmd, args: {channel: node.channel}};
                node.plate.send(obj, (reply) => {
                    node.temperature = reply.value;
                    node.status({text: node.temperature});
                    node.send({payload: node.temperature});
                });
            }else{
                throw "invalid plate or input";
            }
        });

        this.on('close', function () {
            // cleanup goes here
        });
    }
    RED.nodes.registerType("ppTHERMO", THERMONode);
}
