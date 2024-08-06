interface IConst {
    [key: string]: {
        rpcUrl: string,
        safeOwners: {
            pk: string,
            address: string
        } [],
        chainId: number,
        safeAddress: string,
        tokenAddress: string,
        tokenLockAddress: string,
    }
}

export const consts: IConst = {
    "localhost": {
        rpcUrl: process.env.LOCAL_RPC_URL || "",
        safeOwners: [
            {
                pk: process.env.LOCAL_ACCOUNT_0_PK || "",
                address: process.env.LOCAL_ACCOUNT_0_ADDRESS || ""
            },
            {
                pk: process.env.LOCAL_ACCOUNT_1_PK || "",
                address: process.env.LOCAL_ACCOUNT_1_ADDRESS || ""
            },
            {
                pk: process.env.LOCAL_ACCOUNT_2_PK || "",
                address: process.env.LOCAL_ACCOUNT_2_ADDRESS || ""
            }
        ],
        safeAddress: process.env.LOCAL_SAFE_PROXY_ADDRESS || "",
        tokenAddress: process.env.LOCAL_TOKEN_CONTRACT_ADDRESS || "",
        tokenLockAddress: process.env.LOCAL_TOKEN_LOCK_CONTRACT_ADDRESS || "",
        chainId: 31337
    },
    "base:sepolia": {
        rpcUrl: process.env.BASE_SEPOLIA_RPC_URL || "",
        safeOwners: [
            {
                pk: process.env.BASE_SEPOLIA_ACCOUNT_0_PK || "",
                address: process.env.BASE_SEPOLIA_ACCOUNT_0_ADDRESS || ""
            },
            {
                pk: process.env.BASE_SEPOLIA_ACCOUNT_1_PK || "",
                address: process.env.BASE_SEPOLIA_ACCOUNT_1_ADDRESS || ""
            },
            {
                pk: process.env.BASE_SEPOLIA_ACCOUNT_2_PK || "",
                address: process.env.BASE_SEPOLIA_ACCOUNT_2_ADDRESS || ""
            }
        ],
        safeAddress: process.env.BASE_SEPOLIA_PROXY_ADDRESS || "",
        tokenAddress: process.env.BASE_SEPOLIA_TOKEN_CONTRACT_ADDRESS || "",
        tokenLockAddress: process.env.BASE_SEPOLIA_TOKEN_LOCK_CONTRACT_ADDRESS || "",
        chainId: 84532
    }
}