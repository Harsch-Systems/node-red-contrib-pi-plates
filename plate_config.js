const { RELAYplate, RELAYplate2, DAQCplate, DAQC2plate, MOTORplate,
        THERMOplate, TINKERplate, DIGIplate, ADCplate, CURRENTplate
      } = require('pi-plates');

module.exports = function (RED) {
    function PlateNode(config) {
        RED.nodes.createNode(this, config);
        var plate_cn = this;
        plate_cn.model = config.model;
        plate_cn.address = config.address;
        plate_cn.verified = false;
        plate_cn.ID = "";
        plate_cn.HWrev = "";
        plate_cn.FWrev = "";
        const addr = parseInt(this.address, 10);

        switch (this.model) {
            case "RELAYplate": {
                this.plate = new RELAYplate(addr);
                break;
            }
            case "RELAYplate2": {
                this.plate = new RELAYplate2(addr);
                break;
            }
            case "DAQCplate": {
                this.plate = new DAQCplate(addr);
                break;
            }
            case "DAQC2plate": {
                this.plate = new DAQC2plate(addr);
                break;
            }
            case "MOTORplate": {
                this.plate = new MOTORplate(addr);
                break;
            }
            case "THERMOplate": {
                this.plate = new THERMOplate(addr);
                break;
            }
            case "TINKERplate": {
                this.plate = new TINKERplate(addr);
                break;
            }
            case "DIGIplate": {
                this.plate = new DIGIplate(addr);
                break;
            }
            case "ADCplate": {
                this.plate = new ADCplate(addr);
                break;
            }
            case "CURRENTplate": {
                this.plate = new CURRENTplate(addr);
                break;
            }
            default: {
                this.error('incorrect plate specifier');
                break;
            }
            
            plate_cn.plate.send({cmd: 'VERIFY', args: {}}, (reply) => {
                if (reply.state == 0) {
                    plate_cn.verified = true;
                    plate_cn.plate.send({cmd: 'getID', args: {}}, (reply) => {
                        plate_cn.ID = reply.ID;
                    });
                    plate_cn.plate.send({cmd: 'getHWrev', args: {}}, (reply) => {
                        plate_cn.HWrev = reply.HWrev;
                    });
                    plate_cn.plate.send({cmd: 'getFWrev', args: {}}, (reply) => {
                        plate_cn.FWrev = reply.FWrev;
                    });
                } else {
                    plate_cn.verified = false;
                }
            });
        }
    }
    RED.nodes.registerType("pi_plate", PlateNode);
}
