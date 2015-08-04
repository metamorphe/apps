//demo-circuit
            var demo_battery_1 = {voltage: 15}; //this should blow up the LED
            var demo_battery_2 = {voltage: 1}; //this should not turn on the LED
            var demo_battery_3 = {voltage:5}; //this should be juuuust right 

            var demo_trace_pos = {tracelength: 400, tracewidth: 2}; 
            var demo_trace_neg = {tracelength: 500, tracewidth: 2};
            var demo_material = {name: "copper", sheetresistance: 0.5};


            function calculateResistanceFromLength(material, trace){ //assuming the trace is uniform for now
                return {resistance: material.sheetresistance*trace.tracelength/trace.tracewidth};
            }

            var demo_led = {
                current_max: 0.10, //max current in amp
                turnonvoltage: 2, 
                brightness_max: 200 
            }

            var demo_resistance_pos = calculateResistanceFromLength(demo_material.copper, demo_trace_pos); //100 ohm
            var demo_resistance_neg = calculateResistanceFromLength(demo_material.copper, demo_trace_neg); //125 ohm

            function calculateLEDState(led, resistorePos, resistorNeg,  battery) {
                var led_brightness = 0; // led_brightness varies from 0 to 1. set to -1 if it's blowing up.
                var circuit_current = demo_battery.voltage/(demo_resistor.resistance_posterm + demo_resistor.resistance_negterm); 
                var circuit_voltage_drop = demo_battery.voltage - (demo_resistor.resistance_posterm * circuit_current);
                
                if (circuit_voltage_drop < demo_led.turnonvoltage) {
                    led_brightness = 0;
                } else if (circuit_current > demo_led.current_max) {
                    led_brightness = -1;
                } else {
                    led_brightness = circuit_current/demo_led.current_max; 
                }
                
                console.log("this is the led brightness", led_brightness);
            return led_brightness;     
            }

            calculateLEDState(demo_led, deom_resistance_pos, demo_resistance_neg, demo_battery_1);
            calculateLEDState(demo_led, deom_resistance_pos, demo_resistance_neg, demo_battery_2);
            calculateLEDState(demo_led, deom_resistance_pos, demo_resistance_neg, demo_battery_3);
