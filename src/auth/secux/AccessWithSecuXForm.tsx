import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import UsbIcon from '@mui/icons-material/Usb'
import { SecuXKey } from '@secux/secux-terra-js'
import { Form, FormError, FormItem, FormWarning } from 'components/form'
import { Checkbox, Input, Submit } from 'components/form'
import validate from '../scripts/validate'
import useAuth from '../hooks/useAuth'
import { connect } from 'react-redux'

// @ts-ignore
function connectedDevice(device) {
  return {
    type: 'CONNECTED_DEVICE',
    connectedDevice: device
  }
}
// @ts-ignore
function changeDeviceStatus(deviceStatus) {
  return {
    type: 'CHANGE_STATUS',
    deviceStatus: deviceStatus
  }
}

interface Values {
  index: number
  bluetooth: boolean
}
// @ts-ignore
const AccessWithSecuXForm = (props) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { connectSecuX } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error>()

  /* form */
  const form = useForm<Values>({
    mode: 'onChange',
    defaultValues: { index: 0, bluetooth: false }
  })

  const { register, watch, handleSubmit, formState } = form
  const { errors } = formState
  const { index, bluetooth } = watch()
  // @ts-ignore
  const submit = async ({ index, bluetooth }: Values) => {
    setIsLoading(true)
    setError(undefined)
    const deviceConnectedHandle = () => {
      console.log('devicie connected')
      props.changeDeviceStatus('connected')
    }
    const deviceDisconnectedHandle = () => {
      console.log('devicie disconnected')
      props.changeDeviceStatus('disconnected')
    }
    try {
      // @ts-ignore
      const { accAddress, transport } = await SecuXKey.create('', index, bluetooth, deviceConnectedHandle, deviceDisconnectedHandle)
      props.connectedDevice(transport)

      connectSecuX(accAddress, index, bluetooth)
      navigate('/wallet', { replace: true })
    } catch (error) {
      setError(error as Error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form onSubmit={handleSubmit(submit)}>
      <section className="center">
        <UsbIcon style={{ fontSize: 56 }} />
        <p>{t('Plug in a SecuX device')}</p>
      </section>

      <FormItem /* do not translate this */ label="Index" error={errors.index?.message}>
        <Input
          {...register('index', {
            valueAsNumber: true,
            validate: validate.index
          })}
        />

        {index !== 0 && <FormWarning>{t('Default index is 0')}</FormWarning>}

        {/* <Checkbox {...register("bluetooth")} checked={bluetooth}>
          Use Bluetooth
        </Checkbox> */}
      </FormItem>

      {error && <FormError>{error.message}</FormError>}

      <Submit submitting={isLoading}>{t('Connect')}</Submit>
    </Form>
  )
}

// @ts-ignore
const mapDispatchToProps = (dispatch) => ({
  // @ts-ignore
  connectedDevice: (transport) => dispatch(connectedDevice(transport)),
  // @ts-ignore
  changeDeviceStatus: (status) => dispatch(changeDeviceStatus(status))
})
// @ts-ignore
const mapStateToProps = (state) => ({
  connectedDevice: state.connectedDevice
})
export default connect(mapStateToProps, mapDispatchToProps)(AccessWithSecuXForm)
