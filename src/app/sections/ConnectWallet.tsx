import { useTranslation } from 'react-i18next'
import UsbIcon from '@mui/icons-material/Usb'
// import { useWallet } from "@terra-money/wallet-provider"
import { STATION } from 'config/constants'
import { RenderButton } from 'types/components'
import { useAddress } from 'data/wallet'
import { Button, ExternalLink } from 'components/general'
import { Grid } from 'components/layout'
import { List } from 'components/display'
import { ModalButton } from 'components/feedback'
import { FormHelp } from 'components/form'
import { useAuth } from 'auth'
import SwitchWallet from 'auth/modules/select/SwitchWallet'
import Connected from './Connected'
import { connect } from 'react-redux'

interface Props {
  renderButton?: RenderButton
  deviceStatus: any
}

const ConnectWallet = ({ renderButton, deviceStatus }: Props) => {
  const { t } = useTranslation()

  // const { connect, availableConnections } = useWallet()
  const { available } = useAuth()

  const address = useAddress()
  if (address && deviceStatus === 'connected') return <Connected />

  const defaultRenderButton: Props['renderButton'] = (open) => (
    <Button onClick={open} size="small" outline>
      {t('Connect')}
    </Button>
  )

  const list = [
    {
      icon: <UsbIcon />,
      to: '/auth/secux',
      children: t('Connect with SecuX Hardware Only')
    }
  ]

  return (
    <ModalButton title={t('Connect wallet')} renderButton={renderButton ?? defaultRenderButton} maxHeight>
      <Grid gap={20}>
        <SwitchWallet />
        <List list={available.length ? available : list} />
        {!!available.length && (
          <FormHelp>
            Use <ExternalLink href={STATION}>Terra Station</ExternalLink> on the browser to access with SecuX device
          </FormHelp>
        )}
      </Grid>
    </ModalButton>
  )
}

// @ts-ignore
const mapStateToProps = (state) => ({
  connectedDevice: state.connectedDevice,
  deviceStatus: state.deviceStatus
})
export default connect(mapStateToProps)(ConnectWallet)
