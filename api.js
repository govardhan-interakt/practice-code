const addressValidator = require('wallet-address-validator')

const rpc = require('./rpc');
const config = require('../config/index')


//create bitcoin address
exports.generateBitcoinAddress = function(req, res){
    //get coin stauts
    rpc.requestNode('getnewaddress', [])
    .then((data)=>{
        if(data){
            return res.status(200).json({status: true, data:{address: data, private: ''}, message:'wallet created successfully!'})
        }else{
            return res.status(200).json({status:false, data: null, message:'internal server error, please try again!'})
        }
    })
}



//send bitcoin transaction
exports.sendTransaction = function(req, res){
    //validate input params
    if(!req.body.to || req.body.to === undefined || req.body.to === null || typeof req.body.to == 'undefined'){
        return res.status(200).json({status: false, data: null, message: 'please provide receiver address!'})
    }
    if(!req.body.amount || req.body.amount === undefined || req.body.amount === null || typeof req.body.amount == 'undefined'){
        return res.status(200).json({status: false, data: null, message: 'please provide amount to transfer!'})
    }
    //validate receiver address
    var validAddress = addressValidator.validate(req.body.to, 'BTC', config.NETWORK)
    if(validAddress) {
        rpc.requestNode('getwalletinfo', [])
        .then(walletInfo=>{
            if(walletInfo.balance > req.body.amount){
                rpc.requestNode('walletpassphrase', [config.WALLET_PASSWORD, 25])
                    .then(d=>{
                        rpc.requestNode('sendtoaddress', [req.body.to, (req.body.amount).toFixed(8)])
                        .then(txid=>{
                            if(txid){
                                return res.status(200).json({status: true, data: txid, message: 'transaction sent successfully!'})
                            }else{
                                res.status(200).json({status:false, data: null, message: 'internal server error, please try again!!'})
                            }
                        })
                    })
            }else{
                res.status(200).json({status:false, data: null, message: 'insuffient funds in wallet, please try again!'})
            }
        })
    }else{
        res.status(200).json({status:false, data: null, message: 'invalid receiver address, please provide valid address!'})
    }
}

//get wallet balance
exports.getBalance = function(req, res){
    rpc.requestNode('getwalletinfo', [])
    .then(wallet=>{
        if(wallet){
            res.status(200).json({status:true, data: {BTC:wallet.balance}, message: 'success!'})
        }else{
            res.status(200).json({status:false, data: null, message: 'internal server error, please try again!'})
        }
    })
}
