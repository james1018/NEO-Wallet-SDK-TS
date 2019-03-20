
namespace EasyCheers {

    export class Main {

        private static is_logined: boolean;
        
        private static newWallet : ThinNeo.nep6wallet;
        private static download_href:string;
        private static download_name:string;

        static randNumber: number; // 随机数

        // main定时任务相关
        private static s_update: any; // 定时器标识
        private static update_timeout_max: number;
        private static update_timeout_min: number;

        private static oldBlock:any;
        private static heightChangedCallback : Function;
        private neoasset;
        private balances;
        private ectBalance;

        constructor() {
            // 初始化
            Main.randNumber = parseInt((Math.random() * 10000000).toString())

            this.reset(0)
            Main.update_timeout_max = 5000;
            Main.update_timeout_min = 300;
            Main.heightChangedCallback = null;

            Main.newWallet = new ThinNeo.nep6wallet();
            Main.oldBlock = new tools.SessionStoreTool("block");
            this.neoasset = new NeoAsset();
            this.neoasset.gas = 0;
            this.neoasset.neo = 0;
            this.neoasset.claim = '';
            this.balances = new Array();
            this.ectBalance = 0;
            // NEO的随机数生成器
            Neo.Cryptography.RandomNumberGenerator.startCollectors();
        }

        // 复位
        reset(type = 0): void {
            this.clearTimer()
        }

        // 清理定时任务
        clearTimer(): void {
            if (Main.s_update) {
                clearTimeout(Main.s_update)
                this.update()
            }
        }
        
        setHeightChangedCallback(callback): void {
            Main.heightChangedCallback = callback;
        }

        // SDK创建钱包
        createWallet(passwd, callback, name = 'NeoWallet'): void {
            
            console.log("[Easy]", '[SDK]', 'Create ...')

            var array = new Uint8Array(32);
            var key = Neo.Cryptography.RandomNumberGenerator.getRandomValues<Uint8Array>(array);
            var pubkey = ThinNeo.Helper.GetPublicKeyFromPrivateKey(key);
            var addr = ThinNeo.Helper.GetAddressFromPublicKey(pubkey);
            //this.moudle_download = true;
            console.log(pubkey);
            console.log(addr);

            Main.newWallet.scrypt = new ThinNeo.nep6ScryptParameters();
            Main.newWallet.scrypt.N = 16384;
            Main.newWallet.scrypt.r = 8;
            Main.newWallet.scrypt.p = 8;
            Main.newWallet.accounts = [];
            Main.newWallet.accounts[ 0 ] = new ThinNeo.nep6account();
            Main.newWallet.accounts[ 0 ].address = addr;
            
            ThinNeo.Helper.GetNep2FromPrivateKey(key, passwd, Main.newWallet.scrypt.N, Main.newWallet.scrypt.r, Main.newWallet.scrypt.p, (info, result) =>
            {
                if (info == "finish")
                {
                    Main.newWallet.accounts[ 0 ].nep2key = result;
                    Main.newWallet.accounts[ 0 ].contract = new ThinNeo.contract();
                    var pubkey = ThinNeo.Helper.GetPublicKeyFromPrivateKey(key);
                    Main.newWallet.accounts[ 0 ].contract.script = ThinNeo.Helper.GetAddressCheckScriptFromPublicKey(pubkey).toHexString();
                    var jsonstr = JSON.stringify(Main.newWallet.toJson());
                    var blob = new Blob([ ThinNeo.Helper.String2Bytes(jsonstr) ]);
                    Main.download_href = URL.createObjectURL(blob);
                    Main.download_name = name + ".json";
                    console.log("[Easy]", '[SDK]', 'Create Done')
                    var wif = ThinNeo.Helper.GetWifFromPrivateKey(key);
                    if (callback) callback(result, wif);
                }
            });
        }

        // 钱包登录
        async login(passwd, walletStr) { 
            console.log("[Easy]", '[SDK]', 'File Login ...')
            Main.newWallet.fromJsonStr(walletStr);

            if (!!Main.newWallet.accounts)
            {
                try
                {
                    let loginarray = await tools.neotool.nep6Load(Main.newWallet, passwd)
                    let data = {} as currentInfo;
                    data.type = LoginType.nep6;
                    data.msg = {}
                    Main.newWallet.accounts.map(account =>
                    {
                    data[ "msg" ][ account.address ] = account.nep2key;
                    });
                    LoginInfo.info = loginarray[ Main.newWallet.accounts[ 0 ].address ];
                    console.log(loginarray);
                    sessionStorage.setItem('login-info-arr', JSON.stringify(data));
                    LoginInfo.setCurrentAddress(Main.newWallet.accounts[ 0 ].address);
                    console.log("login succ:", Main.newWallet.accounts[ 0 ].address);
                    console.log(Main.newWallet);
                    Main.is_logined = true;
                    this.update();
                    await this.getBalances();

                } catch (error)
                {
                    console.error("load wallet error");
                }
            }
            
        }

        // wif登录
        async loginWif(awif, callback) { 
            console.log("[Easy]", '[SDK]', 'wif Login ...')
            var res = tools.neotool.wifDecode(awif);
            if (res.err){
                console.log("wif login err");
                if (callback) callback(false);
            }
            else
            {
                var login: LoginInfo = res.info;
                LoginInfo.info = res.info;
                let data = {} as currentInfo;
                data.type = LoginType.wif;
                data.msg = {wif: awif};
                sessionStorage.setItem('login-info-arr', JSON.stringify(data));
                LoginInfo.setCurrentAddress(login.address);

                Main.is_logined = true;
                this.update();
                await this.getBalances();

                if (callback) callback(true);
            }
        }

        // nep2登录
        async loginNep2(nep2, passwd, callback) { 
            console.log("[Easy]", '[SDK]', 'nep2 Login ...')
            var res = await tools.neotool.nep2ToWif(nep2, passwd);
            if (res.err){
                console.log("nep2 login err");
                if (callback) callback(false);
            }
            else
            {
                var login: LoginInfo = res.info;
                LoginInfo.info = res.info;
                let data = {} as currentInfo;
                data.type = LoginType.nep2;
                data.msg = {};
                data.msg[login.address] = nep2;
                sessionStorage.setItem('login-info-arr', JSON.stringify(data));
                LoginInfo.setCurrentAddress(login.address);

                Main.is_logined = true;
                this.update();
                await this.getBalances();
                
                if (callback) callback(true);
            }
        }

        async interGetHeight() {
            //var height = await tools.WWW["api_getHeight_" + type]()
            var height = await tools.WWW.api_getHeight();
            return height;
        }

        setHeight(height) {
            Main.oldBlock.put("height", height);
        }

        // 对外接口：SDK获取高度
        getHeight() {
            return Main.oldBlock.select("height");
        }

        async getBalances()
        {
            let cur_addr = LoginInfo.getCurrentAddress();
            tools.CoinTool.initAllAsset();
            var balances = await tools.WWW.api_getBalance(cur_addr) as BalanceInfo[];
            var claims = await tools.WWW.api_getclaimgas(cur_addr, 0);
            var claims2 = await tools.WWW.api_getclaimgas(cur_addr, 1);
            var nep5balances = await tools.WWW.api_getnep5Balance(cur_addr) as Nep5Balance[];
            let height = await tools.WWW.api_getHeight();

            if (balances) 
            {
                let sum1 = Neo.Fixed8.parse(claims["gas"].toFixed(8));
                let sum2 = Neo.Fixed8.parse(claims2["gas"].toFixed(8));
                let sum = sum1.add(sum2).toString();
                this.neoasset.claim = sum;

                balances.forEach(
                    balance => {
                        if (balance.asset == tools.CoinTool.id_NEO){
                            this.neoasset.neo = balance.balance;
                        }
                        if (balance.asset == tools.CoinTool.id_GAS) {
                            this.neoasset.gas = balance.balance;
                        }
                    }
                );
            }

            if (nep5balances)
            {
                const ect = '0x' + tools.CoinTool.id_ECT.toString();
                console.log("Keys:", ect);

                Object.keys(nep5balances).filter( (keys: string)=>
                {
                    if (nep5balances[keys].assetId == ect)
                    {
                        this.ectBalance = nep5balances[keys].balance;
                        return true;
                    }
                    return false;
                })
            }
            this.balances = await BalanceInfo.getBalancesByArr(balances, nep5balances, height);
            console.log("[Easy]", '[main]', 'getBalances ...', this.getNeo(), '  ', this.getGas(), '  ', this.getEct())
        }

        getNeo()
        {
            return this.neoasset.neo;
        }
        getGas()
        {
            return this.neoasset.gas;
        }
        getEct()
        {
            return this.ectBalance;
        }

        /*
        async getBalanceOf(addr: string, assetId: Neo.Uint160)
        {
            let who = new Neo.Uint160(ThinNeo.Helper.GetPublicKeyScriptHash_FromAddress(addr).buffer);
            let info = await tools.Contract.contractInvokeScript(
                assetId, "balanceOf", "(hex160)" + who.toString()
            );

            var stackarr = info[ "stack" ] as any[];
            let stack = ResultItem.FromJson(DataType.Array, stackarr);
            let num = stack.subItem[ 0 ].AsInteger();
            //let res = accDiv(num.toString(), 100000000);
            //return res.toString();
            return num.toString();
        }

        // 对外接口：SDK合约交易
        async nep5Transaction(to: string, num: number) {
            var sgasaddr = ThinNeo.Helper.GetAddressFromScriptHash(tools.CoinTool.id_SGAS);
            let res = tools.CoinTool.nep5Transaction(LoginInfo.getCurrentAddress(), to, sgasaddr, num);
            return res;
        }
        */           
        // SDK判断是否登录
        isLogined() {
            return Main.is_logined;
        }

        // SDK登出回调
        async logoutCallback() {
            // 信息清理
            this.reset(0)

            // 页面登录的退回
            window.history.back();
        }

        // 主定时器
        async update() {
            // update间隔时间判定
            var timeout = Main.update_timeout_min;
            if (Main.is_logined) {
                timeout = Main.update_timeout_max;
            }

            let height = await this.interGetHeight();
            console.log("[Easy]", '[main]', 'update ...', timeout, '  ', height);
            let oldHeight = this.getHeight();
            if (oldHeight) {
                if (height > oldHeight) {
                    this.setHeight(height);
                    if (Main.heightChangedCallback) Main.heightChangedCallback();
                }
            }
            else
            {
                this.setHeight(height);
            }
            Main.s_update = setTimeout(() => { this.update() }, timeout);
        }
        
        // 从url地址获取参数
        static getUrlParam(name) {
            var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象
            var r = window.location.search.substr(1).match(reg);  //匹配目标参数
            if (r != null) {
                return unescape(r[2]);
            }
            return null; //返回参数值
        }

        // 判断钱包是否打开
        static isWalletOpen(): boolean {
            if (Main.is_logined) {
                return true;
            }
            return false;
        }


        // 通过时间戳获取日期
        static getDate(timeString: string) {
            if (timeString != "0" && timeString != "") {
                var date = new Date(parseInt(timeString) * 1000);
                var fmt = "yyyy-MM-dd hh:mm:ss";
                var o = {
                    "M+": date.getMonth() + 1, //月份
                    "d+": date.getDate(), //日
                    "h+": date.getHours(), //小时
                    "m+": date.getMinutes(), //分
                    "s+": date.getSeconds(), //秒
                    "q+": Math.floor((date.getMonth() + 3) / 3), //季度
                    S: date.getMilliseconds() //毫秒
                };
                if (/(y+)/.test(fmt))
                    fmt = fmt.replace(
                        RegExp.$1,
                        (date.getFullYear() + "").substr(4 - RegExp.$1.length)
                    );
                for (var k in o)
                    if (new RegExp("(" + k + ")").test(fmt))
                        fmt = fmt.replace(
                            RegExp.$1,
                            RegExp.$1.length == 1
                                ? o[k]
                                : ("00" + o[k]).substr(("" + o[k]).length)
                        );
                return fmt;
            }
            return "";
        }

        // 获取obj类名
        static getObjectClass(obj) {
            if (obj && obj.constructor && obj.constructor.toString()) {
                /*
                 * for browsers which have name property in the constructor
                 * of the object,such as chrome 
                 */
                if (obj.constructor.name) {
                    return obj.constructor.name;
                }
                var str = obj.constructor.toString();
                /*
                 * executed if the return of object.constructor.toString() is 
                 * "[object objectClass]"
                 */
                if (str.charAt(0) == '[') {
                    var arr = str.match(/\[\w+\s*(\w+)\]/);
                } else {
                    /*
                     * executed if the return of object.constructor.toString() is 
                     * "function objectClass () {}"
                     * for IE Firefox
                     */
                    var arr = str.match(/function\s*(\w+)/);
                }
                if (arr && arr.length == 2) {
                    return arr[1];
                }
            }
            return undefined;
        };
        
        
        // JS科学计数转换string
        static getStringNumber(num: number): string {
            let num_str = num.toString()
            if (num_str.indexOf('-') >= 0) {
                num_str = '0' + (num + 1).toString().substr(1)
            }
            return num_str;
        }

        // 随机数组
        static randomSort(arr, newArr) {
            // 如果原数组arr的length值等于1时，原数组只有一个值，其键值为0
            // 同时将这个值push到新数组newArr中
            if (arr.length == 1) {
                newArr.push(arr[0]);
                return newArr; // 相当于递归退出
            }
            // 在原数组length基础上取出一个随机数
            var random = Math.ceil(Math.random() * arr.length) - 1;
            // 将原数组中的随机一个值push到新数组newArr中
            newArr.push(arr[random]);
            // 对应删除原数组arr的对应数组项
            arr.splice(random, 1);
            return Main.randomSort(arr, newArr);
        }

        static check(){
            //判断访问设备，方便后面针对不同设备调用代码  
            var dev = "";  
            if ((navigator.userAgent.match(/(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i))) {  
                //设备为移动端  
                dev = "mobile";  
            }  
            else {  
                //设备为pc  
                dev = "pc";  
            }  
            return dev;
        }

        static in_array(search:string, array: Array<string>)
        {
            for (let k=0; k<array.length; k++) {
                if (array[k] == search) {
                    return true
                }
            }
            return false
        }
    }
}