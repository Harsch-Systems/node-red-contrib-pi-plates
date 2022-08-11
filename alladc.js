module.exports = function (RED) {
    function AllADCNode(config) {
        RED.nodes.createNode(this, config);
        this.config_node = RED.nodes.getNode(config.config_plate);
        this.plate = this.config_node.plate;
        this.plate_model = this.config_node.model
        if (this.plate_model == "DAQCplate" || this.plate_model == "DAQC2plate") {
            this.outputs = new Array(9);
        } else if (this.plate_model == "TINKERplate") {
            this.outputs = new Array(4);
        } else if (this.plate_model == "ADCplate") {
            this.outputs = new Array(16);
        }

        var node = this;
        node.on('input', function (msg) {
            /* DAQC/DAQC2 have 8+1(5VDC) ADC inputs, TINKER has 4, ADC has 16 */

            if (!node.plate.plate_status) {
                const obj = {cmd: "getADCall", args: {}};
                node.plate.send(obj, (reply) => {
                    for (let i = 0; i < reply.voltages.length; i++) {
                        node.outputs[i] = { payload: reply.voltages[i] };
                    }

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
