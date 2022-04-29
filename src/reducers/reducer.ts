const INITIAL_STATE = {
  connectedDevice: {}, // the current connected BLE device
  deviceStatus: 'disconnected' // the status of the BLE connection
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
      console.log('Device Status Changed:', action.deviceStatus)
      return {
        ...state,
        deviceStatus: action.deviceStatus
      }
    default:
      return state
  }
}
export default reducer
