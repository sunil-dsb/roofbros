import Toast from 'react-native-toast-message';

function ShowAlertMessage(message: string, type: string, duration = 3000) {
  const toastType = type === 'red' || type === 'error' ? 'error' : 'success';
  const parts = message.split('\n');
  const text1 = parts[0];
  const text2 = parts.length > 1 ? parts.slice(1).join('\n') : undefined;

  Toast.show({
    type: toastType,
    text1,
    text2,
    visibilityTime: duration,
  });
}

const popTypes = {
  error: 'error',
  info: 'info',
  success: 'success',
};

export {ShowAlertMessage, popTypes};
