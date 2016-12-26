#include <Adafruit_DotStar.h>
// Because conditional #includes don't work w/Arduino sketches...
//#include <SPI.h>         // COMMENT OUT THIS LINE FOR GEMMA OR TRINKET
#include <avr/power.h> // ENABLE THIS LINE FOR GEMMA OR TRINKET

#define NUMPIXELS 10 // Number of LEDs in strip

// Here's how to control the LEDs from any two pins:
#define DATAPIN    3
#define CLOCKPIN   4 
Adafruit_DotStar strip = Adafruit_DotStar(
  NUMPIXELS, DATAPIN, CLOCKPIN, DOTSTAR_BGR);

void setup() {

#if defined(__AVR_ATtiny85__) && (F_CPU == 16000000L)
  clock_prescale_set(clock_div_1); // Enable 16 MHz on Trinket
#endif
  strip.begin(); // Initialize pins for output
  strip.show();  // Turn all LEDs off ASAP
}

void loop() {
  strip.setPixelColor(4,0xe61919);
  strip.setPixelColor(1,0xe67f19);
  strip.setPixelColor(6,0x195de6);
  strip.setPixelColor(2,0x19e5e6);
  strip.setPixelColor(0,0xa119e6);
  strip.setPixelColor(5,0xe5e619);
  strip.setPixelColor(3,0xe619a1);
  strip.show(); 
}
