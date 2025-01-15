/* eslint-disable @typescript-eslint/no-explicit-any */
import type { FinalExecutionOutcome, WalletSelector, WalletSelectorState } from '@near-wallet-selector/core';
import '@near-wallet-selector/modal-ui/styles.css';
import { setupWalletSelector } from '@near-wallet-selector/core';
import { setupMeteorWallet } from '@near-wallet-selector/meteor-wallet';
import { setupHereWallet } from '@near-wallet-selector/here-wallet';
// import { setupMintbaseWallet } from '@near-wallet-selector/mintbase-wallet';
import { setupModal } from '@near-wallet-selector/modal-ui';
import { setupMyNearWallet } from '@near-wallet-selector/my-near-wallet';
import { setupBitteWallet } from '@near-wallet-selector/bitte-wallet';
import { providers, utils } from 'near-api-js';
import type { Context } from 'react';
import { createContext } from 'react';
import { distinctUntilChanged, map } from 'rxjs';
import { NetworkId } from '@/types/type';
import { NETWORK_ID, SIN_STAKING_CONTRACT } from '@/config/constants';


const THIRTY_TGAS = '30000000000000';
const NO_DEPOSIT = '0';

export class Wallet {
    private createAccessKeyFor: string;
    private networkId: NetworkId;
    selector!: Promise<WalletSelector>;

    constructor({
        networkId = NETWORK_ID,
        createAccessKeyFor = SIN_STAKING_CONTRACT,
    }: {
        networkId: NetworkId;
        createAccessKeyFor: string;
    }) {
        this.createAccessKeyFor = createAccessKeyFor;
        this.networkId = networkId;
    }

    startUp = async (accountChangeHook: (account: string) => void) => {
        this.selector = setupWalletSelector({
            network: this.networkId,
            modules: [
                setupBitteWallet() as any,
                setupMeteorWallet(),
                setupMyNearWallet(),
                setupHereWallet(),
                // setupMintbaseWallet(),
            ],
        });

        const walletSelector = await this.selector as WalletSelector;
        const isSignedIn = walletSelector.isSignedIn();
        const accountId = isSignedIn ? walletSelector.store.getState().accounts[0].accountId : '';

        walletSelector.store.observable
            .pipe(
                map((state: WalletSelectorState) => state.accounts),
                distinctUntilChanged(),
            )
            .subscribe((accounts: any) => {
                const signedAccount = accounts.find((account: { active: boolean }) => account.active)?.accountId;
                accountChangeHook(signedAccount);
            });

        return accountId;
    };

    signIn = async () => {
        const modal = setupModal(await this.selector, { contractId: this.createAccessKeyFor });
        modal.show();
    };

    signOut = async () => {
        const selectedWallet = await (await this.selector).wallet();
        selectedWallet.signOut();
    };

    viewMethod = async ({ contractId, method, args = {} }: { contractId: string; method: string; args?: object }) => {
        const url = `https://rpc.${this.networkId}.near.org`;
        const provider = new providers.JsonRpcProvider({ url });

        const res: any = await provider.query({
            request_type: 'call_function',
            account_id: contractId,
            method_name: method,
            args_base64: Buffer.from(JSON.stringify(args)).toString('base64'),
            finality: 'optimistic',
        });
        return JSON.parse(Buffer.from(res.result).toString());
    };

    callMethod = async ({
        contractId,
        method,
        args = {},
        gas = THIRTY_TGAS,
        deposit = NO_DEPOSIT,
        callbackUrl = window.location.origin,
    }: {
        contractId: string;
        method: string;
        args?: object;
        gas?: string;
        deposit?: string;
        callbackUrl?: string;
    }) => {
        // Sign a transaction with the "FunctionCall" action
        const selectedWallet = await (await this.selector).wallet();
        const outcome = await selectedWallet.signAndSendTransaction({
            receiverId: contractId,
            callbackUrl: callbackUrl,
            actions: [
                {
                    type: 'FunctionCall',
                    params: {
                        methodName: method,
                        args,
                        gas,
                        deposit,
                    },
                },
            ],
        });

        return providers.getTransactionLastResult(outcome as FinalExecutionOutcome);
    };

    isFinalExecutionStatusWithSuccessValue(status: any): status is { SuccessValue: string } {
        return status && typeof status.SuccessValue === 'string';
    }

    getTransactionResult = async (txhash: string) => {
        const walletSelector = await this.selector;
        const { network } = walletSelector.options;
        const provider = new providers.JsonRpcProvider({ url: network.nodeUrl });
    
        try {
            // Fetch the transaction status from the provider
            const transaction = await provider.txStatus(txhash, 'unused') as providers.FinalExecutionOutcome;
            console.log("Transaction Response >>", transaction);
    
            return transaction; // Return the entire transaction response
        } catch (error) {
            console.error("Transaction Error >>", error);
            throw error;
        }
    };
    
    

    getBalance = async (accountId: string) => {
        const walletSelector = await this.selector;
        const { network } = walletSelector.options;
        const provider = new providers.JsonRpcProvider({ url: network.nodeUrl });

        // Retrieve account state from the network
        const account: any = await provider.query({
            request_type: 'view_account',
            account_id: accountId,
            finality: 'final',
        });
        // return amount on NEAR
        return account.amount ? Number(utils.format.formatNearAmount(account.amount)) : 0;
    };

    signAndSendTransactions = async ({ transactions }: { transactions: any[] }) => {
        const selectedWallet = await (await this.selector).wallet();
        return selectedWallet.signAndSendTransactions({ transactions });
    };
}

export const NearContext: Context<{ wallet: Wallet | undefined; signedAccountId: string }> = createContext({
    wallet: undefined as Wallet | undefined,
    signedAccountId: '',
});