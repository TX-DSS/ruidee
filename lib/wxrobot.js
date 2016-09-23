var fs = require('fs');
var xml2js = require('xml2js');

function sendMsg(txcode, res) {
    var fileURL = './public/moosim/'+txcode+'.xml';
    fs.exists(fileURL, function(flag){
        if ( flag ) {
            //res.send(xml);
            var xml = fs.readFileSync(fileURL, 'utf-8');
            res.send(xml);
            console.log('response '+txcode+'.xml ok');
        } else {
            res.send('can not find '+txcode+'.xml');
        }
    })
}

exports.responseMsg = function(msg, res){

    var parser = new xml2js.Parser({explicitArray: false});

    parser.parseString(msg, function(err, result){
        //console.log(JSON.stringify(result));
        var txcode = "";
        if ( !!result && result.TX && result.TX.TX_HEADER ) {
            txcode = result.TX.TX_HEADER.SYS_TX_CODE;
        }
        if ( !!txcode ) {
            sendMsg(txcode, res);
        } else {
            res.send('illegal txcode');
        }
    });

};