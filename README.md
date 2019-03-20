# EasyCheers
- EasyCheers是基于NEO公链开发的钱包API

# 项目运行环境
Typescript

生成生成环境最小化包
cd wallet
tsc

# 目录结构
- wallet是前端sdk代码
- lib是执行引用的js库，wallet工程编译成code.js

# API
在sdk.ts 文件中，包含常用的api:
- 初始化
- 创建账户 
- 使用文件登录 
- 使用wif登录 
- 使用nep2登录 
- 从NEP5合约中查询 
- 获取NEO和GAS余额 
- 获取当前账户地址 
- 调用NEP5合约的transfer接口交易 
- 全局资产交易，如NEO，GAS

- 用户可以自定制API
