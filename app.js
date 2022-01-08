const request = require('request');
const TelegramBot = require('node-telegram-bot-api');

// replace the value below with the Telegram token you receive from @BotFather
const token = '5045497484:AAE0HaBijIcRhHEbi5gCsgwvcGRIAgUiGYU';
const bot = new TelegramBot(token, {polling: true});

var xToken = "";


// http://123.123.123.123/onumgmt?form=base-info&port_id=2&onu_id=2
// http://123.123.123.123/onumgmt?form=optical-diagnose&port_id=2&onu_id=2

bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    request({
        url: "http://123.123.123.123/userlogin?form=login",
        method: "POST",
        json: true,
        body: {
            method: "set",
            param: {
                name: "root",
                key: "1761d487ba0cde5f285059b5cca9a22c",
                value: "YWRtaW4=",
                captcha_v: "",
                captcha_f: ""
            }
        }
    }, function (err, response, body) {
        if (xToken == "") {
            xToken = response.headers['x-token'];
        }
        request({
            url : "http://123.123.123.123/onutable",
            headers: {
                "X-Token": xToken
            }
        }, function (err, response, body){
            let onuTable = JSON.parse(body).data;
            let Found = true;
            Object.values(onuTable).find(function(val){
                if(val.macaddr === msg.text)
                {
                    // console.log(val);
                    request({
                        url: "http://123.123.123.123/onumgmt?form=optical-diagnose&port_id="+val.port_id+"&onu_id="+val.onu_id,
                        headers: {
                            "X-Token": xToken,
                        }
                    }, function (err, response, body) {
                        let opticalDiagnostic = JSON.parse(body).data;
                        request({
                            url: "http://123.123.123.123/onumgmt?form=base-info&port_id="+val.port_id+"&onu_id="+val.onu_id,
                            headers: {
                                "X-Token": xToken,
                            }
                        }, function (err, response, body) {
                            let data = JSON.parse(body).data;
                            var Message = "Mac Address : " + data.macaddr + "\nDistance :" + data.distance + "\nStatus :" + data.status + "\n Temperature :" + opticalDiagnostic.work_temprature + "\n Voltage :" + opticalDiagnostic.work_voltage + "\nTx Bias :" + opticalDiagnostic.transmit_bias + "\nTx Power :" + opticalDiagnostic.transmit_power + "\nRx Power :" + opticalDiagnostic.receive_power + "\n";
                            bot.sendMessage(chatId, Message);
                        });
                    });
                    Found = true;
                }
                else
                {
                    Found = false;
                }
            });
            if(Found)
            {
                bot.sendMessage(chatId, "Mac Address : " + msg.text + " Tidak ditemukan");
            }
        });
    });
    
});