import React from 'react';
import { Modal, Text, View } from 'react-native';
import Spinner from 'react-native-loading-spinner-overlay';

const SpinnerModal = ({ visible }) => {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
    >
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Spinner
          visible={visible}
          textContent={'Processing'}
        />
      </View>
    </Modal>
  );
};

export default SpinnerModal;