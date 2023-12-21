import React, { useState, useEffect } from "react";
import { Modal, View, Text, FlatList, Button } from "react-native";
import CheckBox from "expo-checkbox";

const SelectAccounts = ({ isVisible, accounts, onSend }) => {
  const [selectedAccountIds, setSelectedAccountIds] = useState([]);

  useEffect(() => {
    setSelectedAccountIds(selectedAccountIds);
    console.log(
      "selectedAccountIds has been updated from useEffect:",
      selectedAccountIds
    );
  }, [selectedAccountIds]);

  const accountInfos = accounts.reduce((accInfos, account) => {
    let accountInfoString = "";
    if (account.accountName) {
      accountInfoString += account.accountName + " ";
    }
    if (account.accountNumber) {
      accountInfoString += "[";
      if (account.accountBSB) {
        accountInfoString += account.accountBSB + " ";
      }
      accountInfoString += account.accountNumber + "] ";
    }
    if (account.accountBalance) {
      accountInfoString += account.accountBalance;
    }
    accInfos[account.id] = accountInfoString;
    return accInfos;
  }, {});

  const accountInfoArray = Object.entries(accountInfos).map(([key, value]) => ({
    key: key,
    value: value,
  }));

  const toggleAccountSelection = (accountId) => {
    const newSelectedAccountIds = (
      selectedAccountIds.includes(accountId)
        ? selectedAccountIds.filter((id) => id !== accountId)
        : [...selectedAccountIds, accountId]
    ).sort();
    console.log("NEW SELECTED " + newSelectedAccountIds);
    setSelectedAccountIds(newSelectedAccountIds);
  };

  const renderItem = ({ item }) => (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        margin: 5,
        marginLeft: 25,
      }}
    >
      <CheckBox
        value={selectedAccountIds.includes(item.key)}
        onValueChange={() => toggleAccountSelection(item.key)}
      />
      <Text>
        {"  " +
          item.value.split(" [")[0] +
          "\n" +
          "  [" +
          item.value.split(" [")[1]}
      </Text>
    </View>
  );

  return (
    <Modal visible={isVisible} animationType="slide">
      <View>
        <Text style={{ margin: 10 }}>Select Accounts:</Text>
        <FlatList
          data={accountInfoArray}
          renderItem={renderItem}
          keyExtractor={(item) => item.key}
        />
        <Text style={{ margin: 25 }}>
          Please click the button below to collect necessary information from
          selected accounts and send it to the lender.
        </Text>

        <Button
          title="Send"
          onPress={() => {
            console.log("Selected Account IDS on Send:", selectedAccountIds);
            const selectedAccounts = accounts.filter((account) =>
              selectedAccountIds.includes(account.id.toString())
            );
            console.log("Selected Accounts:", selectedAccounts);
            onSend(selectedAccounts);
          }}
        />
      </View>
    </Modal>
  );
};

export default SelectAccounts;
