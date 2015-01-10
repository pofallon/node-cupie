
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var machina = require('machina');
var bufferEqual = require('buffer-equal');
var FrameBuilder = require('./framebuilder');

util.inherits(Connection,EventEmitter);

function Connection(socket) {

    var conn = this;

    conn.socket = socket;

    var version = new Buffer(8);
    version.write('AMQP');
    version.writeUInt32BE(0x00010000, 4);

    var frame = new FrameBuilder();

    conn.socket.on('data', function(buf) {
        fsm.handle('parseData', buf);
    });

    var writeVersion = function() {
        conn.socket.write(version, function() {
            fsm.handle('versionWritten');
        });
    };

    var verifyVersion = function(buf) {
        return(bufferEqual(version,buf));
    };

    var fsm = new machina.Fsm({

        initialState: 'START',

        states : {

            'START': {
                _onEnter: function() {
                    writeVersion();
                },
                'versionWritten': function() {
                    this.transition('HDR_SENT');
                },
                'parseData': function(buf) {
                    if (verifyVersion(buf)) {
                        this.transition('HDR_RCVD');
                    }
                }
            },

            'HDR_SENT': {
                'parseData': function(buf) {
                    if (verifyVersion(buf)) {
                        this.transition('HDR_EXCH');
                    } else {
                        console.log("Error validationg version!");
                        console.log("Expected:");
                        console.log(version);
                        console.log("Received:");
                        console.log(buf);
                    }
                }
            },

            'HDR_RCVD': {
                _onEnter: function() {
                    writeVersion();
                },
                'versionWritten': function() {
                    this.transition('HDR_EXCH');
                }
            },

            'HDR_EXCH': {
                _onEnter: function() {
                    conn.emit("connect");
                },
                'parseData': function(buf) {
                    console.log("In HDR_EXCH with data: " + buf);
                }
            }

        }

    });

}

module.exports = Connection;