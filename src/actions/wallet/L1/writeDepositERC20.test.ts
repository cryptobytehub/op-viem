import { mine, writeContract } from 'viem/actions'
import { base } from 'viem/chains'
import { expect, test } from 'vitest'
import { erc20ABI } from 'wagmi'
import { publicClient, testClient, walletClient } from '../../../_test/utils'
import { mainnet } from '../../../chains/mainnet'
import { writeDepositERC20 } from './writeDepositERC20'

const USDCL1 = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
const USDCL2 = '0x2e668bb88287675e34c8df82686dfd0b7f0c0383'
const zenaddress = '0xFd4F24676eD4588928213F37B126B53c07186F45'

test('default', async () => {
  await testClient.impersonateAccount({
    address: zenaddress,
  })
  await testClient.setBalance({
    address: zenaddress,
    value: 10n ** 22n,
  })
  await writeContract(testClient, {
    address: USDCL1,
    abi: erc20ABI,
    functionName: 'approve',
    args: [mainnet.contracts.optimismL1StandardBridge[base.id], 10000n],
    account: zenaddress,
  })
  await mine(testClient, { blocks: 1 })
  const hash = await writeDepositERC20(walletClient, {
    args: {
      l1Token: USDCL1,
      l2Token: USDCL2,
      amount: 1n,
      gasLimit: 1n,
      data: '0x',
    },
    l2ChainId: base.id,
    account: zenaddress,
  })
  await mine(testClient, { blocks: 1 })
  expect((await publicClient.getTransactionReceipt({ hash })).status).toEqual(
    'success',
  )
})