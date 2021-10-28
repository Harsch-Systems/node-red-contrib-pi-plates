const BASEplate = require('./BASEplate');

class RELAYplate extends BASEplate {
    constructor (addr) {
        super(addr, "RELAY");
    }
}

module.exports = RELAYplate;
