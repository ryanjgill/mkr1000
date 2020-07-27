'use strict'

let net = require('net')
let five = require('johnny-five')
let firmata = require('firmata')

// set options to match Firmata config for wifi
// using mkr1000 with WiFi101
// currently using static ip
let options = {
    host: '192.168.86.63',
    port: 3030
}


function blinkLed(led, duration) {
    led.blink()
    setTimeout(function () {
        led.stop().off()
    }, duration)
}

module.exports = net.connect(options, function() { //'connect' listener
    console.log('connected to server!')

    let socketClient = this

    //we can use the socketClient instead of a serial port as our transport
    let io = new firmata.Board(socketClient)

    io.once('ready', function(){
        console.log('io ready')
        io.isReady = true

        let board = new five.Board({io: io, repl: true})

        board.on('ready', function(){
            //Full Johnny-Five support here
            console.log('five ready')

            var led = new five.Led(6)

            setInterval(function () {
                blinkLed(led, 2000)
            }, 4000)


        })
    })

})