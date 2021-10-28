const BASEplate = require('./BASEplate');

class DAQC2plate extends BASEplate {
    constructor (addr) {
        super(addr, "DAQC2");
    }
}

module.exports = DAQC2plate;
