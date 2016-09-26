$(function () {
    var socket = io.connect()
    socket.on('led:change', function (data) {
        console.log(data)
    })

    socket.on('chart:data', function (data) {
        console.log(data)
    })

    $('#on').on('click', function () {
        socket.emit('led:on')
        console.log('clicked on')
    })

    $('#off').on('click', function () {
        socket.emit('led:off')
        console.log('clicked off')
    })

    $('#pulse').on('click', function () {
        socket.emit('led:pulse')
        console.log('clicked pulse')
    })
})
