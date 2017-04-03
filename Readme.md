# EmonLibJS

This is a fork of the OpenEnergyMonitor EmonLib, which includes a converted NodeJS version, built via Johnny-Five. Electricity monitoring library.

## Usage

1. In order to run NodeJS scripts and Johnny-Five on an Arduino board, you need to upload the Standard Firmata Sketch onto your board from the Arduino IDE Example Sketches menu.

2. Either clone or download this repository.

3. Ensure that you have NodeJS installed on your command line/command prompt. Ensure that your Arduino is plugged in, and fully wired according to the EmonLib Guide. Navigate to the EmonLib directory you just downloaded and run the EmonLib.js file in node.
```node EmonLib.js
```

4. The script should start running and presto! You should be getting readings of RMS voltage, RMS current, Real Power, Apparent Power, and Power Factor.

5. I added in some extra code to support an added relay on digital pin 8. To use, simply connect the relay to the Arduino pin 8, and type 'o' into the Node REPL while the script is running to 'open' the circuit, and 'c' into the Node REPL to 'close' the circuit.

*This script assumes that the input for the voltage will be analog pin 2 and the current will be analog pin 3. Furthermore, this script assumes an power supply voltage of 5V DC. There are several minor calibration steps that you can take for your particular set up, whatever it may be.*


If you want to change the input pins or voltage/current phase calibrations (EmonLib.js lines 61 - 76), edit the following code:
```board.on("ready", () => {

  voltage("A2", 126.48, 1.7);
  current("A1", 111.1);

  let _startV = new five.Sensor({
    pin: "A2",
    freq: 2001
  });

  let startV = 350;
  _startV.on("data", () => {
    startV = _startV.raw;
  })
  let _sampleV = new five.Sensor("A2");
  let _sampleI = new five.Sensor("A1");
```
The calcVI and interval settings, along with the REPL output can be customized by editing lines 143-147:
```  setInterval(() => {
    calcVI(20, 2000);
    console.log('vrms: ' + vrms + ' irms: ' + irms + ' realPower: ' + realPower + ' apparentPower: ' + apparentPower + ' power factor: ' + powerFactor);
  }, 2000)
});
```
The supply voltage can be changed by altering the supply voltage variable on line 4. It is measured in millivolts.
```const supplyVoltage = 5000;
```
Your preferences on the relay can be edited starting on line 134 with the pin:
```let pin = new five.Pin(8);
this.repl.inject({
  o: () => {
    pin.write(1);
  },
  c: () => {
    pin.write(0);
  }
})
```

### Original Readme
Arduino Energy Monitoring Library - compatible with Arduino 1.0
*****************************************************************

Designed for use with emonTx: http://openenergymonitor.org/emon/Modules

Download to Arduino IDE 'libraries' folder. Restart of IDE required.

Git Clone and Git Pull can be easily used to keep the library up-to-date and manage changes.
JeeLabs has done a good post on the topic: http://jeelabs.org/2011/12/29/out-with-the-old-in-with-the-new/



Update: 5th January 2014: Support Added for Arduino Due (ARM Cortex-M3, 12-bit ADC) by icboredman.

To enable this feature on Arduino Due, add the following statement to setup() function in main sketch:
analogReadResolution(ADC_BITS); This will set ADC_BITS to 12 (Arduino Due), EmonLib will otherwise default to 10 analogReadResolution(ADC_BITS);.
See blog post on using Arduino Due as energy monitor: http://boredomprojects.net/index.php/projects/home-energy-monitor
