declare namespace EasyCheers {
    class Main {
        private static is_logined;
        private static newWallet;
        private static download_href;
        private static download_name;
        static randNumber: number;
        private static s_update;
        private static update_timeout_max;
        private static update_timeout_min;
        private static oldBlock;
        private static heightChangedCallback;
        private neoasset;
        private balances;
        private ectBalance;
        constructor();
        reset(type?: number): void;
        clearTimer(): void;
        setHeightChangedCallback(callback: any): void;
        createWallet(passwd: any, callback: any, name?: string): void;
        login(passwd: any, walletStr: any): Promise<void>;
        loginWif(awif: any, callback: any): Promise<void>;
        loginNep2(nep2: any, passwd: any, callback: any): Promise<void>;
        interGetHeight(): Promise<number>;
        setHeight(height: any): void;
        getHeight(): any;
        getBalances(): Promise<void>;
        getNeo(): any;
        getGas(): any;
        getEct(): any;
        isLogined(): boolean;
        logoutCallback(): Promise<void>;
        update(): Promise<void>;
        static getUrlParam(name: any): string;
        static isWalletOpen(): boolean;
        static getDate(timeString: string): string;
        static getObjectClass(obj: any): any;
        static getStringNumber(num: number): string;
        static randomSort(arr: any, newArr: any): any;
        static check(): string;
        static in_array(search: string, array: Array<string>): boolean;
    }
}
declare namespace EasyCheers.tools {
    class CoinTool {
        static readonly id_GAS: string;
        static readonly id_NEO: string;
        static readonly id_SGAS: Neo.Uint160;
        static readonly id_NNC: Neo.Uint160;
        static readonly dapp_nnc: Neo.Uint160;
        static readonly id_ECT: Neo.Uint160;
        static assetID2name: {
            [id: string]: string;
        };
        static name2assetID: {
            [id: string]: string;
        };
        static initAllAsset(): Promise<void>;
        static getassets(): Promise<{
            [id: string]: UTXO[];
        }>;
        static makeTran(utxos: {
            [id: string]: UTXO[];
        }, targetaddr: string, assetid: string, sendcount: Neo.Fixed8): Result;
        static creatInuptAndOutup(utxos: UTXO[], sendcount: Neo.Fixed8, target?: string): {
            inputs: ThinNeo.TransactionInput[];
            outputs: ThinNeo.TransactionOutput[];
            oldutxo: OldUTXO[];
        };
        static signData(tran: ThinNeo.Transaction): Promise<Uint8Array>;
        static rawTransaction(targetaddr: string, asset: string, count: string): Promise<Result>;
        static claimgas(): Promise<any>;
        static claimGas(): Promise<any>;
        static contractInvokeTrans(script: Uint8Array): Promise<Result>;
        static nep5Transaction(address: string, tatgeraddr: string, asset: string, amount: number): Promise<Result>;
        static getavailableutxos(count: number): Promise<{
            [id: string]: UTXO[];
        }>;
        static bet(contractHash: string, address: string, max: number, odds: number): Promise<Result>;
    }
}
declare namespace EasyCheers.tools {
    class Contract {
        constructor();
        static buildScript(appCall: Neo.Uint160, method: string, param: string[]): Uint8Array;
        static buildScript_random(appCall: Neo.Uint160, method: string, param: any[]): Uint8Array;
        static buildScript_random_array(sbarr: ScriptEntity[]): Uint8Array;
        static buildInvokeTransData_attributes(script: Uint8Array): Promise<Uint8Array>;
        static buildInvokeTransData(...param: any[]): Promise<{
            data: Uint8Array;
            tranmsg: Result;
        }>;
        static contractInvokeScript(appCall: Neo.Uint160, method: string, ...param: string[]): Promise<any>;
        static contractInvokeTrans_attributes(script: Uint8Array): Promise<Result>;
        static contractInvokeTrans(...param: any[]): Promise<any>;
        static getNotifyNames(txid: string): Promise<string[]>;
    }
    class ScriptEntity {
        constructor(appCall: Neo.Uint160, method: string, param: any[]);
        appCall: Neo.Uint160;
        method: string;
        param: any[];
    }
}
declare namespace EasyCheers {
    interface currentInfo {
        type: LoginType;
        msg: {};
    }
    enum LoginType {
        wif = 0,
        nep2 = 1,
        nep6 = 2,
        otcgo = 3
    }
    class alert {
        static alert: HTMLDivElement;
        static title: HTMLDivElement;
        static alertBox: HTMLDivElement;
        static alertError: HTMLDivElement;
        static btn_close: HTMLButtonElement;
        static input: HTMLInputElement;
        static btn_confirm: HTMLButtonElement;
        constructor();
        static show(title: string, inputType: string, btnText: string, call: any): void;
        static close(): void;
        static error(msg: string): void;
    }
    class LoginInfo {
        pubkey: Uint8Array;
        prikey: Uint8Array;
        address: string;
        nep2: string;
        payfee: boolean;
        static info: LoginInfo;
        static deblocking(): Promise<LoginInfo>;
        static alert(call: any): void;
        static ArrayToString(array: LoginInfo[]): string;
        static StringToArray(str: string): LoginInfo[];
        static getCurrentLogin(): LoginInfo;
        static getCurrentAddress(): string;
        static setCurrentAddress(str: string): void;
    }
    class BalanceInfo {
        balance: number;
        asset: string;
        name: {
            lang: string;
            name: string;
        }[];
        names: string;
        type: string;
        static jsonToArray(json: {}[]): BalanceInfo[];
        static getBalancesByArr(balances: any, nep5balances: any, height: number): BalanceInfo[];
        static setBalanceSotre(balance: BalanceInfo, height: number): void;
    }
    class Nep5Balance {
        assetid: string;
        symbol: string;
        balance: number;
    }
    class Result {
        err: boolean;
        info: any;
    }
    enum AssetEnum {
        NEO = "0xc56f33fc6ecfcd0c225c4ab356fee59390af8560be0e930faebe74a6daff7c9b",
        GAS = "0x602c79718b16e442de58778e148d0b1084e3b2dffd5de6b7b16cee7969282de7"
    }
    class NeoAsset {
        neo: number;
        gas: number;
        claim: string;
    }
    class OldUTXO {
        height: number;
        txid: string;
        n: number;
        constructor(txid: string, n: number);
        static oldutxosPush(olds: OldUTXO[]): void;
        static setOldutxos(olds: OldUTXO[]): void;
        static getOldutxos(): OldUTXO[];
        compareUtxo(utxo: UTXO): boolean;
    }
    class UTXO {
        addr: string;
        txid: string;
        n: number;
        asset: string;
        count: Neo.Fixed8;
        static ArrayToString(utxos: UTXO[]): Array<any>;
        static StringToArray(obj: Array<any>): UTXO[];
        static setAssets(assets: {
            [id: string]: UTXO[];
        }): void;
        static getAssets(): any;
    }
    class Consts {
        static readonly baseContract: Neo.Uint160;
        static readonly registerContract: Neo.Uint160;
        static readonly saleContract: Neo.Uint160;
    }
    class DomainInfo {
        owner: Neo.Uint160;
        register: Neo.Uint160;
        resolver: Neo.Uint160;
        ttl: string;
    }
    class SellDomainInfo extends DomainInfo {
        id: Neo.Uint256;
        domain: string;
        startBlockSelling: Neo.BigInteger;
        endBlock: Neo.BigInteger;
        maxPrice: Neo.BigInteger;
        lastBlock: Neo.BigInteger;
        maxBuyer: Neo.Uint160;
        balanceOf: Neo.BigInteger;
        balanceOfSelling: Neo.BigInteger;
        constructor();
        copyDomainInfoToThis(info: DomainInfo): void;
    }
    class RootDomainInfo extends DomainInfo {
        rootname: string;
        roothash: Neo.Uint256;
        constructor();
    }
    class Transactionforaddr {
        addr: string;
        blockindex: number;
        blocktime: {
            $date: number;
        };
        txid: string;
    }
    interface Transaction {
        txid: string;
        type: string;
        vin: {
            txid: string;
            vout: number;
        }[];
        vout: {
            n: number;
            asset: string;
            value: string;
            address: string;
        }[];
    }
    class History {
        n: number;
        asset: string;
        value: string;
        address: string;
        assetname: string;
        txtype: string;
        time: string;
        txid: string;
        static setHistoryStore(history: History, height: number): void;
        static getHistoryStore(): Array<any>;
        static delHistoryStoreByHeight(height: number): void;
    }
    class Claim {
        addr: string;
        asset: string;
        claimed: boolean;
        createHeight: number;
        n: number;
        txid: string;
        useHeight: number;
        used: string;
        value: number;
        constructor(json: {});
        static strToClaimArray(arr: {}[]): Claim[];
    }
    class Domainmsg {
        domainname: string;
        resolver: string;
        mapping: string;
        time: string;
        isExpiration: boolean;
        await_resolver: boolean;
        await_mapping: boolean;
        await_register: boolean;
    }
    class DomainStatus {
        domainname: string;
        resolver: string;
        mapping: string;
        await_mapping: boolean;
        await_register: boolean;
        await_resolver: boolean;
        static setStatus(domain: DomainStatus): void;
        static getStatus(): {};
    }
    interface DomainSaleInfo {
        domain: string;
        owner: string;
        ttl: string;
        price: string;
        state: string;
    }
    class WalletOtcgo {
        address: string;
        publicKey: string;
        privatekey: string;
        publicKeyCompressed: string;
        privateKeyEncrypted: string;
        pubkey: Uint8Array;
        prikey: Uint8Array;
        fromJsonStr(str: string): void;
        toJson(): {};
        otcgoDecrypt(pwd: string): void;
        doSign(prvkey: any, msg: any): any;
        doVerify(pubkey: any, msg: any, sigval: any): any;
        doValidatePwd(): any;
    }
    class DataType {
        static Array: string;
        static ByteArray: string;
        static Integer: string;
        static Boolean: string;
        static String: string;
    }
    class ResultItem {
        data: Uint8Array;
        subItem: ResultItem[];
        static FromJson(type: string, value: any): ResultItem;
        AsHexString(): string;
        AsHashString(): string;
        AsString(): string;
        AsHash160(): Neo.Uint160;
        AsHash256(): Neo.Uint256;
        AsBoolean(): boolean;
        AsInteger(): Neo.BigInteger;
    }
    class NNSResult {
        textInfo: string;
        value: any;
    }
    class PageUtil {
        private _currentPage;
        private _pageSize;
        private _totalCount;
        private _totalPage;
        constructor(total: number, pageSize: number);
        currentPage: number;
        pageSize: number;
        totalCount: number;
        readonly totalPage: number;
    }
    class TaskFunction {
        constructor();
        static heightRefresh: Function;
        static taskHistory: Function;
        static exchange: Function;
        static tranfer: Function;
        static openAuction: Function;
        static addPrice: Function;
        static topup: Function;
        static withdraw: Function;
        static getGasTest: Function;
        static claimGas: Function;
        static claimState: Function;
        static domainMapping: Function;
        static domainResovle: Function;
        static domainRenewal: Function;
        static domainTransfer: Function;
        static auctionStateUpdate: Function;
        static newTaskNumber: Function;
        static domainSale: Function;
        static domainUnSale: Function;
        static domainBuy: Function;
        static getNNC: Function;
        static getNNCTest: Function;
    }
    class Task {
        height: number;
        confirm: number;
        type: ConfirmType;
        txid: string;
        message: any;
        state: TaskState;
        startTime: number;
        constructor(type: ConfirmType, txid: string, messgae?: any);
        toString(): string;
    }
    class Process {
        timearr: Array<{
            msg: string;
            date: string;
            time: string;
        }>;
        state: string;
        startTime: number;
        width: number;
        date: string;
        time: string;
        constructor(start: number | string);
    }
    class NeoAuction_TopUp {
        input: string;
        watting: boolean;
        isShow: boolean;
        error: boolean;
        constructor();
    }
    class NeoAuction_Withdraw {
        input: string;
        watting: boolean;
        isShow: boolean;
        error: boolean;
        constructor();
    }
    interface BlockTime {
        blockindex: number;
        blocktime: number;
        txid: string;
    }
    interface AuctionAddress {
        address: string;
        totalValue: number;
        lastTime: BlockTime;
        accountTime: BlockTime;
        getdomainTime: BlockTime;
        addpricelist: BlockTime;
    }
    interface Auction {
        auctionId: string;
        domain: string;
        parenthash: string;
        fulldomain: string;
        domainTTL: string;
        auctionState: string;
        startTime: BlockTime;
        startAddress: string;
        maxPrice: number;
        maxBuyer: string;
        endTime: BlockTime;
        endAddress: string;
        lastTime: BlockTime;
        addwholist: AuctionAddress[];
    }
    enum TaskState {
        watting = 0,
        success = 1,
        fail = 2
    }
    enum TaskType {
        tranfer = 0,
        openAuction = 1,
        addPrice = 2,
        gasToSgas = 3,
        sgasToGas = 4,
        topup = 5,
        withdraw = 6,
        getGasTest = 7,
        domainMapping = 8,
        domainResovle = 9,
        domainRenewal = 10,
        getDomain = 11,
        recoverSgas = 12,
        ClaimGas = 13,
        domainTransfer = 14,
        saleDomain = 15,
        unSaleDomain = 16,
        buyDomain = 17,
        getMyNNC = 18,
        requestNNC = 19
    }
    enum ConfirmType {
        tranfer = 0,
        contract = 1,
        recharge = 2
    }
    enum DomainState {
        open = 0,
        fixed = 1,
        random = 2,
        end1 = 3,
        end2 = 4,
        expire = 5,
        pass = 6
    }
    interface SaleDomainList {
        blockindex: number;
        fullDomain: string;
        price: string;
        blocktime: string;
    }
    interface MyBonus {
        addr: string;
        assetid: string;
        balance: string;
        send: string;
        txid: string;
        sendAssetid: string;
        height: number;
        applied: boolean;
        totalSend: string;
        blocktime: string;
    }
}
declare namespace EasyCheers {
    class floatNum {
        static strip(num: number, precision?: number): number;
        static digitLength(num: number): number;
        static float2Fixed(num: number): number;
        static checkBoundary(num: number): void;
        static times(num1: number, num2: number, ...others: number[]): number;
        static plus(num1: number, num2: number, ...others: number[]): number;
        static minus(num1: number, num2: number, ...others: number[]): number;
        static divide(num1: number, num2: number, ...others: number[]): number;
        static round(num: number, ratio: number): number;
        static addZero(num: number, ratio: number): string;
    }
}
declare namespace EasyCheers.tools {
    class neotool {
        constructor();
        static verifyAddress(addr: string): boolean;
        static verifyPublicKey(publicKey: string): boolean;
        static wifDecode(wif: string): Result;
        static nep2FromWif(wif: string, password: string): Result;
        static nep2ToWif(nep2: string, password: string): Promise<Result>;
        static nep6Load(wallet: ThinNeo.nep6wallet, password: string): Promise<{}>;
        static getPriKeyfromAccount(scrypt: ThinNeo.nep6ScryptParameters, password: string, account: ThinNeo.nep6account): Promise<Result>;
    }
}
declare namespace EasyCheers {
    class SDK {
        private static is_init;
        private static main;
        static init(): void;
        static registerHeightChangedCallback(callback?: any): void;
        static createWallet(passwd: any, callback?: any): void;
        static login(passwd: any, wallet: any): void;
        static loginWif(wif: any, callback?: any): void;
        static loginNep2(nep2: any, passwd: any, callback?: any): void;
        static contractGetValue(assetID: string, method: string, addr: string, callback?: any): Promise<void>;
        static getBalances(callback?: any): Promise<void>;
        static getCurrentAddr(): string;
        static transferNep5(assetId: string, to: string, amount: string, callback?: any): Promise<void>;
        static transferGlobalAsset(assetId: string, to: string, amount: string, callback?: any): Promise<void>;
        static getNeo(): any;
        static getGas(): any;
        static getEct(): any;
        static bet(contractHash: string, address: string, max: string, odds: string, callback?: any): Promise<void>;
    }
}
declare namespace EasyCheers.tools {
    class StorageTool {
        static getLoginArr(): LoginInfo[];
        static setLoginArr(value: LoginInfo[]): void;
        static setStorage(key: string, value: string): void;
        static getStorage(key: string): string;
        static delStorage(key: string): void;
        static utxosRefresh(): Promise<void>;
    }
    class SessionStoreTool {
        table: string;
        constructor(table: string);
        put(key: string, ...param: any[]): void;
        push(key: any, value: any): void;
        select(key: string): any;
        delete(...param: any[]): void;
        update(key: string, value: any): void;
        static getTable(table: string): any;
        getList(): any;
        setList(list: any): void;
    }
    class StaticStore {
        static choiceAsset: string;
        static setAsset(asset: string): void;
    }
}
declare namespace EasyCheers.tools {
    class DateTool {
        static dateFtt(fmt: any, date: any): string;
        static getTime(date: number): string;
        static getDate(time: string | number): Date;
    }
}
declare namespace EasyCheers.tools {
    class WWW {
        static api: string;
        static apiaggr: string;
        static makeRpcUrl(url: string, method: string, ..._params: any[]): string;
        static makeRpcPostBody(method: string, ..._params: any[]): {};
        static gettransbyaddress(address: string, pagesize: number, pageindex: number): Promise<any>;
        static gettransbyaddressnew(address: string, pagesize: number, pageindex: number): Promise<any>;
        static api_getHeight(): Promise<number>;
        static api_getBlockInfo(index: number): Promise<number>;
        static api_getAllAssets(): Promise<any>;
        static api_getUTXO(address: string): Promise<any>;
        static api_hasclaimgas(address: string): Promise<any>;
        static api_claimgas(address: string, num: number): Promise<any>;
        static api_getnep5Balance(address: string): Promise<any>;
        static api_getBalance(address: string): Promise<any>;
        static getNep5Asset(asset: string): Promise<any>;
        static getnep5balanceofaddress(asset: string, address: string): Promise<any>;
        static api_getAddressTxs(address: string, size: number, page: number): Promise<any>;
        static api_postRawTransaction(data: Uint8Array): Promise<any>;
        static api_getclaimgas(address: string, type: number): Promise<any>;
        static api_getclaimtxhex(address: string): Promise<string>;
        static rpc_getHeight(): Promise<number>;
        static rpc_getStorage(scripthash: Uint8Array, key: Uint8Array): Promise<string>;
        static rpc_getInvokescript(scripthash: Uint8Array): Promise<any>;
        static getrawtransaction(txid: string): Promise<any>;
        static getnep5transferbytxid(txid: string): Promise<any>;
        static api_getcontractstate(scriptaddr: string): Promise<any>;
        static api_getbonushistbyaddress(address: string, currentpage: number, pagesize: number): Promise<any>;
        static getavailableutxos(address: string, count: number): Promise<any>;
        static rechargeandtransfer(data1: Uint8Array, data2: Uint8Array): Promise<any>;
        static getrechargeandtransfer(txid: string): Promise<any>;
        static getNotify(txid: string): Promise<any>;
        static hastx(txid: string): Promise<any>;
        static hascontract(txid: string): Promise<any>;
        static getbonushistbyaddress(address: string, page: number, pagesize: number): Promise<any>;
        static getbonusbyaddress(address: string, page: number, pagesize: number): Promise<any>;
        static getcurrentbonus(addr: string): Promise<any>;
        static applybonus(addr: string): Promise<any>;
    }
}
