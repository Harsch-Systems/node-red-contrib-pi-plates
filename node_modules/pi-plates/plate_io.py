import sys
import json

# All Pi Plate communication must go through this one process to ensure
# SPI communications don't overlap / interfere and corrupt the device state(s)
#
# listen for json messages on stdin of the format:
# {
#   addr: <pi plate address 0-7>,
#   plate_type: <RELAY|DAQC>,
#   cmd: <command string>, args: {<command-specific args>}
# }

while True:
    try:
        line = sys.stdin.readline()
        # TODO: add error handling for invalid JSON
        msg = json.loads(line)
        addr = msg['addr']
        plate_type = msg['plate_type']
        cmd = msg['cmd']
        args = msg['args']
        resp = {}
        if (plate_type == "RELAY" or plate_type == "RELAY2"):
        # switch between RELAY and RELAY2 for their common API
            if (plate_type == "RELAY2"):
                import piplates.RELAYplate2 as RP2
                RP = RP2
            else:
                import piplates.RELAYplate as RP
                RP = RP
            if (cmd == "setLED"):
                RP.setLED(addr)
                resp['state'] = 1
            elif (cmd == "clrLED"):
                RP.clrLED(addr)
                resp['state'] = 0
            elif (cmd == "toggleLED"):
                RP.toggleLED(addr)
                resp['state'] = "UNKNOWN"
            elif (cmd == "getID"):
                resp['ID'] = RP.getID(addr)
            elif (cmd == "getHWrev"):
                resp['HWrev'] = RP.getHWrev(addr)
            elif (cmd == "getFWrev"):
                resp['FWrev'] = RP.getFWrev(addr)
            elif (cmd == "getPMrev"):
                resp['PMrev'] = RP.getPMrev()
            elif (cmd == "getADDR"):
                resp['ADDR'] = RP.getADDR(addr)
            elif ("relay" in cmd):
                relay = args['relay']
                if (cmd == "relayON"):
                    RP.relayON(addr, relay)
                elif (cmd == "relayOFF"):
                    RP.relayOFF(addr, relay)
                elif (cmd == "relayTOGGLE"):
                    RP.relayTOGGLE(addr, relay)
                state = RP.relaySTATE(addr)
                this_state = (state >> (relay - 1)) & 1
                resp['relay'] = relay
                resp['state'] = this_state
            elif (cmd == "RESET"):
                RP.RESET(addr)
                resp['RESET'] = "OK";
            elif (cmd == "VERIFY"):
                if(RP.getADDR(addr) == addr):
                    resp['state'] = 0
                else:
                    resp['state'] = 1
            elif (cmd == "ACTIVATE"):
                RP.relaysPresent[addr] = 1
                resp['state'] = 1
            else:
                sys.stderr.write("unknown relay cmd: " + cmd)
                break
            print(json.dumps(resp))
        elif (plate_type == "DAQC" or plate_type == "DAQC2"):
            # switch between DAQC and DAQC2 for their common API
            if (plate_type == "DAQC2"):
                import piplates.DAQC2plate as DP2
                PP = DP2
            else:
                import piplates.DAQCplate as DP
                PP = DP
            if (cmd == "getDINbit"):
                bit = args['bit']
                state = PP.getDINbit(addr, bit)
                resp['bit'] = bit
                resp['state'] = state
            elif (cmd == "setDOUTbit"):
                bit = args['bit']
                PP.setDOUTbit(addr, bit)
                resp['bit'] = bit
                resp['state'] = 1
            elif (cmd == "clrDOUTbit"):
                bit = args['bit']
                PP.clrDOUTbit(addr, bit)
                resp['bit'] = bit
                resp['state'] = 0
            elif (cmd == "toggleDOUTbit"):
                bit = args['bit']
                PP.toggleDOUTbit(addr, bit)
                resp['bit'] = bit
                resp['state'] = 'UNKNOWN'
            elif (cmd == "getADC"):
                channel = args['channel']
                voltage = PP.getADC(addr, channel)
                resp['channel'] = channel
                resp['voltage'] = voltage
            elif (cmd == "getADCall"):
                voltages = PP.getADCall(addr)
                resp['voltages'] = voltages
            elif (cmd == "getTEMP" and plate_type == "DAQC"):
                bit = args['bit']
                scale = args['scale']
                temp = PP.getTEMP(addr, bit, scale)
                resp['temp'] = temp
                resp['bit'] = bit
            elif (cmd == "getDAC"):
                channel = args['channel']
                value = PP.getDAC(addr, channel)
                resp['channel'] = channel
                resp['value'] = value
            elif (cmd == "setDAC"):
                channel = args['channel']
                value = args['value']
                PP.setDAC(addr, channel, value)
                resp['channel'] = channel
                resp['value'] = value
            elif (cmd == "getPWM"):
                channel = args['channel']
                value = PP.getPWM(addr, channel)
                resp['channel'] = channel
                resp['value'] = value
            elif (cmd == "setPWM"):
                channel = args['channel']
                value = args['value']
                PP.setPWM(addr, channel, value)
                resp['channel'] = channel
                resp['value'] = value
            elif (cmd == "calDAC"):
                PP.calDAC(addr)
            elif (cmd == "getFREQ" and plate_type == "DAQC2"):
                value = DP2.getFREQ(addr)
                resp['value'] = value
            elif (cmd == "setLED" and plate_type == "DAQC"):
                color = args['color']

                if color == 'off':
                    DP.clrLED(addr, 0)
                    DP.clrLED(addr, 1)
                elif color == 'red':
                    DP.setLED(addr, 0)
                    DP.clrLED(addr, 1)
                elif color == 'green':
                    DP.clrLED(addr, 0)
                    DP.setLED(addr, 1)
                elif color == 'yellow':
                    DP.setLED(addr, 0)
                    DP.setLED(addr, 1)
                else:
                    sys.stderr.write("unsupported LED color: " + color)

                resp['state'] = color
            elif (cmd == "setLED" and plate_type == "DAQC2"):
                color = args['color']

                if color in ['off','red','green','yellow','blue','magenta','cyan','white']:
                    DP2.setLED(addr, color)
                else:
                    sys.stderr.write("unsupported LED color: " + color)

                resp['state'] = color
            elif (cmd == "VERIFY" and plate_type == "DAQC"):
                #For some reason the DAQC plate's getADDR method adds 8 to the address.
                if(DP.getADDR(addr) - 8 == addr):
                    resp['state'] = 0
                else:
                    resp['state'] = 1
            elif (cmd == "VERIFY" and plate_type == "DAQC2"):
                if(DP2.getADDR(addr) == addr):
                    resp['state'] = 0
                else:
                    resp['state'] = 1
            elif (cmd == "ACTIVATE" and plate_type == "DAQC"):
                PP.daqcsPresent[addr] = 1
                PP.Vcc[addr] = PP.getADC(addr, 8)
                resp['state'] = 1
            elif (cmd == "ACTIVATE" and plate_type == "DAQC2"):
                PP.daqc2sPresent[addr] = 1
                PP.getCalVals(addr)
                resp['state'] = 1
            else:
                sys.stderr.write("unknown daqc(2) cmd: " + cmd)
            print(json.dumps(resp))
        elif (plate_type == "MOTOR"):
            break
        elif (plate_type == "THERMO"):
            import piplates.THERMOplate as TP
            if (cmd == "getTEMP"):
                channel = args['channel']
                value = TP.getTEMP(addr, channel)
                resp['channel'] = channel
                resp['value'] = value
            elif (cmd == "getCOLD"):
                value = TP.getCOLD(addr)
                resp['value'] = value
            elif (cmd == "setLED"):
                TP.setLED(addr)
                resp['state'] = 1
            elif (cmd == "clrLED"):
                TP.clrLED(addr)
                resp['state'] = 0
            elif (cmd == "toggleLED"):
                TP.toggleLED(addr)
                resp['state'] = TP.getLED(addr)
            elif (cmd == "VERIFY"):
                if(TP.getADDR(addr) == addr):
                    resp['state'] = 0
                else:
                    resp['state'] = 1
            elif (cmd == "ACTIVATE"):
                TP.THERMOsPresent[addr] = 1
                TP.getCalVals(addr)
                resp['state'] = 1
            else:
                sys.stderr.write("unknown or unimplemented thermo cmd: " + cmd)
            print(json.dumps(resp))
        elif (plate_type == "TINKER"):
            import piplates.TINKERplate as TINK
            if("relay" in cmd):
                relay = args['relay']
                if(cmd == "relayON"):
                    TINK.relayON(addr, relay)
                elif (cmd == "relayOFF"):
                    TINK.relayOFF(addr, relay)
                elif (cmd == "relayTOGGLE"):
                    TINK.relayTOGGLE(addr, relay)
                state = TINK.relaySTATE(addr, relay)
                resp['relay'] = relay
                resp['state'] = state
            elif("DOUT" in cmd):
                chan = args['bit']
                if(cmd == "setDOUTbit"):
                    TINK.setDOUT(addr, chan)
                    resp['state'] = 1
                elif(cmd == "clrDOUTbit"):
                    TINK.clrDOUT(addr, chan)
                    resp['state'] = 0
                elif(cmd == "toggleDOUTbit"):
                    TINK.toggleDOUT(addr, chan)
                    resp['state'] = 'UNKNOWN'
                resp['bit'] = chan
            elif(cmd == "getDINbit"):
                chan = args['bit']
                state = TINK.getDIN(addr, chan)
                resp['state'] = state
                resp['bit'] = chan
            elif(cmd == "getADC"):
                channel = args['channel']
                voltage = TINK.getADC(addr, channel)
                resp['channel'] = channel
                resp['voltage'] = voltage
            elif(cmd == "getTEMP"):
                bit = args['bit']
                scale = args['scale']
                temp = TINK.getTEMP(addr, bit, scale)
                resp['temp'] = temp
                resp['bit'] = bit
            elif (cmd == "setOUT"):
                chan = args['bit']
                TINK.setMODE(addr, chan, 'dout')
                resp['state'] = "out"
            elif (cmd == "setTEMP"):
                chan = args['bit']
                TINK.setMODE(addr, chan, 'temp')
                resp['state'] = "temp"
            elif (cmd == "setPWM"):
                channel = args['channel']
                value = args['value']
                TINK.setPWM(addr, channel, value)
                resp['channel'] = channel
                resp['value'] = value
            elif (cmd == "setPWMmode"):
                chan = args['bit']
                TINK.setMODE(addr, chan, 'pwm')
                resp['state'] = "pwm"                
            elif (cmd == "setIN"):
                chan = args['bit']
                TINK.setMODE(addr, chan, 'din')
                resp['state'] = "in"
            elif (cmd == "VERIFY"):
                if (TINK.getADDR(addr) == addr):
                    resp['state'] = 0
                else:
                    resp['state'] = 1
            elif (cmd == "ACTIVATE"):
                TINK.platesPresent[addr] = 1
                resp['state'] = 1
            else:
                sys.stderr.write("unknown or unimplemented tinker cmd: " + cmd)
            print(json.dumps(resp))
        else:
            sys.stderr.write("unknown plate_type: " + plate_type)
    except (EOFError, SystemExit, AssertionError):
        sys.exit(3)

