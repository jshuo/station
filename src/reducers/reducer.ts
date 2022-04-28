const INITIAL_STATE = {
  connectedDevice: {}, // the current connected BLE device
  usbStatus: 'disconnected' // the status of the BLE connection
}
// @ts-ignore
const reducer = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case 'CONNECTED_DEVICE':
      console.log('Reducer connected device', action)
      return {
        ...state,
        connectedDevice: action.connectedDevice
      }
    case 'CHANGE_STATUS':
      console.log('BLE change status:', action.usbStatus)
      return {
        ...state,
        usbStatus: action.usbStatus
      }
    default:
      return state
  }
}
export default reducer
