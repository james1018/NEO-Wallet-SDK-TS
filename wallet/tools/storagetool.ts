
namespace EasyCheers.tools {
    export class StorageTool {
        static getLoginArr(): LoginInfo[] {
            var message = sessionStorage.getItem("login-info-arr");

            var arr: LoginInfo[] = message ? LoginInfo.StringToArray(message) : [];
            return arr;
        }
        static setLoginArr(value: LoginInfo[]) {
            sessionStorage.setItem('login-info-arr', LoginInfo.ArrayToString(value));
        }
        static setStorage(key: string, value: string) {
            sessionStorage.setItem(key, value)
        }
        static getStorage(key: string): string {
            return sessionStorage.getItem(key);
        }
        static delStorage(key: string) {
            sessionStorage.removeItem(key);
        }
        
        
        static async utxosRefresh() {
            let assets = await CoinTool.getassets()
            UTXO.setAssets(assets);
        }

    }

    /**
     * @class sessionStorage工具类
     */
    export class SessionStoreTool
    {
        //表名
        public table: string;

        //初始化对象
        constructor(table: string)
        {
            this.table = table;
        }


        /**
         * 添加数据
         * @param key 
         * @param value param[0]:value,param[1]:key
         */
        put(key: string, ...param: any[])
        {
            let value = param[ 0 ];   //第零位是value
            let item = this.getList()
            let obj = item ? item : {};
            if (param.length == 1)
            {
                obj[ key ] = value;
            } else
            {
                let index = param[ 1 ];
                if (obj[ key ])
                {
                    obj[ key ][ index ] = value;
                } else
                {
                    obj[ key ] = {};
                    obj[ key ][ index ] = value;
                }
            }
            sessionStorage.setItem(this.table, JSON.stringify(obj));
        }

        /**
         * 往key对应的对象里塞数据，如果有相同的值则，往数组中push
         * @param key 
         * @param value 
         */
        push(key, value)
        {
            let item = this.getList();
            let list = item ? item : {};
            let arr = (list[ key ] ? list[ key ] : []) as Array<any>;
            arr.push(value);
            list[ key ] = arr;
            sessionStorage.setItem(this.table, JSON.stringify(list));
        }

        /**
         * 查找数据
         * @param key 
         */
        select(key: string)
        {
            let item = this.getList()
            if (item)
            {
                return item[ key ];
            } return undefined;
        }

        /**
         * 删除数据
         * @param key key:param[0],要删除的列名
         * @param index index:param[1] 要删除的字段名
         */
        delete(...param: any[])
        {
            let item = this.getList();
            let key = param[ 0 ] as string;
            if (param.length == 1)
            {
                if (item && item[ key ])
                {
                    delete item[ key ];
                    sessionStorage.setItem(this.table, JSON.stringify(item));
                }
            } else
            {
                let index = param[ 1 ] as string;
                if (item && item[ key ] && item[ key ][ index ])
                {
                    delete item[ key ][ index ];
                    sessionStorage.setItem(this.table, JSON.stringify(item));
                }
            }
        }

        /**
         * 更新数据(其实put就可以了直接覆盖掉已有的数据)
         * @param key 
         * @param value 
         */
        update(key: string, value: any)
        {
            let item = SessionStoreTool.getTable(this.table);
            if (item && item[ key ])
            {
                item[ key ] = value;
            }
        }

        /**
         * 获得整张表的数据
         * @param table 
         */
        static getTable(table: string)
        {
            let item = sessionStorage.getItem(table);
            if (item)
            {
                let obj = JSON.parse(item);
                return obj;
            }
            return undefined;
        }
        getList()
        {
            return SessionStoreTool.getTable(this.table);
        }

        setList(list: any)
        {
            sessionStorage.setItem(this.table, JSON.stringify(list));
        }

    }

    export class StaticStore {
        static choiceAsset: string = "";

        static setAsset(asset: string) {
            StaticStore.choiceAsset = asset;
        }
    }
}