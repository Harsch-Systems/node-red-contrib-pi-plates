const BASEplate = require('./BASEplate');

class DAQCplate extends BASEplate {
    constructor (addr) {
        super(addr, "DAQC");
    }
}

module.exports = DAQCplate;
