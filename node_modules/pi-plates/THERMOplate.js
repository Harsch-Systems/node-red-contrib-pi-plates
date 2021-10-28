const BASEplate = require('./BASEplate');

class THERMOplate extends BASEplate {
    constructor (addr) {
        super(addr, "THERMO");
    }
}

module.exports = THERMOplate;
