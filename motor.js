module.exports = function (RED) {
    function MotorNode(config) {
        RED.nodes.createNode(this, config);
        this.plate = RED.nodes.getNode(config.config_plate).plate;
        this.motor = parseInt(config.motor, 10);
        this.state = "UNKNOWN";

        var node = this;
        node.on('input', function (msg) {
            let type = RED.nodes.getNode(config.config_plate).model;
            /*
            let validInputs = ["start", "stop", "speed"];
            let inputValid = (typeof msg.payload === 'string' && validInputs.includes(msg.payload) ||
                typeof msg.payload === 'object');
            */
            //  if (!node.plate.plate_status && relayValid && inputValid){
            if (true) {
                const obj = {args: {motor: node.motor}};
                if (msg.payload == "start") {
                    obj['cmd'] = "dcSTART";
                } else if (msg.payload == "stop") {
                    obj['cmd'] = "dcSTOP";
                } else if (typeof msg.payload === 'object' && Object.keys(msg.payload).includes("speed")) {
                    obj['cmd'] = "dcSPEED";
                    obj['args'].speed = msg.payload.speed;
                }

                if (Object.keys(obj).includes('cmd')) {
                    node.plate.send(obj, (reply) => {});
                } else {
                    node.log("malformed obj, missing 'cmd'");
                }

                /*
                    if (reply.state != node.state) {
                        node.state = reply.state
                        node.send({payload: node.state});
                    }
                    node.status({text: node.state});
            */
            } else if (node.plate.plate_status == 1) {
                node.status({fill: "red", shape: "ring", text: "invalid plate"});
                node.log("invalid plate");

                node.plate.update_status();
            } else if (node.plate.plate_status == 2) {
                node.status({fill: "red", shape: "ring", text: "missing python dependencies"});
                node.log("missing python dependencies");
            } else if (node.plate.plate_status == 3) {
                node.status({fill: "red", shape: "ring", text: "python process error"});
                node.log("python process error");
            } else if (!relayValid) {
                node.status({fill: "red", shape: "ring", text: "invalid relay"});
                node.log("invalid relay");
            } else if (!inputValid) {
                node.status({fill: "red", shape: "ring", text: "invalid input"});
                node.log("invalid input");
            }
        });
    }
    RED.nodes.registerType("ppMotor", MotorNode);
}
