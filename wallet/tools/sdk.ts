
namespace EasyCheers {

    export class SDK {

        private static is_init: boolean = false;
        private static main: Main;

        // SDK initiation
        static init(): void {
            console.log("[Easy]", '[SDK]', 'init ...')

            if (SDK.is_init === false) {
                SDK.main = new Main();
            }
            SDK.is_init = true;
        }

        // register callback function
        static registerHeightChangedCallback(callback = null): void {
            console.log("[Easy]", '[SDK]', 'registerHeightChangedCallback ...')

            if (SDK.is_init === false) {
                console.log("[Easy]", '[SDK]', 'You have to call function init first')
                return;
            }
            if (!SDK.main.isLogined()) {
                console.log("[Easy]", '[SDK]', 'You have to login first')
                return;
            }
            SDK.main.setHeightChangedCallback(callback);
        }
        
        // SDK  create account
        static createWallet(passwd, callback = null){
            SDK.main.createWallet(passwd, callback);
        }
        
        // file login
        static login(passwd, wallet) {
            if (SDK.is_init === false) {
                console.log("[Easy]", '[SDK]', 'You have to call function init first')
                return;
            }
            SDK.main.login(passwd, wallet);
        }

        // wif login
        static loginWif(wif, callback = null) {
            if (SDK.is_init === false) {
                console.log("[Easy]", '[SDK]', 'You have to call function init first')
                return;
            }
            console.log(wif);
            SDK.main.loginWif(wif, callback);
        }
        // nep2 login
        static loginNep2(nep2, passwd, callback = null) {
            if (SDK.is_init === false) {
                console.log("[Easy]", '[SDK]', 'You have to call function init first')
                return;
            }
            console.log(nep2);
            console.log(passwd);
            SDK.main.loginNep2(nep2, passwd, callback);
        }
        
        // get value from NEP5-contract
        static async contractGetValue(assetID: string, method: string, addr: string, callback = null) {
            if (SDK.is_init === false) {
                console.log("[Easy]", '[SDK]', 'You have to call function init first')
                return;
            }
            if (!SDK.main.isLogined()) {
                console.log("[Easy]", '[SDK]', 'You have to login first')
                return;
            }

            //var scr = assetID.hexToBytes().reverse();
            let asid:Neo.Uint160 = Neo.Uint160.parse(assetID.replace("0x", ""));
            let res = await tools.Contract.contractInvokeScript(asid, method, addr);
            var stackArr = res["stack"] as any[];
            let stack = ResultItem.FromJson(DataType.Array, stackArr).subItem[0];
            let value = stack.AsInteger();
            if (callback != null)  callback(value);
        }

        // get the number of NEO and GAS
        static async getBalances(callback = null) {
            if (SDK.is_init === false) {
                console.log("[Easy]", '[SDK]', 'You have to call function init first')
                return;
            }
            if (!SDK.main.isLogined()) {
                console.log("[Easy]", '[SDK]', 'You have to login first')
                return;
            }


            await SDK.main.getBalances();
            if (callback != null)  callback(SDK.main.getNeo(), SDK.main.getGas());
        }

        // get the current address which have logined
        static getCurrentAddr() {
            if (SDK.is_init === false) {
                console.log("[Easy]", '[SDK]', 'You have to call function init first')
                return;
            }
            if (!SDK.main.isLogined()) {
                console.log("[Easy]", '[SDK]', 'You have to login first')
                return;
            }


            return LoginInfo.getCurrentAddress();
        }
        
        // call NEP5-contract api to transfer NEP5 asset
        static async transferNep5(assetId: string, to: string, amount: string, callback = null) {
            if (SDK.is_init === false) {
                console.log("[Easy]", '[SDK]', 'You have to call function init first')
                return;
            }
            if (!SDK.main.isLogined()) {
                console.log("[Easy]", '[SDK]', 'You have to login first')
                return;
            }

            let value = parseFloat(amount);
            let res = await tools.CoinTool.nep5Transaction(LoginInfo.getCurrentAddress(), to, assetId, value);
            if (callback != null)  callback(JSON.stringify(res));
        }

        // transfer global asset, for example, NEO or GAS
        static async transferGlobalAsset(assetId: string, to: string, amount: string, callback = null) {
            if (SDK.is_init === false) {
                console.log("[Easy]", '[SDK]', 'You have to call function init first')
                return;
            }
            if (!SDK.main.isLogined()) {
                console.log("[Easy]", '[SDK]', 'You have to login first')
                return;
            }

            let res = await tools.CoinTool.rawTransaction(to, assetId, amount);
            if (callback != null)  callback(JSON.stringify(res));
        }

        static getNeo()
        {
            return this.main.getNeo();
        }
        static getGas()
        {
            return this.main.getGas();
        }
        static getEct()
        {
            return this.main.getEct();
        }

        // call bet-contract api to bet 
        static async bet(contractHash: string, address: string, max: string, odds: string, callback = null) {
            if (SDK.is_init === false) {
                console.log("[Easy]", '[SDK]', 'You have to call function init first')
                return;
            }
            if (!SDK.main.isLogined()) {
                console.log("[Easy]", '[SDK]', 'You have to login first')
                return;
            }

            let intMax = parseFloat(max);
            let intOdds = parseFloat(odds);
            let res = await tools.CoinTool.bet(contractHash, address, intMax, intOdds);
            if (callback != null)  callback(JSON.stringify(res));
        }

    }  

    
}