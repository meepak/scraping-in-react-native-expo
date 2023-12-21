 
import FormData from "form-data";
import { Alert } from "react-native";
 
 //format accounts to json string
 const formatJsonForCatAnalysis = (bank, accounts) => {
    const bankAccounts = {};
    bankAccounts.bankAccounts = [];
    accounts.forEach((account) => {
      const bankAccount = {};
      bankAccount.accountHolder = "XXXX YYYYY"; //hardcoded for now
      bankAccount.accountName = account.accountName;
      bankAccount.bsb = account.accountBSB;
      bankAccount.accountNumber = account.accountNumber;
      bankAccount.currentBalance = account.accountBalance;
      bankAccount.availableBalance = account.accountBalance;
      const transactions = [];

    
      //console.log("ACCOUNT => " + JSON.stringify(account));
      account.transactions.forEach((txn) => {
        const transaction = bank.parseTransactionFromCsvRow(txn);
        if(txn !== false) {
        transactions.push(transaction);
        }
      });bank

      bankAccount.transactions = transactions;

      bankAccounts.bankAccounts.push(bankAccount);
    });

    return JSON.stringify(bankAccounts);
  };

  export const MakeCatAbalysisApiSubmission = (bank, accounts) => {
    let bankAccounts = formatJsonForCatAnalysis(bank, accounts);

    const catAnalysisEndPoint =
      "----------------------------------------------------------"
    // file deepcode ignore HardcodedNonCryptoSecret: <this was for quick demo only>
    const xApiKey = "------------------------------------------";
    const myHeaders = new Headers();
    myHeaders.append("X-API-KEY", xApiKey);
    myHeaders.append("Content-Type", "multipart/form-data");
    myHeaders.append("REFERRAL", "demo-app-solution");

    const formData = new FormData();
    formData.append("file2", {
      string: bankAccounts,
      type: "application/json",
      name: "bankAccounts.json",
    });
    formData.append("performOutputSubmission", 1);
    formData.append("bank", bank.identifier);

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: formData,
      redirect: "follow",
    };

    fetch(catAnalysisEndPoint, requestOptions)
      .then((response) => response.text()) // Parse the response body as text
      .then((result) => {
        console.log("API Response:", result); // Log the response text
        Alert.alert("Successfully submitted to CatAnalysis.");
      })
      .catch((error) => {
        console.log("API Error:", error);
        Alert.alert("Failed to submit to CatAnalysis.");
    });
  };