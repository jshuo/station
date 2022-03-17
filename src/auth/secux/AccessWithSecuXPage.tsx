import { useTranslation } from "react-i18next"
import { Card, Page } from "components/layout"
import AccessWithSecuXForm from "./AccessWithSecuXForm"

const AccessWithSecuXPage = () => {
  const { t } = useTranslation()

  return (
    <Page title={t("Access with SecuX")} small>
      <Card>
        <AccessWithSecuXForm />
      </Card>
    </Page>
  )
}

export default AccessWithSecuXPage
