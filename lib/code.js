var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var EasyCheers;
(function (EasyCheers) {
    class Main {
        constructor() {
            Main.randNumber = parseInt((Math.random() * 10000000).toString());
            this.reset(0);
            Main.update_timeout_max = 5000;
            Main.update_timeout_min = 300;
            Main.heightChangedCallback = null;
            Main.newWallet = new ThinNeo.nep6wallet();
            Main.oldBlock = new EasyCheers.tools.SessionStoreTool("block");
            this.neoasset = new EasyCheers.NeoAsset();
            this.neoasset.gas = 0;
            this.neoasset.neo = 0;
            this.neoasset.claim = '';
            this.balances = new Array();
            this.ectBalance = 0;
            Neo.Cryptography.RandomNumberGenerator.startCollectors();
        }
        reset(type = 0) {
            this.clearTimer();
        }
        clearTimer() {
            if (Main.s_update) {
                clearTimeout(Main.s_update);
                this.update();
            }
        }
        setHeightChangedCallback(callback) {
            Main.heightChangedCallback = callback;
        }
        createWallet(passwd, callback, name = 'NeoWallet') {
            console.log("[Easy]", '[SDK]', 'Create ...');
            var array = new Uint8Array(32);
            var key = Neo.Cryptography.RandomNumberGenerator.getRandomValues(array);
            var pubkey = ThinNeo.Helper.GetPublicKeyFromPrivateKey(key);
            var addr = ThinNeo.Helper.GetAddressFromPublicKey(pubkey);
            console.log(pubkey);
            console.log(addr);
            Main.newWallet.scrypt = new ThinNeo.nep6ScryptParameters();
            Main.newWallet.scrypt.N = 16384;
            Main.newWallet.scrypt.r = 8;
            Main.newWallet.scrypt.p = 8;
            Main.newWallet.accounts = [];
            Main.newWallet.accounts[0] = new ThinNeo.nep6account();
            Main.newWallet.accounts[0].address = addr;
            ThinNeo.Helper.GetNep2FromPrivateKey(key, passwd, Main.newWallet.scrypt.N, Main.newWallet.scrypt.r, Main.newWallet.scrypt.p, (info, result) => {
                if (info == "finish") {
                    Main.newWallet.accounts[0].nep2key = result;
                    Main.newWallet.accounts[0].contract = new ThinNeo.contract();
                    var pubkey = ThinNeo.Helper.GetPublicKeyFromPrivateKey(key);
                    Main.newWallet.accounts[0].contract.script = ThinNeo.Helper.GetAddressCheckScriptFromPublicKey(pubkey).toHexString();
                    var jsonstr = JSON.stringify(Main.newWallet.toJson());
                    var blob = new Blob([ThinNeo.Helper.String2Bytes(jsonstr)]);
                    Main.download_href = URL.createObjectURL(blob);
                    Main.download_name = name + ".json";
                    console.log("[Easy]", '[SDK]', 'Create Done');
                    var wif = ThinNeo.Helper.GetWifFromPrivateKey(key);
                    if (callback)
                        callback(result, wif);
                }
            });
        }
        login(passwd, walletStr) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log("[Easy]", '[SDK]', 'File Login ...');
                Main.newWallet.fromJsonStr(walletStr);
                if (!!Main.newWallet.accounts) {
                    try {
                        let loginarray = yield EasyCheers.tools.neotool.nep6Load(Main.newWallet, passwd);
                        let data = {};
                        data.type = EasyCheers.LoginType.nep6;
                        data.msg = {};
                        Main.newWallet.accounts.map(account => {
                            data["msg"][account.address] = account.nep2key;
                        });
                        EasyCheers.LoginInfo.info = loginarray[Main.newWallet.accounts[0].address];
                        console.log(loginarray);
                        sessionStorage.setItem('login-info-arr', JSON.stringify(data));
                        EasyCheers.LoginInfo.setCurrentAddress(Main.newWallet.accounts[0].address);
                        console.log("login succ:", Main.newWallet.accounts[0].address);
                        console.log(Main.newWallet);
                        Main.is_logined = true;
                        this.update();
                        yield this.getBalances();
                    }
                    catch (error) {
                        console.error("load wallet error");
                    }
                }
            });
        }
        loginWif(awif, callback) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log("[Easy]", '[SDK]', 'wif Login ...');
                var res = EasyCheers.tools.neotool.wifDecode(awif);
                if (res.err) {
                    console.log("wif login err");
                    if (callback)
                        callback(false);
                }
                else {
                    var login = res.info;
                    EasyCheers.LoginInfo.info = res.info;
                    let data = {};
                    data.type = EasyCheers.LoginType.wif;
                    data.msg = { wif: awif };
                    sessionStorage.setItem('login-info-arr', JSON.stringify(data));
                    EasyCheers.LoginInfo.setCurrentAddress(login.address);
                    Main.is_logined = true;
                    this.update();
                    yield this.getBalances();
                    if (callback)
                        callback(true);
                }
            });
        }
        loginNep2(nep2, passwd, callback) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log("[Easy]", '[SDK]', 'nep2 Login ...');
                var res = yield EasyCheers.tools.neotool.nep2ToWif(nep2, passwd);
                if (res.err) {
                    console.log("nep2 login err");
                    if (callback)
                        callback(false);
                }
                else {
                    var login = res.info;
                    EasyCheers.LoginInfo.info = res.info;
                    let data = {};
                    data.type = EasyCheers.LoginType.nep2;
                    data.msg = {};
                    data.msg[login.address] = nep2;
                    sessionStorage.setItem('login-info-arr', JSON.stringify(data));
                    EasyCheers.LoginInfo.setCurrentAddress(login.address);
                    Main.is_logined = true;
                    this.update();
                    yield this.getBalances();
                    if (callback)
                        callback(true);
                }
            });
        }
        interGetHeight() {
            return __awaiter(this, void 0, void 0, function* () {
                var height = yield EasyCheers.tools.WWW.api_getHeight();
                return height;
            });
        }
        setHeight(height) {
            Main.oldBlock.put("height", height);
        }
        getHeight() {
            return Main.oldBlock.select("height");
        }
        getBalances() {
            return __awaiter(this, void 0, void 0, function* () {
                let cur_addr = EasyCheers.LoginInfo.getCurrentAddress();
                EasyCheers.tools.CoinTool.initAllAsset();
                var balances = yield EasyCheers.tools.WWW.api_getBalance(cur_addr);
                var claims = yield EasyCheers.tools.WWW.api_getclaimgas(cur_addr, 0);
                var claims2 = yield EasyCheers.tools.WWW.api_getclaimgas(cur_addr, 1);
                var nep5balances = yield EasyCheers.tools.WWW.api_getnep5Balance(cur_addr);
                let height = yield EasyCheers.tools.WWW.api_getHeight();
                if (balances) {
                    let sum1 = Neo.Fixed8.parse(claims["gas"].toFixed(8));
                    let sum2 = Neo.Fixed8.parse(claims2["gas"].toFixed(8));
                    let sum = sum1.add(sum2).toString();
                    this.neoasset.claim = sum;
                    balances.forEach(balance => {
                        if (balance.asset == EasyCheers.tools.CoinTool.id_NEO) {
                            this.neoasset.neo = balance.balance;
                        }
                        if (balance.asset == EasyCheers.tools.CoinTool.id_GAS) {
                            this.neoasset.gas = balance.balance;
                        }
                    });
                }
                if (nep5balances) {
                    const ect = '0x' + EasyCheers.tools.CoinTool.id_ECT.toString();
                    console.log("Keys:", ect);
                    Object.keys(nep5balances).filter((keys) => {
                        if (nep5balances[keys].assetId == ect) {
                            this.ectBalance = nep5balances[keys].balance;
                            return true;
                        }
                        return false;
                    });
                }
                this.balances = yield EasyCheers.BalanceInfo.getBalancesByArr(balances, nep5balances, height);
                console.log("[Easy]", '[main]', 'getBalances ...', this.getNeo(), '  ', this.getGas(), '  ', this.getEct());
            });
        }
        getNeo() {
            return this.neoasset.neo;
        }
        getGas() {
            return this.neoasset.gas;
        }
        getEct() {
            return this.ectBalance;
        }
        isLogined() {
            return Main.is_logined;
        }
        logoutCallback() {
            return __awaiter(this, void 0, void 0, function* () {
                this.reset(0);
                window.history.back();
            });
        }
        update() {
            return __awaiter(this, void 0, void 0, function* () {
                var timeout = Main.update_timeout_min;
                if (Main.is_logined) {
                    timeout = Main.update_timeout_max;
                }
                let height = yield this.interGetHeight();
                console.log("[Easy]", '[main]', 'update ...', timeout, '  ', height);
                let oldHeight = this.getHeight();
                if (oldHeight) {
                    if (height > oldHeight) {
                        this.setHeight(height);
                        if (Main.heightChangedCallback)
                            Main.heightChangedCallback();
                    }
                }
                else {
                    this.setHeight(height);
                }
                Main.s_update = setTimeout(() => { this.update(); }, timeout);
            });
        }
        static getUrlParam(name) {
            var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
            var r = window.location.search.substr(1).match(reg);
            if (r != null) {
                return unescape(r[2]);
            }
            return null;
        }
        static isWalletOpen() {
            if (Main.is_logined) {
                return true;
            }
            return false;
        }
        static getDate(timeString) {
            if (timeString != "0" && timeString != "") {
                var date = new Date(parseInt(timeString) * 1000);
                var fmt = "yyyy-MM-dd hh:mm:ss";
                var o = {
                    "M+": date.getMonth() + 1,
                    "d+": date.getDate(),
                    "h+": date.getHours(),
                    "m+": date.getMinutes(),
                    "s+": date.getSeconds(),
                    "q+": Math.floor((date.getMonth() + 3) / 3),
                    S: date.getMilliseconds()
                };
                if (/(y+)/.test(fmt))
                    fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
                for (var k in o)
                    if (new RegExp("(" + k + ")").test(fmt))
                        fmt = fmt.replace(RegExp.$1, RegExp.$1.length == 1
                            ? o[k]
                            : ("00" + o[k]).substr(("" + o[k]).length));
                return fmt;
            }
            return "";
        }
        static getObjectClass(obj) {
            if (obj && obj.constructor && obj.constructor.toString()) {
                if (obj.constructor.name) {
                    return obj.constructor.name;
                }
                var str = obj.constructor.toString();
                if (str.charAt(0) == '[') {
                    var arr = str.match(/\[\w+\s*(\w+)\]/);
                }
                else {
                    var arr = str.match(/function\s*(\w+)/);
                }
                if (arr && arr.length == 2) {
                    return arr[1];
                }
            }
            return undefined;
        }
        ;
        static getStringNumber(num) {
            let num_str = num.toString();
            if (num_str.indexOf('-') >= 0) {
                num_str = '0' + (num + 1).toString().substr(1);
            }
            return num_str;
        }
        static randomSort(arr, newArr) {
            if (arr.length == 1) {
                newArr.push(arr[0]);
                return newArr;
            }
            var random = Math.ceil(Math.random() * arr.length) - 1;
            newArr.push(arr[random]);
            arr.splice(random, 1);
            return Main.randomSort(arr, newArr);
        }
        static check() {
            var dev = "";
            if ((navigator.userAgent.match(/(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i))) {
                dev = "mobile";
            }
            else {
                dev = "pc";
            }
            return dev;
        }
        static in_array(search, array) {
            for (let k = 0; k < array.length; k++) {
                if (array[k] == search) {
                    return true;
                }
            }
            return false;
        }
    }
    EasyCheers.Main = Main;
})(EasyCheers || (EasyCheers = {}));
var EasyCheers;
(function (EasyCheers) {
    var tools;
    (function (tools) {
        class CoinTool {
            static initAllAsset() {
                return __awaiter(this, void 0, void 0, function* () {
                    var allassets = yield tools.WWW.api_getAllAssets();
                    for (var a in allassets) {
                        var asset = allassets[a];
                        var names = asset.name;
                        var id = asset.id;
                        var name = "";
                        if (id == CoinTool.id_GAS) {
                            name = "GAS";
                        }
                        else if (id == CoinTool.id_NEO) {
                            name = "NEO";
                        }
                        else if (id == CoinTool.id_SGAS.toString()) {
                            name = "CGAS";
                        }
                        else if (id == CoinTool.id_ECT.toString()) {
                            name = "ECT";
                        }
                        else {
                            for (var i in names) {
                                name = names[i].name;
                                if (names[i].lang == "en")
                                    break;
                            }
                        }
                        CoinTool.assetID2name[id] = name;
                        CoinTool.name2assetID[name] = id;
                    }
                });
            }
            static getassets() {
                return __awaiter(this, void 0, void 0, function* () {
                    var height = yield tools.WWW.api_getHeight();
                    var utxos = yield tools.WWW.api_getUTXO(tools.StorageTool.getStorage("current-address"));
                    var olds = EasyCheers.OldUTXO.getOldutxos();
                    var olds2 = new Array();
                    for (let n = 0; n < olds.length; n++) {
                        const old = olds[n];
                        let findutxo = false;
                        for (let i = 0; i < utxos.length; i++) {
                            let utxo = utxos[i];
                            if (utxo.txid == old.txid) {
                                console.log(old);
                                console.log(utxo);
                                console.log(height - old.height);
                            }
                            if (utxo.txid + "".includes(old.txid) && old.n == utxo.n && height - old.height < 3) {
                                findutxo = true;
                                utxos.splice(i, 1);
                            }
                        }
                        if (findutxo) {
                            olds2.push(old);
                        }
                    }
                    EasyCheers.OldUTXO.setOldutxos(olds2);
                    var assets = {};
                    for (var i in utxos) {
                        var item = utxos[i];
                        var asset = item.asset;
                        if (assets[asset] == undefined || assets[asset] == null) {
                            assets[asset] = [];
                        }
                        let utxo = new EasyCheers.UTXO();
                        utxo.addr = item.addr;
                        utxo.asset = item.asset;
                        utxo.n = item.n;
                        utxo.txid = item.txid;
                        utxo.count = Neo.Fixed8.parse(item.value);
                        assets[asset].push(utxo);
                    }
                    return assets;
                });
            }
            static makeTran(utxos, targetaddr, assetid, sendcount) {
                var res = new EasyCheers.Result();
                var us = utxos[assetid];
                var gasutxos = utxos[CoinTool.id_GAS];
                if (us == undefined) {
                    throw new Error("no enough money.");
                }
                var tran = new ThinNeo.Transaction();
                tran.type = ThinNeo.TransactionType.ContractTransaction;
                tran.version = 0;
                tran.extdata = null;
                tran.attributes = [];
                utxos[assetid].sort((a, b) => {
                    return b.count.compareTo(a.count);
                });
                var old = [];
                tran.outputs = [];
                tran.inputs = [];
                let payfee = EasyCheers.LoginInfo.info.payfee;
                let fee = Neo.Fixed8.parse('0.001');
                let sumcount = Neo.Fixed8.Zero;
                if (gasutxos) {
                    for (let i = 0; i < gasutxos.length; i++) {
                        sumcount.add(gasutxos[i].count);
                    }
                }
                if (gasutxos && CoinTool.id_GAS == assetid) {
                    let tranRes = this.creatInuptAndOutup(gasutxos, sendcount, targetaddr);
                    tran.inputs = tranRes.inputs;
                    tran.outputs = tranRes.outputs;
                    if (payfee && tran.outputs && tran.outputs.length > 1) {
                        tran.outputs[1].value = tran.outputs[1].value.subtract(fee);
                    }
                }
                else {
                    if (payfee && gasutxos) {
                        let feeRes = this.creatInuptAndOutup(gasutxos, fee);
                        tran.inputs = tran.inputs.concat(feeRes.inputs);
                        tran.outputs = tran.outputs.concat(feeRes.outputs);
                    }
                    let tranRes = this.creatInuptAndOutup(us, sendcount, targetaddr);
                    tran.inputs = tran.inputs.concat(tranRes.inputs);
                    tran.outputs = tran.outputs.concat(tranRes.outputs);
                }
                if (tran.witnesses == null)
                    tran.witnesses = [];
                for (const i in tran.inputs) {
                    const input = tran.inputs[i];
                    old.push(new EasyCheers.OldUTXO(input.hash.reverse().toHexString(), input.index));
                }
                res.err = false;
                res.info = { "tran": tran, "oldarr": old };
                return res;
            }
            static creatInuptAndOutup(utxos, sendcount, target) {
                let count = Neo.Fixed8.Zero;
                let res = {};
                res["inputs"] = [];
                res["outputs"] = [];
                res["oldutxo"] = [];
                let scraddr = "";
                let assetId;
                for (var i = 0; i < utxos.length; i++) {
                    var input = new ThinNeo.TransactionInput();
                    input.hash = utxos[i].txid.hexToBytes();
                    input.index = utxos[i].n;
                    input["_addr"] = utxos[i].addr;
                    res.inputs.push(input);
                    count = count.add(utxos[i].count);
                    scraddr = utxos[i].addr;
                    assetId = utxos[i].asset.hexToBytes().reverse();
                    let old = new EasyCheers.OldUTXO(utxos[i].txid, utxos[i].n);
                    res.oldutxo.push(old);
                    if (count.compareTo(sendcount) > 0) {
                        break;
                    }
                }
                if (count.compareTo(sendcount) >= 0) {
                    if (target) {
                        if (sendcount.compareTo(Neo.Fixed8.Zero) > 0) {
                            var output = new ThinNeo.TransactionOutput();
                            output.assetId = assetId;
                            output.value = sendcount;
                            output.toAddress = ThinNeo.Helper.GetPublicKeyScriptHash_FromAddress(target);
                            res.outputs.push(output);
                        }
                    }
                    let change = count.subtract(sendcount);
                    if (change.compareTo(Neo.Fixed8.Zero) > 0) {
                        var outputchange = new ThinNeo.TransactionOutput();
                        outputchange.toAddress = ThinNeo.Helper.GetPublicKeyScriptHash_FromAddress(scraddr);
                        outputchange.value = change;
                        outputchange.assetId = assetId;
                        res.outputs.push(outputchange);
                    }
                    return res;
                }
                else {
                    throw "You don't have enough utxo;";
                }
            }
            static signData(tran) {
                return __awaiter(this, void 0, void 0, function* () {
                    try {
                        let info = yield EasyCheers.LoginInfo.deblocking();
                        let addr = EasyCheers.LoginInfo.getCurrentAddress();
                        var msg = tran.GetMessage().clone();
                        var pubkey = info.pubkey.clone();
                        var prekey = info.prikey.clone();
                        var signdata = ThinNeo.Helper.Sign(msg, prekey);
                        tran.AddWitness(signdata, pubkey, addr);
                        var data = tran.GetRawData();
                        return data;
                    }
                    catch (error) {
                        throw "Signature interrupt";
                    }
                });
            }
            static rawTransaction(targetaddr, asset, count) {
                return __awaiter(this, void 0, void 0, function* () {
                    var _count = Neo.Fixed8.parse(count + "");
                    var utxos = yield CoinTool.getassets();
                    try {
                        var tranres = CoinTool.makeTran(utxos, targetaddr, asset, _count);
                        var tran = tranres.info['tran'];
                        if (tran.witnesses == null)
                            tran.witnesses = [];
                        let txid = tran.GetTxid();
                        let data;
                        var res = new EasyCheers.Result();
                        try {
                            data = yield this.signData(tran);
                            var height = yield tools.WWW.api_getHeight();
                            let olds = tranres.info['oldarr'];
                            olds.map(old => old.height = height);
                            EasyCheers.OldUTXO.oldutxosPush(olds);
                            var result = yield tools.WWW.api_postRawTransaction(data);
                            if (result["sendrawtransactionresult"]) {
                                res.err = !result;
                                res.info = txid;
                            }
                            return res;
                        }
                        catch (error) {
                            res.err = true;
                            res.info = txid;
                            return res;
                        }
                    }
                    catch (error) {
                        console.log("error  input");
                        throw error;
                    }
                });
            }
            static claimgas() {
                return __awaiter(this, void 0, void 0, function* () {
                    let claimtxhex = yield tools.WWW.api_getclaimtxhex(EasyCheers.LoginInfo.getCurrentAddress());
                    var tran = new ThinNeo.Transaction();
                    var buf = claimtxhex.hexToBytes();
                    tran.Deserialize(new Neo.IO.BinaryReader(new Neo.IO.MemoryStream(buf.buffer, 0, buf.byteLength)));
                    let data = yield this.signData(tran);
                    var result = yield tools.WWW.api_postRawTransaction(data);
                    return result;
                });
            }
            static claimGas() {
                return __awaiter(this, void 0, void 0, function* () {
                    var address = EasyCheers.LoginInfo.getCurrentAddress();
                    let claimsstr = yield tools.WWW.api_getclaimgas(address, 0);
                    let claims = claimsstr["claims"];
                    let sum = claimsstr["gas"].toFixed(8);
                    var tran = new ThinNeo.Transaction();
                    tran.type = ThinNeo.TransactionType.ClaimTransaction;
                    tran.version = 0;
                    tran.extdata = new ThinNeo.ClaimTransData();
                    tran.extdata.claims = [];
                    tran.attributes = [];
                    tran.inputs = [];
                    for (let i in claims) {
                        let claim = claims[i];
                        var input = new ThinNeo.TransactionInput();
                        input.hash = (claim.txid).hexToBytes().reverse();
                        input.index = claim.n;
                        input["_addr"] = claim.addr;
                        tran.extdata.claims.push(input);
                    }
                    var output = new ThinNeo.TransactionOutput();
                    output.assetId = (CoinTool.id_GAS).hexToBytes().reverse();
                    output.toAddress = ThinNeo.Helper.GetPublicKeyScriptHash_FromAddress(address);
                    output.value = Neo.Fixed8.parse(sum);
                    tran.outputs = [];
                    tran.outputs.push(output);
                    let data = yield this.signData(tran);
                    var result = yield tools.WWW.api_postRawTransaction(data);
                    result['amount'] = sum;
                    return result;
                });
            }
            static contractInvokeTrans(script) {
                return __awaiter(this, void 0, void 0, function* () {
                    var addr = EasyCheers.LoginInfo.getCurrentAddress();
                    let assetid = CoinTool.id_GAS;
                    var utxos = yield CoinTool.getassets();
                    let tranmsg = CoinTool.makeTran(utxos, addr, assetid, Neo.Fixed8.Zero);
                    let tran = tranmsg.info['tran'];
                    tran.type = ThinNeo.TransactionType.InvocationTransaction;
                    tran.extdata = new ThinNeo.InvokeTransData();
                    tran.extdata.script = script;
                    if (tran.witnesses == null)
                        tran.witnesses = [];
                    let data = yield this.signData(tran);
                    var res = new EasyCheers.Result();
                    var result = yield tools.WWW.api_postRawTransaction(data);
                    res.err = !result;
                    res.info = "成功";
                    return res;
                });
            }
            static nep5Transaction(address, tatgeraddr, asset, amount) {
                return __awaiter(this, void 0, void 0, function* () {
                    console.log(address);
                    console.log(tatgeraddr);
                    let res = yield tools.WWW.getNep5Asset(asset);
                    var decimals = res["decimals"];
                    let intv = amount.toFixed(decimals).replace(".", "");
                    console.log(intv);
                    var sb = new ThinNeo.ScriptBuilder();
                    var scriptaddress = asset.hexToBytes().reverse();
                    console.log(scriptaddress);
                    let random_uint8 = Neo.Cryptography.RandomNumberGenerator.getRandomValues(new Uint8Array(32));
                    let random_int = Neo.BigInteger.fromUint8Array(random_uint8);
                    sb.EmitPushNumber(random_int);
                    sb.Emit(ThinNeo.OpCode.DROP);
                    sb.EmitParamJson(["(address)" + address, "(address)" + tatgeraddr, "(integer)" + intv]);
                    sb.EmitPushString("transfer");
                    sb.EmitAppCall(scriptaddress);
                    var result = yield tools.Contract.contractInvokeTrans_attributes(sb.ToArray());
                    return result;
                });
            }
            static getavailableutxos(count) {
                return __awaiter(this, void 0, void 0, function* () {
                    let currentaddr = EasyCheers.LoginInfo.getCurrentAddress();
                    let utxos = yield tools.WWW.getavailableutxos(currentaddr, count);
                    var assets = {};
                    var addr = ThinNeo.Helper.GetAddressFromScriptHash(CoinTool.id_SGAS);
                    var asset = CoinTool.id_GAS;
                    assets[asset] = [];
                    for (var i in utxos) {
                        var item = utxos[i];
                        let utxo = new EasyCheers.UTXO();
                        utxo.addr = addr;
                        utxo.asset = asset;
                        utxo.n = item.n;
                        utxo.txid = item.txid;
                        utxo.count = Neo.Fixed8.parse(item.value);
                        assets[asset].push(utxo);
                    }
                    return assets;
                });
            }
            static bet(contractHash, address, max, odds) {
                return __awaiter(this, void 0, void 0, function* () {
                    console.log(address);
                    var sb = new ThinNeo.ScriptBuilder();
                    var scriptaddress = contractHash.hexToBytes().reverse();
                    let random_uint8 = Neo.Cryptography.RandomNumberGenerator.getRandomValues(new Uint8Array(32));
                    let random_int = Neo.BigInteger.fromUint8Array(random_uint8);
                    sb.EmitPushNumber(random_int);
                    sb.Emit(ThinNeo.OpCode.DROP);
                    sb.EmitParamJson(["(address)" + address, "(integer)" + max, "(integer)" + odds]);
                    sb.EmitPushString("bet");
                    sb.EmitAppCall(scriptaddress);
                    var result = yield tools.Contract.contractInvokeTrans_attributes(sb.ToArray());
                    return result;
                });
            }
        }
        CoinTool.id_GAS = "0x602c79718b16e442de58778e148d0b1084e3b2dffd5de6b7b16cee7969282de7";
        CoinTool.id_NEO = "0xc56f33fc6ecfcd0c225c4ab356fee59390af8560be0e930faebe74a6daff7c9b";
        CoinTool.id_SGAS = Neo.Uint160.parse('74f2dc36a68fdc4682034178eb2220729231db76');
        CoinTool.id_NNC = Neo.Uint160.parse('fc732edee1efdf968c23c20a9628eaa5a6ccb934');
        CoinTool.dapp_nnc = Neo.Uint160.parse("fc732edee1efdf968c23c20a9628eaa5a6ccb934");
        CoinTool.id_ECT = Neo.Uint160.parse('e41bf464feedae9409f19671a773860ceafcd300');
        CoinTool.assetID2name = {};
        CoinTool.name2assetID = {};
        tools.CoinTool = CoinTool;
    })(tools = EasyCheers.tools || (EasyCheers.tools = {}));
})(EasyCheers || (EasyCheers = {}));
var EasyCheers;
(function (EasyCheers) {
    var tools;
    (function (tools) {
        class Contract {
            constructor() { }
            static buildScript(appCall, method, param) {
                var sb = new ThinNeo.ScriptBuilder();
                sb.EmitParamJson(param);
                sb.EmitPushString(method);
                sb.EmitAppCall(appCall);
                return sb.ToArray();
            }
            static buildScript_random(appCall, method, param) {
                var sb = new ThinNeo.ScriptBuilder();
                let random_uint8 = Neo.Cryptography.RandomNumberGenerator.getRandomValues(new Uint8Array(32));
                let random_int = Neo.BigInteger.fromUint8Array(random_uint8);
                sb.EmitPushNumber(random_int);
                sb.Emit(ThinNeo.OpCode.DROP);
                sb.EmitParamJson(param);
                sb.EmitPushString(method);
                sb.EmitAppCall(appCall);
                return sb.ToArray();
            }
            static buildScript_random_array(sbarr) {
                var sb = new ThinNeo.ScriptBuilder();
                let random_uint8 = Neo.Cryptography.RandomNumberGenerator.getRandomValues(new Uint8Array(32));
                let random_int = Neo.BigInteger.fromUint8Array(random_uint8);
                sb.EmitPushNumber(random_int);
                sb.Emit(ThinNeo.OpCode.DROP);
                for (const script of sbarr) {
                    sb.EmitParamJson(script.param);
                    sb.EmitPushString(script.method);
                    sb.EmitAppCall(script.appCall);
                }
                return sb.ToArray();
            }
            static buildInvokeTransData_attributes(script) {
                return __awaiter(this, void 0, void 0, function* () {
                    var utxos = yield tools.CoinTool.getassets();
                    var gass = utxos[tools.CoinTool.id_GAS];
                    var addr = EasyCheers.LoginInfo.getCurrentAddress();
                    var tran = new ThinNeo.Transaction();
                    tran.inputs = [];
                    tran.outputs = [];
                    tran.type = ThinNeo.TransactionType.InvocationTransaction;
                    tran.extdata = new ThinNeo.InvokeTransData();
                    tran.extdata.script = script;
                    tran.attributes = new Array(1);
                    tran.attributes[0] = new ThinNeo.Attribute();
                    tran.attributes[0].usage = ThinNeo.TransactionAttributeUsage.Script;
                    tran.attributes[0].data = ThinNeo.Helper.GetPublicKeyScriptHash_FromAddress(addr);
                    let feeres;
                    if (gass && EasyCheers.LoginInfo.info.payfee) {
                        feeres = tools.CoinTool.creatInuptAndOutup(gass, Neo.Fixed8.fromNumber(0.001));
                        tran.inputs = feeres.inputs.map(input => {
                            input.hash = input.hash.reverse();
                            return input;
                        });
                        tran.outputs = feeres.outputs;
                    }
                    if (tran.witnesses == null)
                        tran.witnesses = [];
                    let data = yield tools.CoinTool.signData(tran);
                    return data;
                });
            }
            static buildInvokeTransData(...param) {
                return __awaiter(this, void 0, void 0, function* () {
                    let address = EasyCheers.LoginInfo.getCurrentAddress();
                    let script = param[0];
                    let have = param.length > 1;
                    let addr = have ? param[1] : address;
                    let assetid = have ? param[2] : tools.CoinTool.id_GAS;
                    let count = have ? param[3] : Neo.Fixed8.Zero;
                    var utxos = yield tools.CoinTool.getassets();
                    let tranmsg = tools.CoinTool.makeTran(utxos, addr, assetid, count);
                    let tran = tranmsg.info['tran'];
                    tran.type = ThinNeo.TransactionType.InvocationTransaction;
                    tran.extdata = new ThinNeo.InvokeTransData();
                    tran.extdata.script = script;
                    tran.extdata.gas = Neo.Fixed8.fromNumber(1.0);
                    let data = yield tools.CoinTool.signData(tran);
                    return { data, tranmsg };
                });
            }
            static contractInvokeScript(appCall, method, ...param) {
                return __awaiter(this, void 0, void 0, function* () {
                    let data = this.buildScript(appCall, method, param);
                    return yield tools.WWW.rpc_getInvokescript(data);
                });
            }
            static contractInvokeTrans_attributes(script) {
                return __awaiter(this, void 0, void 0, function* () {
                    var utxos = yield tools.CoinTool.getassets();
                    var gass = utxos[tools.CoinTool.id_GAS];
                    var addr = EasyCheers.LoginInfo.getCurrentAddress();
                    var tran = new ThinNeo.Transaction();
                    tran.inputs = [];
                    tran.outputs = [];
                    tran.type = ThinNeo.TransactionType.InvocationTransaction;
                    tran.extdata = new ThinNeo.InvokeTransData();
                    tran.extdata.script = script;
                    tran.attributes = new Array(1);
                    tran.attributes[0] = new ThinNeo.Attribute();
                    tran.attributes[0].usage = ThinNeo.TransactionAttributeUsage.Script;
                    tran.attributes[0].data = ThinNeo.Helper.GetPublicKeyScriptHash_FromAddress(addr);
                    let feeres;
                    let payfee = false;
                    if (gass && payfee) {
                        feeres = tools.CoinTool.creatInuptAndOutup(gass, Neo.Fixed8.fromNumber(0.001));
                        tran.inputs = feeres.inputs.map(input => {
                            input.hash = input.hash.reverse();
                            return input;
                        });
                        tran.outputs = feeres.outputs;
                    }
                    if (tran.witnesses == null)
                        tran.witnesses = [];
                    let data = yield tools.CoinTool.signData(tran);
                    let txid = tran.GetTxid();
                    var res = new EasyCheers.Result();
                    try {
                        var result = yield tools.WWW.api_postRawTransaction(data);
                        res.err = !result["sendrawtransactionresult"];
                        res.info = txid;
                    }
                    catch (error) {
                        res.err = true;
                        res.info = txid;
                    }
                    if (feeres && feeres.oldutxo) {
                        EasyCheers.OldUTXO.oldutxosPush(feeres.oldutxo);
                    }
                    return res;
                });
            }
            static contractInvokeTrans(...param) {
                return __awaiter(this, void 0, void 0, function* () {
                    let address = EasyCheers.LoginInfo.getCurrentAddress();
                    let script = param[0];
                    let have = param.length > 1;
                    let addr = have ? param[1] : address;
                    let assetid = have ? param[2] : tools.CoinTool.id_GAS;
                    let count = have ? param[3] : Neo.Fixed8.Zero;
                    var utxos = yield tools.CoinTool.getassets();
                    let tranmsg = tools.CoinTool.makeTran(utxos, addr, assetid, count);
                    let tran = tranmsg.info['tran'];
                    tran.type = ThinNeo.TransactionType.InvocationTransaction;
                    tran.extdata = new ThinNeo.InvokeTransData();
                    tran.extdata.script = script;
                    tran.extdata.gas = Neo.Fixed8.fromNumber(0);
                    try {
                        let data = yield tools.CoinTool.signData(tran);
                        var height = yield tools.WWW.api_getHeight();
                        var result = yield tools.WWW.api_postRawTransaction(data);
                        if (result["sendrawtransactionresult"]) {
                            let olds = tranmsg.info['oldarr'];
                            olds.map(old => old.height = height);
                            EasyCheers.OldUTXO.oldutxosPush(olds);
                            return result["txid"];
                        }
                        else {
                            throw "Transaction send failure";
                        }
                    }
                    catch (error) {
                    }
                });
            }
            static getNotifyNames(txid) {
                return __awaiter(this, void 0, void 0, function* () {
                    let res = yield tools.WWW.getNotify(txid);
                    let notifications = res["notifications"];
                    let methodnames = [];
                    for (let index = 0; index < notifications.length; index++) {
                        const value = notifications[index].state.value[0].value;
                        methodnames.push(ThinNeo.Helper.Bytes2String(value.hexToBytes()));
                    }
                    return methodnames;
                });
            }
        }
        tools.Contract = Contract;
        class ScriptEntity {
            constructor(appCall, method, param) {
                this.appCall = appCall;
                this.param = param;
                this.method = method;
            }
        }
        tools.ScriptEntity = ScriptEntity;
    })(tools = EasyCheers.tools || (EasyCheers.tools = {}));
})(EasyCheers || (EasyCheers = {}));
var EasyCheers;
(function (EasyCheers) {
    let LoginType;
    (function (LoginType) {
        LoginType[LoginType["wif"] = 0] = "wif";
        LoginType[LoginType["nep2"] = 1] = "nep2";
        LoginType[LoginType["nep6"] = 2] = "nep6";
        LoginType[LoginType["otcgo"] = 3] = "otcgo";
    })(LoginType = EasyCheers.LoginType || (EasyCheers.LoginType = {}));
    class alert {
        constructor() {
        }
        static show(title, inputType, btnText, call) {
            this.btn_confirm.classList.add("btn", "btn-nel", "btn-big");
            this.btn_confirm.textContent = btnText;
            this.input.type = inputType;
            this.title.innerText = title;
            this.alertError.textContent = "";
            this.alert.hidden = false;
            this.input.onkeydown = (ev) => {
                if (ev.keyCode == 13) {
                    call(this.input.value);
                }
            };
            this.btn_confirm.onclick = () => {
                call(this.input.value);
            };
            this.btn_close.onclick = () => {
                this.close();
                call(false);
            };
        }
        static close() {
            this.alert.hidden = true;
            this.input.textContent = "";
            this.input.value = "";
        }
        static error(msg) {
            this.alertError.textContent = msg;
        }
    }
    alert.alert = document.getElementById("alertview");
    alert.title = document.getElementById("alert-title");
    alert.alertBox = document.getElementById("alert-box");
    alert.alertError = document.getElementById("alert-error");
    alert.btn_close = document.getElementById("alert-close");
    alert.input = document.getElementById("alert-input");
    alert.btn_confirm = document.getElementById("alert-confirm");
    EasyCheers.alert = alert;
    class LoginInfo {
        static deblocking() {
            return __awaiter(this, void 0, void 0, function* () {
                let msg_title = "";
                let msg_btn = "";
                let msg_error = "";
                let language = localStorage.getItem("language");
                if (!language || language == 'en') {
                    msg_title = "Please enter your password ";
                    msg_btn = "Confirm";
                    msg_error = "Password error ";
                }
                else {
                    msg_title = "请输入您的密码 ";
                    msg_btn = "确认";
                    msg_error = "密码错误 ";
                }
                let promise = new Promise((resolve, reject) => {
                    if (!!LoginInfo.info) {
                        let current = LoginInfo.info;
                        resolve(current);
                    }
                    else {
                        let current = JSON.parse(sessionStorage.getItem("login-info-arr"));
                        if (current.type == LoginType.wif) {
                            var res = EasyCheers.tools.neotool.wifDecode(current.msg['wif']);
                            if (res.err) {
                                reject("WIF is error");
                            }
                            else {
                                LoginInfo.info = res.info;
                                resolve(LoginInfo.info);
                                return;
                            }
                        }
                        if (current.type == LoginType.nep2 || LoginType.nep6) {
                            alert.show(msg_title, "password", msg_btn, passsword => {
                                if (!passsword) {
                                    reject("签名中断");
                                }
                                else {
                                    let nep2 = current.msg[LoginInfo.getCurrentAddress()];
                                    EasyCheers.tools.neotool.nep2ToWif(nep2, passsword)
                                        .then((res) => {
                                        LoginInfo.info = res.info;
                                        alert.close();
                                        resolve(LoginInfo.info);
                                    })
                                        .catch(err => {
                                        alert.error(msg_error);
                                    });
                                }
                            });
                        }
                        if (current.type == LoginType.otcgo) {
                            alert.show(msg_title, "password", msg_btn, password => {
                                if (!password) {
                                    reject("签名中断");
                                }
                                else {
                                    let json = current.msg;
                                    let otcgo = new WalletOtcgo();
                                    otcgo.fromJsonStr(JSON.stringify(json));
                                    otcgo.otcgoDecrypt(password);
                                    const result = otcgo.doValidatePwd();
                                    if (result) {
                                        var info = new LoginInfo();
                                        info.address = otcgo.address;
                                        info.prikey = otcgo.prikey;
                                        info.pubkey = otcgo.pubkey;
                                        info["password"] = password;
                                        LoginInfo.info = info;
                                        alert.close();
                                        resolve(info);
                                    }
                                    else {
                                        alert.error(msg_error);
                                    }
                                }
                            });
                        }
                    }
                });
                return promise;
            });
        }
        static alert(call) {
            let alert = document.getElementById("alertview");
            let title = document.getElementById("alert-title");
            let alertBox = document.getElementById("alert-box");
            let close = document.getElementById("alert-close");
            let input = document.getElementById("alert-input");
            let btn = document.getElementById("alert-confirm");
            btn.classList.add("btn", "btn-nel", "btn-big");
            btn.textContent = "确认";
            input.type = "password";
            title.innerText = "请输入密码";
            alert.hidden = false;
            btn.onclick = () => {
                call(input.value);
            };
            close.onclick = () => {
                alert.hidden = true;
                input.value = "";
                return;
            };
        }
        static ArrayToString(array) {
            var obj = [];
            for (var i = 0; i < array.length; i++) {
                obj.push({});
                obj[i].pubkey = array[i].pubkey.toHexString();
                obj[i].prikey = array[i].prikey.toHexString();
                obj[i].address = array[i].address;
            }
            return JSON.stringify(obj);
        }
        static StringToArray(str) {
            var obj = JSON.parse(str);
            var arr = [];
            for (var i = 0; i < obj.length; i++) {
                arr.push(new LoginInfo());
                var str = obj[i].prikey;
                var str2 = obj[i].pubkey;
                arr[i].prikey = str.hexToBytes();
                arr[i].pubkey = str2.hexToBytes();
                arr[i].address = obj[i].address;
            }
            return arr;
        }
        static getCurrentLogin() {
            var address = LoginInfo.getCurrentAddress();
            var arr = EasyCheers.tools.StorageTool.getLoginArr();
            var n = arr.findIndex(info => info.address == address);
            return arr[n];
        }
        static getCurrentAddress() {
            return EasyCheers.tools.StorageTool.getStorage("current-address");
        }
        static setCurrentAddress(str) {
            EasyCheers.tools.StorageTool.setStorage("current-address", str);
        }
    }
    EasyCheers.LoginInfo = LoginInfo;
    class BalanceInfo {
        static jsonToArray(json) {
            let arr = new Array();
            for (const i in json) {
                if (json.hasOwnProperty(i)) {
                    const element = json[i];
                    let balance = new BalanceInfo();
                    balance.asset = element["asset"];
                    balance.balance = element["balance"];
                    balance.name = element["balance"];
                    balance.names = element["names"];
                    balance.type = element["type"];
                    arr.push(balance);
                }
            }
            return arr;
        }
        static getBalancesByArr(balances, nep5balances, height) {
            let balancearr = [];
            if (balances) {
                balances.map((item) => {
                    item.names = EasyCheers.tools.CoinTool.assetID2name[item.asset];
                    let a = EasyCheers.tools.StorageTool.getStorage(item.asset);
                    if (a) {
                        let obj = JSON.parse(a);
                        let h = obj["height"];
                        height - h > 1 ? EasyCheers.tools.StorageTool.delStorage(item.asset) : item.balance = obj["balance"]["balance"];
                    }
                });
                balancearr = balances;
            }
            if (nep5balances) {
                for (let index = 0; index < nep5balances.length; index++) {
                    const nep5 = nep5balances[index];
                    var nep5b = new BalanceInfo();
                    let id = nep5.assetid.replace("0x", "");
                    id = id.substring(0, 4) + '...' + id.substring(id.length - 4);
                    nep5b.asset = nep5.assetid;
                    nep5b.balance = nep5.balance;
                    nep5b.names = nep5.symbol + "(" + id + ")";
                    nep5b.type = "nep5";
                    balancearr.push(nep5b);
                }
            }
            return balancearr;
        }
        static setBalanceSotre(balance, height) {
            EasyCheers.tools.StorageTool.setStorage(balance.asset, JSON.stringify({ height, balance }));
        }
    }
    EasyCheers.BalanceInfo = BalanceInfo;
    class Nep5Balance {
    }
    EasyCheers.Nep5Balance = Nep5Balance;
    class Result {
    }
    EasyCheers.Result = Result;
    let AssetEnum;
    (function (AssetEnum) {
        AssetEnum["NEO"] = "0xc56f33fc6ecfcd0c225c4ab356fee59390af8560be0e930faebe74a6daff7c9b";
        AssetEnum["GAS"] = "0x602c79718b16e442de58778e148d0b1084e3b2dffd5de6b7b16cee7969282de7";
    })(AssetEnum = EasyCheers.AssetEnum || (EasyCheers.AssetEnum = {}));
    class NeoAsset {
    }
    EasyCheers.NeoAsset = NeoAsset;
    class OldUTXO {
        constructor(txid, n) {
            this.n = n;
            this.txid = txid;
            let oldBlock = new EasyCheers.tools.SessionStoreTool("block");
            this.height = oldBlock.select('height');
        }
        static oldutxosPush(olds) {
            let arr = this.getOldutxos();
            EasyCheers.tools.StorageTool.setStorage("old-utxos", JSON.stringify(arr.concat(olds)));
        }
        static setOldutxos(olds) {
            EasyCheers.tools.StorageTool.setStorage("old-utxos", JSON.stringify(olds));
        }
        static getOldutxos() {
            var arr = new Array();
            var str = EasyCheers.tools.StorageTool.getStorage("old-utxos");
            if (str)
                arr = JSON.parse(str);
            return arr;
        }
        compareUtxo(utxo) {
            return this.txid == utxo.txid && this.n == utxo.n;
        }
    }
    EasyCheers.OldUTXO = OldUTXO;
    class UTXO {
        static ArrayToString(utxos) {
            var str = "";
            var obj = [];
            for (var i = 0; i < utxos.length; i++) {
                obj.push({});
                obj[i].n = utxos[i].n;
                obj[i].addr = utxos[i].addr;
                obj[i].txid = utxos[i].txid;
                obj[i].asset = utxos[i].asset;
                obj[i].count = utxos[i].count.toString();
            }
            return obj;
        }
        static StringToArray(obj) {
            var utxos = new Array();
            for (var i = 0; i < obj.length; i++) {
                utxos.push(new UTXO);
                var str = obj[i].count;
                utxos[i].n = obj[i].n;
                utxos[i].addr = obj[i].addr;
                utxos[i].txid = obj[i].txid;
                utxos[i].asset = obj[i].asset;
                utxos[i].count = Neo.Fixed8.parse(str);
            }
            return utxos;
        }
        static setAssets(assets) {
            var obj = {};
            for (var asset in assets) {
                let arr = UTXO.ArrayToString(assets[asset]);
                obj[asset] = arr;
            }
            sessionStorage.setItem("current-assets-utxos", JSON.stringify(obj));
        }
        static getAssets() {
            let assets = null;
            var str = sessionStorage.getItem("current-assets-utxos");
            if (str !== null && str != undefined && str != '') {
                assets = JSON.parse(str);
                for (const asset in assets) {
                    assets[asset] = UTXO.StringToArray(assets[asset]);
                }
            }
            return assets;
        }
    }
    EasyCheers.UTXO = UTXO;
    class Consts {
    }
    Consts.baseContract = Neo.Uint160.parse("348387116c4a75e420663277d9c02049907128c7");
    Consts.registerContract = Neo.Uint160.parse("d6a5e965f67b0c3e5bec1f04f028edb9cb9e3f7c");
    Consts.saleContract = Neo.Uint160.parse("c4d09243258364e0e028852640218e08534f0466");
    EasyCheers.Consts = Consts;
    class DomainInfo {
    }
    EasyCheers.DomainInfo = DomainInfo;
    class SellDomainInfo extends DomainInfo {
        constructor() {
            super();
        }
        copyDomainInfoToThis(info) {
            this.owner = info.owner;
            this.ttl = info.ttl;
            this.register = info.register;
            this.resolver = info.resolver;
        }
    }
    EasyCheers.SellDomainInfo = SellDomainInfo;
    class RootDomainInfo extends DomainInfo {
        constructor() {
            super();
        }
    }
    EasyCheers.RootDomainInfo = RootDomainInfo;
    class Transactionforaddr {
    }
    EasyCheers.Transactionforaddr = Transactionforaddr;
    class History {
        static setHistoryStore(history, height) {
            let arr = this.getHistoryStore();
            arr.push({ height, history });
            EasyCheers.tools.StorageTool.setStorage("history-txs", JSON.stringify(arr));
        }
        static getHistoryStore() {
            let str = EasyCheers.tools.StorageTool.getStorage("history-txs");
            let arr = !!str ? JSON.parse(str) : [];
            return arr;
        }
        static delHistoryStoreByHeight(height) {
            let arr = this.getHistoryStore();
            if (arr.length > 0) {
                let newarr = [];
                arr.map(his => {
                    let h = parseInt(his.height);
                    if (height - h < 2) {
                        newarr.push(his);
                    }
                });
                EasyCheers.tools.StorageTool.setStorage("history-txs", JSON.stringify(newarr));
            }
        }
    }
    EasyCheers.History = History;
    class Claim {
        constructor(json) {
            this.addr = json['addr'];
            this.asset = json['asset'];
            this.claimed = json['claimed'];
            this.createHeight = json['createHeight'];
            this.n = json['n'];
            this.txid = json['txid'];
            this.useHeight = json['useHeight'];
            this.used = json['used'];
            this.value = json['value'];
        }
        static strToClaimArray(arr) {
            let claimarr = new Array();
            for (const i in arr) {
                if (arr.hasOwnProperty(i)) {
                    claimarr.push(new Claim(arr[i]));
                }
            }
            return claimarr;
        }
    }
    EasyCheers.Claim = Claim;
    class Domainmsg {
    }
    EasyCheers.Domainmsg = Domainmsg;
    class DomainStatus {
        static setStatus(domain) {
            let str = sessionStorage.getItem("domain-status");
            var arr = {};
            if (str) {
                arr = JSON.parse(str);
                let msg = arr[domain.domainname];
                msg ? msg : msg = new DomainStatus();
                domain.await_mapping ? msg["await_mapping"] = domain.await_mapping : "";
                domain.await_register ? msg["await_register"] = domain.await_register : "";
                domain.await_resolver ? msg["await_resolver"] = domain.await_resolver : "";
                domain.mapping ? msg["mapping"] = domain.mapping : "";
                domain.resolver ? msg["resolver"] = domain.resolver.replace("0x", "") : "";
                arr[domain.domainname] = msg;
            }
            else {
                arr[domain.domainname] = domain;
            }
            sessionStorage.setItem("domain-status", JSON.stringify(arr));
        }
        static getStatus() {
            let str = sessionStorage.getItem("domain-status");
            let obj = {};
            str ? obj = JSON.parse(sessionStorage.getItem("domain-status")) : {};
            return obj;
        }
    }
    EasyCheers.DomainStatus = DomainStatus;
    class WalletOtcgo {
        fromJsonStr(str) {
            let json = JSON.parse(str);
            let otcgo = new WalletOtcgo();
            this.address = json["address"];
            this.publicKey = json["publicKey"];
            this.publicKeyCompressed = json["publicKeyCompressed"];
            this.privateKeyEncrypted = json["privateKeyEncrypted"];
        }
        toJson() {
            let json = {};
            json['address'] = this.address;
            json['publicKey'] = this.publicKey;
            json['publicKeyCompressed'] = this.publicKeyCompressed;
            json["privateKeyEncrypted"] = this.privateKeyEncrypted;
            return json;
        }
        otcgoDecrypt(pwd) {
            try {
                this.privatekey = CryptoJS.AES.decrypt(this.privateKeyEncrypted, pwd).toString(CryptoJS.enc.Utf8);
                this.prikey = this.privatekey.hexToBytes();
                this.pubkey = ThinNeo.Helper.GetPublicKeyFromPrivateKey(this.prikey);
            }
            catch (error) {
                console.error(error);
            }
        }
        doSign(prvkey, msg) {
            const sig = new KJUR.crypto.Signature({ 'alg': 'SHA256withECDSA' });
            sig.initSign({
                'ecprvhex': prvkey,
                'eccurvename': 'secp256r1'
            });
            sig.updateString(msg);
            return sig.sign();
        }
        doVerify(pubkey, msg, sigval) {
            const sig = new KJUR.crypto.Signature({
                'alg': 'SHA256withECDSA',
                'prov': 'cryptojs/jsrsa'
            });
            sig.initVerifyByPublicKey({
                'ecpubhex': pubkey,
                'eccurvename': 'secp256r1'
            });
            sig.updateString(msg);
            return sig.verify(sigval);
        }
        doValidatePwd() {
            if (this.prikey.length === 0)
                return false;
            const msg = 'aaa';
            const sigval = this.doSign(this.privatekey, msg);
            return this.doVerify(this.publicKey, msg, sigval);
        }
    }
    EasyCheers.WalletOtcgo = WalletOtcgo;
    class DataType {
    }
    DataType.Array = 'Array';
    DataType.ByteArray = 'ByteArray';
    DataType.Integer = 'Integer';
    DataType.Boolean = 'Boolean';
    DataType.String = 'String';
    EasyCheers.DataType = DataType;
    class ResultItem {
        static FromJson(type, value) {
            let item = new ResultItem();
            if (type === DataType.Array) {
                item.subItem = [];
                for (let i = 0; i < value.length; i++) {
                    let subjson = value[i];
                    let subtype = subjson["type"];
                    item.subItem.push(ResultItem.FromJson(subtype, subjson["value"]));
                }
            }
            else if (type === DataType.ByteArray) {
                item.data = value.hexToBytes();
            }
            else if (type === DataType.Integer) {
                item.data = Neo.BigInteger.parse(value).toUint8Array();
            }
            else if (type === DataType.Boolean) {
                if (value != 0)
                    item.data = new Uint8Array(0x01);
                else
                    item.data = new Uint8Array(0x00);
            }
            else if (type === DataType.String) {
                item.data = ThinNeo.Helper.String2Bytes(value);
            }
            else {
                console.log("not support type:" + type);
            }
            return item;
        }
        AsHexString() {
            return (this.data).toHexString();
        }
        AsHashString() {
            return "0x" + this.data.reverse().toHexString();
        }
        AsString() {
            return ThinNeo.Helper.Bytes2String(this.data);
        }
        AsHash160() {
            if (this.data.length === 0)
                return null;
            return new Neo.Uint160(this.data.buffer);
        }
        AsHash256() {
            if (this.data.length === 0)
                return null;
            return new Neo.Uint256(this.data.buffer);
        }
        AsBoolean() {
            if (this.data.length === 0 || this.data[0] === 0)
                return false;
            return true;
        }
        AsInteger() {
            return new Neo.BigInteger(this.data);
        }
    }
    EasyCheers.ResultItem = ResultItem;
    class NNSResult {
    }
    EasyCheers.NNSResult = NNSResult;
    class PageUtil {
        constructor(total, pageSize) {
            this._currentPage = 1;
            this._totalCount = total;
            this._pageSize = pageSize;
            this._totalPage = total % pageSize == 0 ? total / pageSize : Math.ceil((total / pageSize));
        }
        ;
        get currentPage() {
            this._totalPage = this.totalCount % this.pageSize == 0 ? this.totalCount / this.pageSize : Math.ceil((this.totalCount / this.pageSize));
            return this._currentPage;
        }
        set currentPage(currentPage) {
            this._currentPage = currentPage;
        }
        get pageSize() {
            return this._pageSize;
        }
        set pageSize(pageSize) {
            this._pageSize = pageSize;
        }
        get totalCount() {
            return this._totalCount;
        }
        set totalCount(totalCount) {
            this._totalCount = totalCount;
        }
        get totalPage() {
            this._totalPage = this._totalCount % this._pageSize == 0 ? this._totalCount / this._pageSize : Math.ceil(this._totalCount / this._pageSize);
            return this._totalPage;
        }
    }
    EasyCheers.PageUtil = PageUtil;
    class TaskFunction {
        constructor() { }
    }
    EasyCheers.TaskFunction = TaskFunction;
    class Task {
        constructor(type, txid, messgae) {
            let oldBlock = new EasyCheers.tools.SessionStoreTool("block");
            this.height = oldBlock.select('height');
            this.type = type;
            this.confirm = 0;
            this.txid = txid;
            this.state = TaskState.watting;
            this.message = messgae;
            this.startTime = new Date().getTime();
        }
        toString() {
            return JSON.stringify(this);
        }
    }
    EasyCheers.Task = Task;
    class Process {
        constructor(start) {
            this.timearr = [];
            this.startTime = typeof start == "string" ? new Date(start).getTime() : start;
            this.date = EasyCheers.tools.DateTool.dateFtt("yyyy/MM/dd", new Date(this.startTime));
            this.time = EasyCheers.tools.DateTool.dateFtt("hh:mm:ss", new Date(this.startTime));
            this.width = 0;
            this.state = "";
            for (let i = 1; i <= 5; i++) {
                let element = { msg: "", date: "", time: "" };
                switch (i) {
                    case 1:
                        element.msg = "1";
                        break;
                    case 3:
                        element.msg = "2";
                        break;
                    case 5:
                        element.msg = "3";
                        break;
                    default:
                        break;
                }
                let time = this.startTime + 300000 * i;
                let date = EasyCheers.tools.DateTool.dateFtt("yyyy/MM/dd", new Date(time));
                let times = EasyCheers.tools.DateTool.dateFtt("hh:mm:ss", new Date(time));
                element.date = date;
                element.time = times;
                this.timearr.push(element);
            }
        }
    }
    EasyCheers.Process = Process;
    class NeoAuction_TopUp {
        constructor() {
            this.input = "";
            this.watting = false;
            this.isShow = false;
            this.error = false;
        }
    }
    EasyCheers.NeoAuction_TopUp = NeoAuction_TopUp;
    class NeoAuction_Withdraw {
        constructor() {
            this.input = "";
            this.watting = false;
            this.isShow = false;
            this.error = false;
        }
    }
    EasyCheers.NeoAuction_Withdraw = NeoAuction_Withdraw;
    let TaskState;
    (function (TaskState) {
        TaskState[TaskState["watting"] = 0] = "watting";
        TaskState[TaskState["success"] = 1] = "success";
        TaskState[TaskState["fail"] = 2] = "fail";
    })(TaskState = EasyCheers.TaskState || (EasyCheers.TaskState = {}));
    let TaskType;
    (function (TaskType) {
        TaskType[TaskType["tranfer"] = 0] = "tranfer";
        TaskType[TaskType["openAuction"] = 1] = "openAuction";
        TaskType[TaskType["addPrice"] = 2] = "addPrice";
        TaskType[TaskType["gasToSgas"] = 3] = "gasToSgas";
        TaskType[TaskType["sgasToGas"] = 4] = "sgasToGas";
        TaskType[TaskType["topup"] = 5] = "topup";
        TaskType[TaskType["withdraw"] = 6] = "withdraw";
        TaskType[TaskType["getGasTest"] = 7] = "getGasTest";
        TaskType[TaskType["domainMapping"] = 8] = "domainMapping";
        TaskType[TaskType["domainResovle"] = 9] = "domainResovle";
        TaskType[TaskType["domainRenewal"] = 10] = "domainRenewal";
        TaskType[TaskType["getDomain"] = 11] = "getDomain";
        TaskType[TaskType["recoverSgas"] = 12] = "recoverSgas";
        TaskType[TaskType["ClaimGas"] = 13] = "ClaimGas";
        TaskType[TaskType["domainTransfer"] = 14] = "domainTransfer";
        TaskType[TaskType["saleDomain"] = 15] = "saleDomain";
        TaskType[TaskType["unSaleDomain"] = 16] = "unSaleDomain";
        TaskType[TaskType["buyDomain"] = 17] = "buyDomain";
        TaskType[TaskType["getMyNNC"] = 18] = "getMyNNC";
        TaskType[TaskType["requestNNC"] = 19] = "requestNNC";
    })(TaskType = EasyCheers.TaskType || (EasyCheers.TaskType = {}));
    let ConfirmType;
    (function (ConfirmType) {
        ConfirmType[ConfirmType["tranfer"] = 0] = "tranfer";
        ConfirmType[ConfirmType["contract"] = 1] = "contract";
        ConfirmType[ConfirmType["recharge"] = 2] = "recharge";
    })(ConfirmType = EasyCheers.ConfirmType || (EasyCheers.ConfirmType = {}));
    let DomainState;
    (function (DomainState) {
        DomainState[DomainState["open"] = 0] = "open";
        DomainState[DomainState["fixed"] = 1] = "fixed";
        DomainState[DomainState["random"] = 2] = "random";
        DomainState[DomainState["end1"] = 3] = "end1";
        DomainState[DomainState["end2"] = 4] = "end2";
        DomainState[DomainState["expire"] = 5] = "expire";
        DomainState[DomainState["pass"] = 6] = "pass";
    })(DomainState = EasyCheers.DomainState || (EasyCheers.DomainState = {}));
})(EasyCheers || (EasyCheers = {}));
var EasyCheers;
(function (EasyCheers) {
    class floatNum {
        static strip(num, precision = 12) {
            return +parseFloat(num.toPrecision(precision));
        }
        static digitLength(num) {
            const eSplit = num.toString().split(/[eE]/);
            const len = (eSplit[0].split('.')[1] || '').length - (+(eSplit[1] || 0));
            return len > 0 ? len : 0;
        }
        static float2Fixed(num) {
            if (num.toString().indexOf('e') === -1) {
                return Number(num.toString().replace('.', ''));
            }
            const dLen = floatNum.digitLength(num);
            return dLen > 0 ? num * Math.pow(10, dLen) : num;
        }
        static checkBoundary(num) {
            if (num > Number.MAX_SAFE_INTEGER || num < Number.MIN_SAFE_INTEGER) {
                console.warn(`${num} is beyond boundary when transfer to integer, the results may not be accurate`);
            }
        }
        static times(num1, num2, ...others) {
            if (others.length > 0) {
                return floatNum.times(floatNum.times(num1, num2), others[0], ...others.slice(1));
            }
            const num1Changed = floatNum.float2Fixed(num1);
            const num2Changed = floatNum.float2Fixed(num2);
            const baseNum = floatNum.digitLength(num1) + floatNum.digitLength(num2);
            const leftValue = num1Changed * num2Changed;
            floatNum.checkBoundary(leftValue);
            return leftValue / Math.pow(10, baseNum);
        }
        static plus(num1, num2, ...others) {
            if (others.length > 0) {
                return floatNum.plus(floatNum.plus(num1, num2), others[0], ...others.slice(1));
            }
            const baseNum = Math.pow(10, Math.max(floatNum.digitLength(num1), floatNum.digitLength(num2)));
            return (floatNum.times(num1, baseNum) + floatNum.times(num2, baseNum)) / baseNum;
        }
        static minus(num1, num2, ...others) {
            if (others.length > 0) {
                return floatNum.minus(floatNum.minus(num1, num2), others[0], ...others.slice(1));
            }
            const baseNum = Math.pow(10, Math.max(floatNum.digitLength(num1), floatNum.digitLength(num2)));
            return (floatNum.times(num1, baseNum) - floatNum.times(num2, baseNum)) / baseNum;
        }
        static divide(num1, num2, ...others) {
            if (others.length > 0) {
                return floatNum.divide(floatNum.divide(num1, num2), others[0], ...others.slice(1));
            }
            const num1Changed = floatNum.float2Fixed(num1);
            const num2Changed = floatNum.float2Fixed(num2);
            floatNum.checkBoundary(num1Changed);
            floatNum.checkBoundary(num2Changed);
            return floatNum.times((num1Changed / num2Changed), Math.pow(10, floatNum.digitLength(num2) - floatNum.digitLength(num1)));
        }
        static round(num, ratio) {
            const base = Math.pow(10, ratio);
            return floatNum.divide(Math.round(floatNum.times(num, base)), base);
        }
        static addZero(num, ratio) {
            var s_x = num.toString();
            var pos_decimal = s_x.indexOf('.');
            if (pos_decimal < 0) {
                pos_decimal = s_x.length;
                s_x += '.';
            }
            while (s_x.length <= pos_decimal + ratio) {
                s_x += '0';
            }
            return s_x;
        }
    }
    EasyCheers.floatNum = floatNum;
})(EasyCheers || (EasyCheers = {}));
var EasyCheers;
(function (EasyCheers) {
    var tools;
    (function (tools) {
        class neotool {
            constructor() { }
            static verifyAddress(addr) {
                var verify = /^[a-zA-Z0-9]{34,34}$/;
                var res = verify.test(addr) ? neotool.verifyPublicKey(addr) : verify.test(addr);
                return res;
            }
            static verifyPublicKey(publicKey) {
                var array = Neo.Cryptography.Base58.decode(publicKey);
                var check = array.subarray(21, 21 + 4);
                var checkdata = array.subarray(0, 21);
                var hashd = Neo.Cryptography.Sha256.computeHash(checkdata);
                hashd = Neo.Cryptography.Sha256.computeHash(hashd);
                var hashd = hashd.slice(0, 4);
                var checked = new Uint8Array(hashd);
                var error = false;
                for (var i = 0; i < 4; i++) {
                    if (checked[i] != check[i]) {
                        error = true;
                        break;
                    }
                }
                return !error;
            }
            static wifDecode(wif) {
                let result = new EasyCheers.Result();
                let login = new EasyCheers.LoginInfo();
                try {
                    login.prikey = ThinNeo.Helper.GetPrivateKeyFromWIF(wif);
                }
                catch (e) {
                    result.err = true;
                    result.info = e.message;
                    return result;
                }
                try {
                    login.pubkey = ThinNeo.Helper.GetPublicKeyFromPrivateKey(login.prikey);
                }
                catch (e) {
                    result.err = true;
                    result.info = e.message;
                    return result;
                }
                try {
                    login.address = ThinNeo.Helper.GetAddressFromPublicKey(login.pubkey);
                }
                catch (e) {
                    result.err = true;
                    result.info = e.message;
                    return result;
                }
                result.info = login;
                return result;
            }
            static nep2FromWif(wif, password) {
                var prikey;
                var pubkey;
                var address;
                let res = new EasyCheers.Result();
                try {
                    prikey = ThinNeo.Helper.GetPrivateKeyFromWIF(wif);
                    var n = 16384;
                    var r = 8;
                    var p = 8;
                    ThinNeo.Helper.GetNep2FromPrivateKey(prikey, password, n, r, p, (info, result) => {
                        res.err = false;
                        res.info.nep2 = result;
                        pubkey = ThinNeo.Helper.GetPublicKeyFromPrivateKey(prikey);
                        var hexstr = pubkey.toHexString();
                        address = ThinNeo.Helper.GetAddressFromPublicKey(pubkey);
                        res.info.address = address;
                        return res;
                    });
                }
                catch (e) {
                    res.err = true;
                    res.info = e.message;
                    return res;
                }
            }
            static nep2ToWif(nep2, password) {
                return __awaiter(this, void 0, void 0, function* () {
                    var res = new EasyCheers.Result();
                    let login = new EasyCheers.LoginInfo();
                    let promise = new Promise((resolve, reject) => {
                        let n = 16384;
                        var r = 8;
                        var p = 8;
                        ThinNeo.Helper.GetPrivateKeyFromNep2(nep2, password, n, r, p, (info, result) => {
                            login.prikey = result;
                            if (login.prikey != null) {
                                login.pubkey = ThinNeo.Helper.GetPublicKeyFromPrivateKey(login.prikey);
                                login.address = ThinNeo.Helper.GetAddressFromPublicKey(login.pubkey);
                                res.err = false;
                                res.info = login;
                                resolve(res);
                            }
                            else {
                                res.err = true;
                                reject(res);
                            }
                        });
                    });
                    return promise;
                });
            }
            static nep6Load(wallet, password) {
                return __awaiter(this, void 0, void 0, function* () {
                    try {
                        var istart = 0;
                        let res = new EasyCheers.Result();
                        let arr = {};
                        if (wallet.accounts) {
                            for (let keyindex = 0; keyindex < wallet.accounts.length; keyindex++) {
                                let account = wallet.accounts[keyindex];
                                if (account.nep2key == null) {
                                    continue;
                                }
                                try {
                                    let result = yield tools.neotool.getPriKeyfromAccount(wallet.scrypt, password, account);
                                    arr[account.address] = (result.info);
                                    return arr;
                                }
                                catch (error) {
                                    throw error;
                                }
                            }
                        }
                        else {
                            throw console.error("The account cannot be empty");
                        }
                    }
                    catch (e) {
                        throw e.result;
                    }
                });
            }
            static getPriKeyfromAccount(scrypt, password, account) {
                return __awaiter(this, void 0, void 0, function* () {
                    let res = new EasyCheers.Result();
                    let promise = new Promise((resolve, reject) => {
                        account.getPrivateKey(scrypt, password, (info, result) => {
                            if (info == "finish") {
                                var pubkey = ThinNeo.Helper.GetPublicKeyFromPrivateKey(result);
                                var address = ThinNeo.Helper.GetAddressFromPublicKey(pubkey);
                                var wif = ThinNeo.Helper.GetWifFromPrivateKey(result);
                                var hexkey = result.toHexString();
                                res.err = false;
                                res.info = { pubkey: pubkey, address: address, prikey: result };
                                resolve(res);
                            }
                            else {
                                reject({ err: true, result: result });
                            }
                        });
                    });
                    return promise;
                });
            }
        }
        tools.neotool = neotool;
    })(tools = EasyCheers.tools || (EasyCheers.tools = {}));
})(EasyCheers || (EasyCheers = {}));
var EasyCheers;
(function (EasyCheers) {
    class SDK {
        static init() {
            console.log("[Easy]", '[SDK]', 'init ...');
            if (SDK.is_init === false) {
                SDK.main = new EasyCheers.Main();
            }
            SDK.is_init = true;
        }
        static registerHeightChangedCallback(callback = null) {
            console.log("[Easy]", '[SDK]', 'registerHeightChangedCallback ...');
            if (SDK.is_init === false) {
                console.log("[Easy]", '[SDK]', 'You have to call function init first');
                return;
            }
            if (!SDK.main.isLogined()) {
                console.log("[Easy]", '[SDK]', 'You have to login first');
                return;
            }
            SDK.main.setHeightChangedCallback(callback);
        }
        static createWallet(passwd, callback = null) {
            SDK.main.createWallet(passwd, callback);
        }
        static login(passwd, wallet) {
            if (SDK.is_init === false) {
                console.log("[Easy]", '[SDK]', 'You have to call function init first');
                return;
            }
            SDK.main.login(passwd, wallet);
        }
        static loginWif(wif, callback = null) {
            if (SDK.is_init === false) {
                console.log("[Easy]", '[SDK]', 'You have to call function init first');
                return;
            }
            console.log(wif);
            SDK.main.loginWif(wif, callback);
        }
        static loginNep2(nep2, passwd, callback = null) {
            if (SDK.is_init === false) {
                console.log("[Easy]", '[SDK]', 'You have to call function init first');
                return;
            }
            console.log(nep2);
            console.log(passwd);
            SDK.main.loginNep2(nep2, passwd, callback);
        }
        static contractGetValue(assetID, method, addr, callback = null) {
            return __awaiter(this, void 0, void 0, function* () {
                if (SDK.is_init === false) {
                    console.log("[Easy]", '[SDK]', 'You have to call function init first');
                    return;
                }
                if (!SDK.main.isLogined()) {
                    console.log("[Easy]", '[SDK]', 'You have to login first');
                    return;
                }
                let asid = Neo.Uint160.parse(assetID.replace("0x", ""));
                let res = yield EasyCheers.tools.Contract.contractInvokeScript(asid, method, addr);
                var stackArr = res["stack"];
                let stack = EasyCheers.ResultItem.FromJson(EasyCheers.DataType.Array, stackArr).subItem[0];
                let value = stack.AsInteger();
                if (callback != null)
                    callback(value);
            });
        }
        static getBalances(callback = null) {
            return __awaiter(this, void 0, void 0, function* () {
                if (SDK.is_init === false) {
                    console.log("[Easy]", '[SDK]', 'You have to call function init first');
                    return;
                }
                if (!SDK.main.isLogined()) {
                    console.log("[Easy]", '[SDK]', 'You have to login first');
                    return;
                }
                yield SDK.main.getBalances();
                if (callback != null)
                    callback(SDK.main.getNeo(), SDK.main.getGas());
            });
        }
        static getCurrentAddr() {
            if (SDK.is_init === false) {
                console.log("[Easy]", '[SDK]', 'You have to call function init first');
                return;
            }
            if (!SDK.main.isLogined()) {
                console.log("[Easy]", '[SDK]', 'You have to login first');
                return;
            }
            return EasyCheers.LoginInfo.getCurrentAddress();
        }
        static transferNep5(assetId, to, amount, callback = null) {
            return __awaiter(this, void 0, void 0, function* () {
                if (SDK.is_init === false) {
                    console.log("[Easy]", '[SDK]', 'You have to call function init first');
                    return;
                }
                if (!SDK.main.isLogined()) {
                    console.log("[Easy]", '[SDK]', 'You have to login first');
                    return;
                }
                let value = parseFloat(amount);
                let res = yield EasyCheers.tools.CoinTool.nep5Transaction(EasyCheers.LoginInfo.getCurrentAddress(), to, assetId, value);
                if (callback != null)
                    callback(JSON.stringify(res));
            });
        }
        static transferGlobalAsset(assetId, to, amount, callback = null) {
            return __awaiter(this, void 0, void 0, function* () {
                if (SDK.is_init === false) {
                    console.log("[Easy]", '[SDK]', 'You have to call function init first');
                    return;
                }
                if (!SDK.main.isLogined()) {
                    console.log("[Easy]", '[SDK]', 'You have to login first');
                    return;
                }
                let res = yield EasyCheers.tools.CoinTool.rawTransaction(to, assetId, amount);
                if (callback != null)
                    callback(JSON.stringify(res));
            });
        }
        static getNeo() {
            return this.main.getNeo();
        }
        static getGas() {
            return this.main.getGas();
        }
        static getEct() {
            return this.main.getEct();
        }
        static bet(contractHash, address, max, odds, callback = null) {
            return __awaiter(this, void 0, void 0, function* () {
                if (SDK.is_init === false) {
                    console.log("[Easy]", '[SDK]', 'You have to call function init first');
                    return;
                }
                if (!SDK.main.isLogined()) {
                    console.log("[Easy]", '[SDK]', 'You have to login first');
                    return;
                }
                let intMax = parseFloat(max);
                let intOdds = parseFloat(odds);
                let res = yield EasyCheers.tools.CoinTool.bet(contractHash, address, intMax, intOdds);
                if (callback != null)
                    callback(JSON.stringify(res));
            });
        }
    }
    SDK.is_init = false;
    EasyCheers.SDK = SDK;
})(EasyCheers || (EasyCheers = {}));
var EasyCheers;
(function (EasyCheers) {
    var tools;
    (function (tools) {
        class StorageTool {
            static getLoginArr() {
                var message = sessionStorage.getItem("login-info-arr");
                var arr = message ? EasyCheers.LoginInfo.StringToArray(message) : [];
                return arr;
            }
            static setLoginArr(value) {
                sessionStorage.setItem('login-info-arr', EasyCheers.LoginInfo.ArrayToString(value));
            }
            static setStorage(key, value) {
                sessionStorage.setItem(key, value);
            }
            static getStorage(key) {
                return sessionStorage.getItem(key);
            }
            static delStorage(key) {
                sessionStorage.removeItem(key);
            }
            static utxosRefresh() {
                return __awaiter(this, void 0, void 0, function* () {
                    let assets = yield tools.CoinTool.getassets();
                    EasyCheers.UTXO.setAssets(assets);
                });
            }
        }
        tools.StorageTool = StorageTool;
        class SessionStoreTool {
            constructor(table) {
                this.table = table;
            }
            put(key, ...param) {
                let value = param[0];
                let item = this.getList();
                let obj = item ? item : {};
                if (param.length == 1) {
                    obj[key] = value;
                }
                else {
                    let index = param[1];
                    if (obj[key]) {
                        obj[key][index] = value;
                    }
                    else {
                        obj[key] = {};
                        obj[key][index] = value;
                    }
                }
                sessionStorage.setItem(this.table, JSON.stringify(obj));
            }
            push(key, value) {
                let item = this.getList();
                let list = item ? item : {};
                let arr = (list[key] ? list[key] : []);
                arr.push(value);
                list[key] = arr;
                sessionStorage.setItem(this.table, JSON.stringify(list));
            }
            select(key) {
                let item = this.getList();
                if (item) {
                    return item[key];
                }
                return undefined;
            }
            delete(...param) {
                let item = this.getList();
                let key = param[0];
                if (param.length == 1) {
                    if (item && item[key]) {
                        delete item[key];
                        sessionStorage.setItem(this.table, JSON.stringify(item));
                    }
                }
                else {
                    let index = param[1];
                    if (item && item[key] && item[key][index]) {
                        delete item[key][index];
                        sessionStorage.setItem(this.table, JSON.stringify(item));
                    }
                }
            }
            update(key, value) {
                let item = SessionStoreTool.getTable(this.table);
                if (item && item[key]) {
                    item[key] = value;
                }
            }
            static getTable(table) {
                let item = sessionStorage.getItem(table);
                if (item) {
                    let obj = JSON.parse(item);
                    return obj;
                }
                return undefined;
            }
            getList() {
                return SessionStoreTool.getTable(this.table);
            }
            setList(list) {
                sessionStorage.setItem(this.table, JSON.stringify(list));
            }
        }
        tools.SessionStoreTool = SessionStoreTool;
        class StaticStore {
            static setAsset(asset) {
                StaticStore.choiceAsset = asset;
            }
        }
        StaticStore.choiceAsset = "";
        tools.StaticStore = StaticStore;
    })(tools = EasyCheers.tools || (EasyCheers.tools = {}));
})(EasyCheers || (EasyCheers = {}));
var EasyCheers;
(function (EasyCheers) {
    var tools;
    (function (tools) {
        class DateTool {
            static dateFtt(fmt, date) {
                var o = {
                    "M+": date.getMonth() + 1,
                    "d+": date.getDate(),
                    "h+": date.getHours(),
                    "m+": date.getMinutes(),
                    "s+": date.getSeconds(),
                    "q+": Math.floor((date.getMonth() + 3) / 3),
                    "S": date.getMilliseconds()
                };
                if (/(y+)/.test(fmt))
                    fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
                for (var k in o)
                    if (new RegExp("(" + k + ")").test(fmt))
                        fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
                return fmt;
            }
            static getTime(date) {
                date = date.toString().length == 10 ? date * 1000 : date;
                let time = new Date(date);
                let language = localStorage.getItem("language");
                if (!language || language == 'en') {
                    return new Date(time).toUTCString();
                }
                else {
                    return this.dateFtt("yyyy/MM/dd hh:mm:ss", new Date(time));
                }
            }
            static getDate(time) {
                if (typeof time == "number") {
                    time = (time.toString().length < 14) ? time * 1000 : time;
                    return new Date(time);
                }
                else {
                    return new Date(time);
                }
            }
        }
        tools.DateTool = DateTool;
    })(tools = EasyCheers.tools || (EasyCheers.tools = {}));
})(EasyCheers || (EasyCheers = {}));
var EasyCheers;
(function (EasyCheers) {
    var tools;
    (function (tools) {
        class WWW {
            static makeRpcUrl(url, method, ..._params) {
                if (url[url.length - 1] != '/')
                    url = url + "/";
                var urlout = url + "?jsonrpc=2.0&id=1&method=" + method + "&params=[";
                for (var i = 0; i < _params.length; i++) {
                    urlout += JSON.stringify(_params[i]);
                    if (i != _params.length - 1)
                        urlout += ",";
                }
                urlout += "]";
                return urlout;
            }
            static makeRpcPostBody(method, ..._params) {
                var body = {};
                body["jsonrpc"] = "2.0";
                body["id"] = 1;
                body["method"] = method;
                var params = [];
                for (var i = 0; i < _params.length; i++) {
                    params.push(_params[i]);
                }
                body["params"] = params;
                return body;
            }
            static gettransbyaddress(address, pagesize, pageindex) {
                return __awaiter(this, void 0, void 0, function* () {
                    var postdata = WWW.makeRpcPostBody("gettransbyaddress", address, pagesize, pageindex);
                    var result = yield fetch(WWW.apiaggr, { "method": "post", "body": JSON.stringify(postdata) });
                    var json = yield result.json();
                    var r = json["result"];
                    return r;
                });
            }
            static gettransbyaddressnew(address, pagesize, pageindex) {
                return __awaiter(this, void 0, void 0, function* () {
                    var postdata = WWW.makeRpcPostBody("gettransbyaddressNew", address, pagesize, pageindex);
                    var result = yield fetch(WWW.apiaggr, { "method": "post", "body": JSON.stringify(postdata) });
                    var json = yield result.json();
                    var r = json["result"];
                    return r ? r : [];
                });
            }
            static api_getHeight() {
                return __awaiter(this, void 0, void 0, function* () {
                    var str = WWW.makeRpcUrl(WWW.api, "getblockcount");
                    var result = yield fetch(str, { "method": "get" });
                    var json = yield result.json();
                    var r = json["result"];
                    var height = parseInt(r[0]["blockcount"]) - 1;
                    return height;
                });
            }
            static api_getBlockInfo(index) {
                return __awaiter(this, void 0, void 0, function* () {
                    var str = WWW.makeRpcUrl(WWW.api, "getblocktime", index);
                    var result = yield fetch(str, { "method": "get" });
                    var json = yield result.json();
                    var r = json["result"];
                    var time = parseInt(r[0]["time"]);
                    return time;
                });
            }
            static api_getAllAssets() {
                return __awaiter(this, void 0, void 0, function* () {
                    var str = WWW.makeRpcUrl(WWW.api, "getallasset");
                    var result = yield fetch(str, { "method": "get" });
                    var json = yield result.json();
                    var r = json["result"];
                    return r;
                });
            }
            static api_getUTXO(address) {
                return __awaiter(this, void 0, void 0, function* () {
                    var str = WWW.makeRpcUrl(WWW.api, "getutxo", address);
                    var result = yield fetch(str, { "method": "get" });
                    var json = yield result.json();
                    var r = json["result"];
                    return r;
                });
            }
            static api_hasclaimgas(address) {
                return __awaiter(this, void 0, void 0, function* () {
                    var postdata = WWW.makeRpcPostBody("hasclaimgas", address);
                    var result = yield fetch(WWW.apiaggr, { "method": "post", "body": JSON.stringify(postdata) });
                    var json = yield result.json();
                    var r = json["result"];
                    return r;
                });
            }
            static api_claimgas(address, num) {
                return __awaiter(this, void 0, void 0, function* () {
                    var postdata = WWW.makeRpcPostBody("claimgas", address, num);
                    var result = yield fetch(WWW.apiaggr, { "method": "post", "body": JSON.stringify(postdata) });
                    var json = yield result.json();
                    var r = json["result"];
                    return r;
                });
            }
            static api_getnep5Balance(address) {
                return __awaiter(this, void 0, void 0, function* () {
                    var str = WWW.makeRpcUrl(WWW.api, "getallnep5assetofaddress", address, 1);
                    var result = yield fetch(str, { "method": "get" });
                    var json = yield result.json();
                    var r = json["result"];
                    return r;
                });
            }
            static api_getBalance(address) {
                return __awaiter(this, void 0, void 0, function* () {
                    var str = WWW.makeRpcUrl(WWW.api, "getbalance", address);
                    var value = yield fetch(str, { "method": "get" });
                    var json = yield value.json();
                    var r = json["result"];
                    return r;
                });
            }
            static getNep5Asset(asset) {
                return __awaiter(this, void 0, void 0, function* () {
                    var postdata = WWW.makeRpcPostBody("getnep5asset", asset);
                    console.log(postdata);
                    var result = yield fetch(WWW.api, { "method": "post", "body": JSON.stringify(postdata) });
                    var json = yield result.json();
                    var r = json["result"][0];
                    if (json["result"]) {
                        var r = json["result"][0];
                        return r;
                    }
                    else {
                        throw "not data";
                    }
                });
            }
            static getnep5balanceofaddress(asset, address) {
                return __awaiter(this, void 0, void 0, function* () {
                    var postdata = WWW.makeRpcPostBody("getnep5balanceofaddress", asset, address);
                    var result = yield fetch(WWW.api, { "method": "post", "body": JSON.stringify(postdata) });
                    var json = yield result.json();
                    var r = json["result"][0];
                    return r;
                });
            }
            static api_getAddressTxs(address, size, page) {
                return __awaiter(this, void 0, void 0, function* () {
                    var postdata = WWW.makeRpcPostBody("getaddresstxs", address, size, page);
                    var result = yield fetch(WWW.api, { "method": "post", "body": JSON.stringify(postdata) });
                    var json = yield result.json();
                    var r = json["result"];
                    return r;
                });
            }
            static api_postRawTransaction(data) {
                return __awaiter(this, void 0, void 0, function* () {
                    console.log("===================================这里是交易体的 Hex========" + data.toHexString());
                    var postdata = WWW.makeRpcPostBody("sendrawtransaction", data.toHexString());
                    var result = yield fetch(WWW.api, { "method": "post", "body": JSON.stringify(postdata) });
                    var json = yield result.json();
                    if (json["result"]) {
                        var r = json["result"][0];
                        return r;
                    }
                    else {
                        throw json['error'];
                    }
                });
            }
            static api_getclaimgas(address, type) {
                return __awaiter(this, void 0, void 0, function* () {
                    if (type)
                        var str = WWW.makeRpcUrl(WWW.api, "getclaimgas", address, type);
                    else
                        var str = WWW.makeRpcUrl(WWW.api, "getclaimgas", address);
                    var result = yield fetch(str, { "method": "get" });
                    var json = yield result.json();
                    var r = json["result"];
                    if (r == undefined)
                        return { gas: 0 };
                    return r[0];
                });
            }
            static api_getclaimtxhex(address) {
                return __awaiter(this, void 0, void 0, function* () {
                    var str = WWW.makeRpcUrl(WWW.api, "getclaimtxhex", address);
                    var result = yield fetch(str, { "method": "get" });
                    var json = yield result.json();
                    var r = json["result"];
                    if (r == undefined)
                        return "";
                    return r[0]["claimtxhex"];
                });
            }
            static rpc_getHeight() {
                return __awaiter(this, void 0, void 0, function* () {
                    var str = WWW.makeRpcUrl(WWW.api, "getblockcount");
                    var result = yield fetch(str, { "method": "get" });
                    var json = yield result.json();
                    var r = json["result"];
                    var height = parseInt(r) - 1;
                    return height;
                });
            }
            static rpc_getStorage(scripthash, key) {
                return __awaiter(this, void 0, void 0, function* () {
                    var str = WWW.makeRpcUrl(WWW.api, "getstorage", scripthash.toHexString(), key.toHexString());
                    var result = yield fetch(str, { "method": "get" });
                    var json = yield result.json();
                    if (json["result"] == null)
                        return null;
                    var r = json["result"];
                    return r;
                });
            }
            static rpc_getInvokescript(scripthash) {
                return __awaiter(this, void 0, void 0, function* () {
                    var str = WWW.makeRpcUrl(WWW.api, "invokescript", scripthash.toHexString());
                    console.log(str);
                    var result = yield fetch(str, { "method": "get" });
                    var json = yield result.json();
                    console.log(json);
                    if (json["result"] == null)
                        return null;
                    var r = json["result"][0];
                    return r;
                });
            }
            static getrawtransaction(txid) {
                return __awaiter(this, void 0, void 0, function* () {
                    var str = WWW.makeRpcUrl(WWW.api, "getrawtransaction", txid);
                    var result = yield fetch(str, { "method": "get" });
                    var json = yield result.json();
                    if (!json["result"])
                        return null;
                    var r = json["result"][0];
                    return r;
                });
            }
            static getnep5transferbytxid(txid) {
                return __awaiter(this, void 0, void 0, function* () {
                    var str = WWW.makeRpcUrl(WWW.api, "getnep5transferbytxid", txid);
                    var result = yield fetch(str, { "method": "get" });
                    var json = yield result.json();
                    if (!json["result"])
                        return null;
                    var r = json["result"][0];
                    return r;
                });
            }
            static api_getcontractstate(scriptaddr) {
                return __awaiter(this, void 0, void 0, function* () {
                    var str = WWW.makeRpcUrl(WWW.api, "getcontractstate", scriptaddr);
                    var value = yield fetch(str, { "method": "get" });
                    var json = yield value.json();
                    var r = json["result"][0];
                    return r;
                });
            }
            static api_getbonushistbyaddress(address, currentpage, pagesize) {
                return __awaiter(this, void 0, void 0, function* () {
                    var postdata = WWW.makeRpcPostBody("getbonushistbyaddress", address, currentpage, pagesize);
                    var result = yield fetch(WWW.apiaggr, { "method": "post", "body": JSON.stringify(postdata) });
                    var json = yield result.json();
                    var r = json["result"][0];
                    return r;
                });
            }
            static getavailableutxos(address, count) {
                return __awaiter(this, void 0, void 0, function* () {
                    var postdata = WWW.makeRpcPostBody("getavailableutxos", address, count);
                    var result = yield fetch(WWW.apiaggr, { "method": "post", "body": JSON.stringify(postdata) });
                    var json = yield result.json();
                    var r = json["result"];
                    return r;
                });
            }
            static rechargeandtransfer(data1, data2) {
                return __awaiter(this, void 0, void 0, function* () {
                    var postdata = WWW.makeRpcPostBody("rechargeandtransfer", data1.toHexString(), data2.toHexString());
                    var result = yield fetch(WWW.apiaggr, { "method": "post", "body": JSON.stringify(postdata) });
                    var json = yield result.json();
                    var r = json["result"][0];
                    return r;
                });
            }
            static getrechargeandtransfer(txid) {
                return __awaiter(this, void 0, void 0, function* () {
                    var postdata = WWW.makeRpcPostBody("getrechargeandtransfer", txid);
                    var result = yield fetch(WWW.apiaggr, { "method": "post", "body": JSON.stringify(postdata) });
                    var json = yield result.json();
                    var r = json["result"][0];
                    return r;
                });
            }
            static getNotify(txid) {
                return __awaiter(this, void 0, void 0, function* () {
                    var postdata = WWW.makeRpcPostBody("getnotify", txid);
                    var result = yield fetch(WWW.api, { "method": "post", "body": JSON.stringify(postdata) });
                    var json = yield result.json();
                    var r = json["result"][0];
                    return r;
                });
            }
            static hastx(txid) {
                return __awaiter(this, void 0, void 0, function* () {
                    var postdata = WWW.makeRpcPostBody("hastx", txid);
                    var result = yield fetch(WWW.apiaggr, { "method": "post", "body": JSON.stringify(postdata) });
                    var json = yield result.json();
                    var r = json["result"][0];
                    return r;
                });
            }
            static hascontract(txid) {
                return __awaiter(this, void 0, void 0, function* () {
                    var postdata = WWW.makeRpcPostBody("hascontract", txid);
                    var result = yield fetch(WWW.apiaggr, { "method": "post", "body": JSON.stringify(postdata) });
                    var json = yield result.json();
                    var r = json["result"][0];
                    return r;
                });
            }
            static getbonushistbyaddress(address, page, pagesize) {
                return __awaiter(this, void 0, void 0, function* () {
                    var postdata = WWW.makeRpcPostBody("getbonushistbyaddress", address, page, pagesize);
                    var result = yield fetch(WWW.apiaggr, { "method": "post", "body": JSON.stringify(postdata) });
                    var json = yield result.json();
                    if (json["result"]) {
                        var r = json["result"][0];
                        return r;
                    }
                    else {
                        throw "not data";
                    }
                });
            }
            static getbonusbyaddress(address, page, pagesize) {
                return __awaiter(this, void 0, void 0, function* () {
                    var postdata = WWW.makeRpcPostBody("getbonusbyaddress", address, page, pagesize);
                    var result = yield fetch(WWW.apiaggr, { "method": "post", "body": JSON.stringify(postdata) });
                    var json = yield result.json();
                    if (json["result"]) {
                        var r = json["result"][0];
                        return r;
                    }
                    else {
                        throw "not data";
                    }
                });
            }
            static getcurrentbonus(addr) {
                return __awaiter(this, void 0, void 0, function* () {
                    var postdata = WWW.makeRpcPostBody("getcurrentbonus", addr);
                    var result = yield fetch(WWW.apiaggr, { "method": "post", "body": JSON.stringify(postdata) });
                    var json = yield result.json();
                    if (json["result"]) {
                        var r = json["result"][0];
                        return r;
                    }
                    else {
                        throw "not data";
                    }
                });
            }
            static applybonus(addr) {
                return __awaiter(this, void 0, void 0, function* () {
                    var postdata = WWW.makeRpcPostBody("applybonus", addr);
                    var result = yield fetch(WWW.apiaggr, { "method": "post", "body": JSON.stringify(postdata) });
                    var json = yield result.json();
                    if (json["result"]) {
                        var r = json["result"][0];
                        return r;
                    }
                    else {
                        throw "not data";
                    }
                });
            }
        }
        WWW.api = "https://api.nel.group/api/testnet";
        WWW.apiaggr = "https://apiwallet.nel.group/api/testnet";
        tools.WWW = WWW;
    })(tools = EasyCheers.tools || (EasyCheers.tools = {}));
})(EasyCheers || (EasyCheers = {}));
//# sourceMappingURL=code.js.map