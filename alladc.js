module.exports = function (RED) {
    function AllADCNode(config) {
        RED.nodes.createNode(this, config);
        this.plate = RED.nodes.getNode(config.config_plate).plate;
        this.outputs = [8];

        var node = this;
        node.on('input', function (msg) {
            let type = RED.nodes.getNode(config.config_plate).model;
            /* DAQC/DAQC2 have 8 ADC inputs, TINKER has 4 */ 

            if (!node.plate.plate_status) {
                const obj = {cmd: "getADCall", args: {}};
                node.plate.send(obj, (reply) => {
                    for (let i = 0; i < reply.voltages.length; i++)
                        node.outputs[i] = { payload: reply.voltages[i] };

                    node.status({text: reply.voltages});
                    node.send(node.outputs);
                });
            }else if (node.plate.plate_status == 1) {
                node.status({fill: "red", shape: "ring", text: "invalid plate"});
                node.log("invalid plate");

                node.plate.update_status();
            }else if (node.plate.plate_status == 2) {
                node.status({fill: "red", shape: "ring", text: "missing python dependencies"});
                node.log("missing python dependencies");
            }else if (node.plate.plate_status == 3) {
                node.status({fill: "red", shape: "ring", text: "python process error"});
                node.log("python process error");
            }
        });

        this.on('close', function () {
            // cleanup goes here
        });
    }
    RED.nodes.registerType("ppAllADC", AllADCNode);
}
