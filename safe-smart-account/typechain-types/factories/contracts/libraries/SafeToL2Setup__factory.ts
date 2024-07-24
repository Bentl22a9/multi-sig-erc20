/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import {
  Contract,
  ContractFactory,
  ContractTransactionResponse,
  Interface,
} from "ethers";
import type { Signer, ContractDeployTransaction, ContractRunner } from "ethers";
import type { NonPayableOverrides } from "../../../common";
import type {
  SafeToL2Setup,
  SafeToL2SetupInterface,
} from "../../../contracts/libraries/SafeToL2Setup";

const _abi = [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "singleton",
        type: "address",
      },
    ],
    name: "ChangedMasterCopy",
    type: "event",
  },
  {
    inputs: [],
    name: "_SELF",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "l2Singleton",
        type: "address",
      },
    ],
    name: "setupToL2",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

const _bytecode =
  "0x60a060405234801561001057600080fd5b503073ffffffffffffffffffffffffffffffffffffffff1660808173ffffffffffffffffffffffffffffffffffffffff1660601b8152505060805160601c6103976100686000398060b5528060d952506103976000f3fe608060405234801561001057600080fd5b50600436106100365760003560e01c8063600019b01461003b578063fe51f6431461006f575b600080fd5b6100436100b3565b604051808273ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b6100b16004803603602081101561008557600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff1690602001909291905050506100d7565b005b7f000000000000000000000000000000000000000000000000000000000000000081565b7f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff163073ffffffffffffffffffffffffffffffffffffffff16141561017c576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252603481526020018061030c6034913960400191505060405180910390fd5b6000600554146101d7576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260228152602001806103406022913960400191505060405180910390fd5b8060006101e3826102f8565b1415610257576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252601c8152602001807f4163636f756e7420646f65736e277420636f6e7461696e20636f64650000000081525060200191505060405180910390fd5b6001610261610303565b146102f457816000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055507f75e41bc35ff1bf14d81d1d2f649c0084a0f974f9289c803ec9898eeec4c8d0b882604051808273ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390a15b5050565b6000813b9050919050565b60004690509056fe53616665546f4c3253657475702073686f756c64206f6e6c792062652063616c6c6564207669612064656c656761746563616c6c53616665206d7573742068617665206e6f7420657865637574656420616e79207478a264697066735822122061b276b44ce684f29b758e17100a02117c3ffedc35c2f564b59abbaa5238044364736f6c63430007060033";

type SafeToL2SetupConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: SafeToL2SetupConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class SafeToL2Setup__factory extends ContractFactory {
  constructor(...args: SafeToL2SetupConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override getDeployTransaction(
    overrides?: NonPayableOverrides & { from?: string }
  ): Promise<ContractDeployTransaction> {
    return super.getDeployTransaction(overrides || {});
  }
  override deploy(overrides?: NonPayableOverrides & { from?: string }) {
    return super.deploy(overrides || {}) as Promise<
      SafeToL2Setup & {
        deploymentTransaction(): ContractTransactionResponse;
      }
    >;
  }
  override connect(runner: ContractRunner | null): SafeToL2Setup__factory {
    return super.connect(runner) as SafeToL2Setup__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): SafeToL2SetupInterface {
    return new Interface(_abi) as SafeToL2SetupInterface;
  }
  static connect(
    address: string,
    runner?: ContractRunner | null
  ): SafeToL2Setup {
    return new Contract(address, _abi, runner) as unknown as SafeToL2Setup;
  }
}
