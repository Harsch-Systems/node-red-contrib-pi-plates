var rpio = require('rpio');

const RELAYbaseADDR = 24;
const ppFRAME = 22;
const ppINT = 15;

rpio.init({gpiomem: false});
rpio.open(ppFRAME, rpio.OUTPUT, rpio.LOW);
rpio.msleep(1);

rpio.open(ppINT, rpio.INPUT, rpio.PULL_UP);

rpio.spiBegin();
rpio.spiChipSelect(1);


setInterval(function () {
	relayTOGGLE(0, 1);
}, 1000);


function relayTOGGLE(addr, relay) {
	ppCMDr(addr, 0x12, relay, 0, 0);
}

function ppCMDr(addr, cmd, param1, param2, bytes2return) {
	var res = [];
	var arg = [addr + RELAYbaseADDR, cmd, param1, param2];
	var buf = new Buffer(arg);
	rpio.write(ppFRAME, rpio.HIGH);
	rpio.spiSetClockDivider(500);
	rpio.spiWrite(buf, buf.length);
	if (bytes2return > 0) {
		rpio.usleep(1);
		var rxbuf = new Buffer(1);
		var txbuf = new Buffer([0x0]);
		for (var i = 0; i < bytes2return; i++) {
			rxbuf = rpio.spiTransfer(rxbuf, txbuf, txbuf.length);
			res.push(rxbuf[0]);
		}
	}
	rpio.msleep(1);
	rpio.write(ppFRAME, rpio.LOW);
	rpio.msleep(1);
	return (res);
}

