const five = require("johnny-five");
const board = new five.Board();

const supplyVoltage = 5000;
const adc_counts = 1024;
let inPinV;
let vcal;
let phasecal;
let offsetV;
let inPinI;
let ical;
let offsetI;
let vrms;
let irms;
let realPower;
let apparentPower;
let powerFactor;

let voltage = (_inPinV, _vcal, _phasecal) => {
  inPinV = _inPinV;
  vcal = _vcal;
  phasecal = _phasecal;
  offsetV = adc_counts >> 2;
}
let current = (_inPinI, _ical) => {
  inPinI = _inPinI;
  ical = _ical;
  offsetI = adc_counts >> 2;
}

board.on("ready", () => {

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

  let calcVI = (crossings, timeout) => {
    let crossCount = 0;
    let numberOfSamples = 0;
    let st = false;
    let start = new Date().getTime();
    let filteredV = 0;
    let lastFilteredV;
    let filteredI;
    let sqV;
    let sumV = 0;
    let sqI;
    let sumI = 0;
    let phaseShiftedV;
    let instP;
    let sumP = 0;
    let lastVCross;
    let checkVCross;

    while (st === false){
      if ((startV < (adc_counts * 0.55)) && (startV > (adc_counts * 0.45))){
        st = true;
      };
      let d = new Date().getTime();
      if ((d - start) > timeout){
        st = true;
      };
    };
    start = new Date().getTime();
    let d2 = new Date().getTime();
    let loopy = 1000000;
    while ((crossCount < crossings) && ((d2 - start) < timeout)){
      numberOfSamples++;
      lastFilteredV = filteredV;
      d2 = new Date().getTime();

      sampleV = _sampleV.value;
      sampleI = _sampleI.value;

      offsetV = offsetV + ((sampleV - offsetV)/1024);
      filteredV = sampleV - offsetV;
      offsetI = offsetI + ((sampleI - offsetI)/1024);
      filteredI = sampleI - offsetI;

      sqV = filteredV * filteredV;
      sumV += sqV;

      sqI = filteredI * filteredI;
      sumI += sqI;

      phaseShiftedV = lastFilteredV + phasecal * (filteredV - lastFilteredV);

      instP = phaseShiftedV * filteredI;
      sumP += instP;

      lastVCross = checkVCross;
      if (sampleV > startV){
        checkVCross = true;
      }else{
        checkVCross = false;
      };
      if (numberOfSamples === 1){
        lastVCross = checkVCross;
      };
      if (lastVCross != checkVCross){
        crossCount++;
      };
      loopy++;
      let yum = (sampleV + startV) * Math.floor(123.12345);
      yum += loopy;
    };
      let v_ratio = vcal * ((supplyVoltage / 1000.0) / adc_counts);
      vrms = v_ratio * Math.sqrt(sumV / numberOfSamples) * 5;
      vrms < 0.03 ? vrms = 0 : null;

      let i_ratio = ical * ((supplyVoltage / 1000.0) / adc_counts);
      irms = i_ratio * Math.sqrt(sumI / numberOfSamples);
      irms < 0.03 ? irms = 0 : null;

      realPower = v_ratio * i_ratio * sumP / numberOfSamples;
      apparentPower = vrms * irms;
      powerFactor = realPower / apparentPower;

      sumP = 0;
      sumI = 0;
      sumV = 0;
  };
let pin = new five.Pin(8);
this.repl.inject({
  o: () => {
    pin.write(1);
  },
  c: () => {
    pin.write(0);
  }
})
  setInterval(() => {
    calcVI(20, 2000);
    console.log('vrms: ' + vrms + ' irms: ' + irms + ' realPower: ' + realPower + ' apparentPower: ' + apparentPower + ' power factor: ' + powerFactor);
  }, 2000)
});
