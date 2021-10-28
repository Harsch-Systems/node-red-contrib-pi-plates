const BASEplate = require('./BASEplate');

class MOTORplate extends BASEplate {
    constructor (addr) {
        super(addr, "MOTOR");
    }
}

module.exports = MOTORplate;
