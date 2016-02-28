'use strict'

var five = require('johnny-five')
    , board = new five.Board()

board.on("ready", function() {
    var inches = 0, centimeters = 0

    console.log('MKR1000 is now ready!')

    var prox = new five.Proximity({
        controller: "GP2Y0A21YK",
        pin: "A1"
    })

    prox.on("change", function() {
        if(Math.abs(centimeters - this.cm) > 10) {
            logDistance(this.cm, this.in)
            //update new values
            centimeters = this.cm
            inches = this.in
        }
    })
})

function logDistance(centimeters, inches) {
    console.log("Proximity: ")
    console.log("  cm  : ", centimeters)
    console.log("  in  : ", inches)
    console.log("-----------------")
}