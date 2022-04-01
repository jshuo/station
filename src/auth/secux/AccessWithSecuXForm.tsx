import { useState } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import UsbIcon from "@mui/icons-material/Usb"
import { SecuXKey } from "@secux/secux-terra-js"
import BluetoothTransport from "@ledgerhq/hw-transport-web-ble"
import { LEDGER_TRANSPORT_TIMEOUT } from "config/constants"
import { Form, FormError, FormItem, FormWarning } from "components/form"
import { Checkbox, Input, Submit } from "components/form"
import validate from "../scripts/validate"
import useAuth from "../hooks/useAuth"

interface Values {
  index: number
  bluetooth: boolean
}

const AccessWithSecuXForm = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { connectSecuX } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error>()

  /* form */
  const form = useForm<Values>({
    mode: "onChange",
    defaultValues: { index: 0, bluetooth: false },
  })

  const { register, watch, handleSubmit, formState } = form
  const { errors } = formState
  const { index, bluetooth } = watch()
  // @ts-ignore
  const submit = async ({ index, bluetooth }: Values) => {
    setIsLoading(true)
    setError(undefined)

    try {
      let transport: any
      const { accAddress } = await SecuXKey.create(transport, index, bluetooth)
      connectSecuX(accAddress, index, bluetooth)
      navigate("/wallet", { replace: true })
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
        <p>{t("Plug in a SecuX device")}</p>
      </section>

      <FormItem /* do not translate this */
        label="Index"
        error={errors.index?.message}
      >
        <Input
          {...register("index", {
            valueAsNumber: true,
            validate: validate.index,
          })}
        />

        {index !== 0 && <FormWarning>{t("Default index is 0")}</FormWarning>}

        <Checkbox {...register("bluetooth")} checked={bluetooth}>
          Use Bluetooth
        </Checkbox>
      </FormItem>

      {error && <FormError>{error.message}</FormError>}

      <Submit submitting={isLoading}>{t("Connect")}</Submit>
    </Form>
  )
}

export default AccessWithSecuXForm
