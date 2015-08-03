//demo-circuit
            var demo_resistor = {resistance_posterm: 100, resistance_negterm: 100}; 
            var demo_battery = {voltage: 15};
            var demo_led = {
                current_max: 0.10, //max current in amp
                turnonvoltage:2, 
                brightness_max: 200 
            }

            function Demo_test(demo_led, demo_resistor, demo_battery) {
                var led_brightness = 0; // led_brightness varies from 0 to 1. set to -1 if it's blowing up.
                var circuit_current = demo_battery.voltage/(demo_resistor.resistance_posterm + demo_resistor.resistance_negterm); 
                var circuit_voltage_drop = demo_battery.voltage - (demo_resistor.resistance_posterm * circuit_current);
                
                if (circuit_voltage_drop < demo_led.turnonvoltage) {
                    led_brightness = 0;

                } else if (circuit_current > demo_led.current_max) {
                    led_brightness = -1;
                    //break;
                } else {
                    led_brightness = circuit_current/demo_led.current_max; 
                }
                
                console.log("this is the led brightness", led_brightness);
            return led_brightness;    
            }
            Demo_test(demo_led, demo_resistor, demo_battery);