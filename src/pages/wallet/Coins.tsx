import { useTranslation } from 'react-i18next'
import BigNumber from 'bignumber.js'
import BoltIcon from '@mui/icons-material/Bolt'
import { has } from 'utils/num'
import { getAmount, sortByDenom } from 'utils/coin'
import { useCurrency } from 'data/settings/Currency'
import { useMinimumValue } from 'data/settings/MinimumValue'
import { readNativeDenom } from 'data/token'
import { useBankBalance } from 'data/queries/bank'
import { useIsWalletEmpty, useTerraNativeLength } from 'data/queries/bank'
import { useActiveDenoms } from 'data/queries/oracle'
import { useMemoizedCalcValue } from 'data/queries/oracle'
import { InternalLink } from 'components/general'
import { Card, Flex, Grid } from 'components/layout'
import { FormError } from 'components/form'
import { Read } from 'components/token'
import Asset from './Asset'
import SelectMinimumValue from './SelectMinimumValue'
import styles from './Coins.module.scss'
import { useState, useEffect } from 'react'
import { connect } from 'react-redux'
const { SecuxScreenDevice } = require('@secux/protocol-device/lib/protocol-screendevice')

// @ts-ignore
const updateDeviceScreen = async (name, value, connectedDevice) => {
  await SecuxScreenDevice.SetAccount(connectedDevice, {
    name: name,
    path: "m/44'/330'/0'",
    balance: value
  })
}

const Coins = (props: any) => {
  const { t } = useTranslation()
  const currency = useCurrency()
  const length = useTerraNativeLength()
  const isWalletEmpty = useIsWalletEmpty()
  const { data: denoms, ...state } = useActiveDenoms()
  const coins = useCoins(denoms)

  const [toggle, setToggle] = useState(1)

  // @ts-ignore

  useEffect(() => {
    // console.log(`initializing interval`)
    const interval = setInterval(() => {
      if (!coins) return
      const [all] = coins
      const values = all.map(({ value }) => value).filter(Boolean)
      const valueTotal = values.length ? BigNumber.sum(...values).toNumber() : 0
      if (props.deviceStatus === 'connected') {
        const terraWeburl = 'https://secux-terra.netlify.app'
        setToggle(1 - toggle)
        updateDeviceScreen(
          toggle ? 'Terra Total UST' : 'Terra Account',
          toggle ? 'Approx. ' + (valueTotal / 1e6).toFixed(1).toString() + ' UST' : terraWeburl,
          props.connectedDevice
        )
      }
    }, 10000)
    return () => {
      // console.log(`clearing interval`)
      clearInterval(interval)
    }
  }, [toggle])

  const render = () => {
    if (!coins) return

    const [all, filtered] = coins

    const values = all.map(({ value }) => value).filter(Boolean)
    const valueTotal = values.length ? BigNumber.sum(...values).toNumber() : 0
    return (
      <>
        <Read className={styles.total} amount={valueTotal} token={currency} auto approx />

        <Grid gap={12}>
          {isWalletEmpty && <FormError>{t('Coins required to post transactions')}</FormError>}

          <Flex className={styles.select}>{!isWalletEmpty && <SelectMinimumValue />}</Flex>

          <section>
            {filtered.map(({ denom, ...item }) => (
              <Asset {...readNativeDenom(denom)} {...item} key={denom} />
            ))}
          </section>
        </Grid>
      </>
    )
  }

  const extra = (
    <InternalLink icon={<BoltIcon style={{ fontSize: 18 }} />} to="/swap/multiple" disabled={length < 2}>
      {t('Swap multiple coins')}
    </InternalLink>
  )

  return (
    <Card {...state} title={t('Coins')} extra={extra}>
      <Grid gap={32}>{render()}</Grid>
    </Card>
  )
}

/* hooks */
export const useCoins = (denoms?: Denom[]) => {
  const currency = useCurrency()
  const bankBalance = useBankBalance()
  const [minimumValue] = useMinimumValue()
  const calcValue = useMemoizedCalcValue()
  const calcValueByUST = useMemoizedCalcValue('uusd')

  if (!denoms) return

  const nativeTokenValues = denoms
    .map((denom) => {
      const balance = getAmount(bankBalance, denom)
      const value = calcValue({ amount: balance, denom }) ?? 0
      const valueByUST = calcValueByUST({ amount: balance, denom }) ?? 0
      return { denom, balance, value: value, $: valueByUST }
    })
    .filter(({ denom, balance }) => ['uluna', 'uusd'].includes(denom) || has(balance))

  const coins = sortByDenom(nativeTokenValues, currency, ({ $: a }, { $: b }) => b - a)

  return [coins, coins.filter(({ $ }) => $ >= minimumValue * 1e6)] as const
}

// @ts-ignore
const mapStateToProps = (state) => ({
  connectedDevice: state.connectedDevice,
  deviceStatus: state.deviceStatus,
  totalValue: state.totalValue
})
export default connect(mapStateToProps)(Coins)
