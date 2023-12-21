import React from "react";
import { Modal, View, Text, Button } from "react-native";
import styles from "../../Styles";

const SelectedBank = ({ isVisible, banks, onSelect }) => {
  return (
    <Modal visible={isVisible} animationType="slide">
      <View style={styles.buttonSelectBankContainer}>
        <Text>Select an Bank:</Text>
        {banks.map((bank) => (
          <Button
            key={bank.identifier}
            title={bank.name}
            onPress={() => onSelect(bank)}
          />
        ))}
      </View>
    </Modal>
  );
};

export default SelectedBank;
