import React, { useState, useRef } from "react";
import { SafeAreaView, View, Button } from "react-native";
import { WebView } from "react-native-webview";
import { readRemoteFile, readString } from "react-native-csv";
import base64 from "Base64";

import styles from "../Styles";
import {SelectedBank, SelectAccounts} from "./components";
import { downloadFile, Instructions, MakeCatAbalysisApiSubmission } from "./library"

//Application Class
const App = () => {
  const webViewRef = useRef(null);
  const [webView, setWebView] = useState(
    selectedBank ? selectedBank.loginUrl : ""
  );
  const [injectedJs, setInjectedJs] = useState(
    selectedBank ? selectedBank.readContentJs : ""
  );
  const [showSelectAccount, setShowSelectAccounts] = useState(false);
  const [selectedAccounts, setSelectedAccounts] = useState([]);
  const [currentAccountId, setCurrentAccountId] = useState([]);
  const [accountsPageUrl, setAccountsPageUrl] = useState(null);
  const [currentUrl, setCurrentUrl] = useState(null);

  // Add state for the bank selection modal
  const [showSelectBank, setShowSelectBank] = useState(true);
  const [selectedBank, setselectedBank] = useState(null);

  // Function to handle bank selection
  const onSelectBank = (bank) => {
    setShowSelectBank(false);
    setselectedBank(bank);
    console.log(bank);
    setInjectedJs(bank.readContentJs());
    setWebView(bank.loginUrl);
  };

  const navigationStateChanged = (data) => {
    setCurrentUrl(data.url);
  };

  const onSendSelectAccounts = (selectedAccounts) => {
    setShowSelectAccounts(false);
    setSelectedAccounts(selectedAccounts);

    if (selectedAccounts.length > 0) {
      //inject appropriate js to get transactions before loading the page for the account
        let js = selectedBank.getTransactionsJs();
        if(js !== false) {
          setInjectedJs(js); //no need to inject for bnz as path is directly csv
        }
        let counter = 0;

        selectedAccounts.forEach((selectedAccount, index) => {
          setTimeout(function () {
            console.log("opening account " + JSON.stringify(selectedAccount));

            setCurrentAccountId(index); //index among currently seleted accounts

            //webViewRef.current.injectedJavaScript =

            setWebView(selectedAccount.accountLink); //Can we click it instead
            //this seems to be bit hard on already loaded page, so lets rely on just loading the url again
            // let js = jsToClickLink_cba(selectedAccounts[0].accountLink);
            // console.log(js);
            // webViewRef.current.injectedJavaScript = js;

            counter++;
            if (counter === selectedAccounts.length) {
              
              setShowSelectAccounts(false); //this shouldn't be necessary here 

              setTimeout(function () {
                console.log("done scrapping, lets submit the results....");
                setWebView(selectedBank.logoutUrl);

                //make api submission
                MakeCatAbalysisApiSubmission(selectedBank, selectedAccounts);
              }, 7000);
            }
          }, 7000 * index); // Execute after a 5-second delay
        });
      }
  };

  const onMessage = (data) => {
    // console.log("ON MESSAGE -- " + currentUrl);
    const html = data.nativeEvent.data;

    const accounts = selectedBank.parseAccounts(html);
    if (accounts && accounts.length > 0) {
      setAccountsPageUrl(() => currentUrl);
      setSelectedAccounts(() => accounts); //put all available accounts
      setShowSelectAccounts(() => true);
    }
  };

  const handleWebViewNavigation = (event) => {
    const { url } = event;
    console.log("Inside handleWebViewNavigation " + url);
    console.log(selectedBank);
    // Check if the URL points to a CSV file download
    //TODO -- find the way to put this into instructions.js as its part of scrapping logic
    if (
      url.includes("format=C") //cba = CSV, bnz = C
    ) {
      // Handle the download here (e.g., trigger a file download)
      console.log("csv file detected at " + url);
      //just to handle bnz weird case, TODO handle properly later
      setShowSelectAccounts(false);

      // let localFilePath = downloadFile(url, 'csvData.csv');
      // console.log(localFilePath);
      readRemoteFile(url, {
        download: true,
        complete: (results) => {
          let csv = results["data"];
          if(selectedBank.isCsvBase64Encoded === true) {
            csv = base64.atob(results["data"]);
            csv = readString(csv);
            csv = csv["data"];
          } 
          console.log(csv);
          selectedAccounts[currentAccountId].transactions = csv;
          console.log(
            selectedAccounts[currentAccountId].accountName +
              " account csv downloaded"
          );
          setSelectedAccounts(selectedAccounts);

          //let's get account holder information
          // let js = jsToGetAccountHolderName_cba();
          // setInjectedJs(js);
          // setWebView(selectedAccounts[currentAccountId].accountLink);
        },
      });

      return false;
    }
    // Continue loading the URL in the WebView
    return true;
  };

  // const handleFileDownload = async (event) => {

  //   function getCircularReplacer() {
  //     const ancestors = [];
  //     return function (key, value) {
  //       if (typeof value !== "object" || value === null) {
  //         return value;
  //       }
  //       while (ancestors.length > 0 && ancestors.at(-1) !== this) {
  //         ancestors.pop();
  //       }
  //       if (ancestors.includes(value)) {
  //         return "[Circular]";
  //       }
  //       ancestors.push(value);
  //       return value;
  //     };
  //   }

  //   e = JSON.stringify(event, getCircularReplacer());

  //   console.log('EVENT DOWNLOAD ' + e);
  // };

  //application UI code
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <SelectedBank
        isVisible={showSelectBank}
        banks={Instructions}
        onSelect={onSelectBank}
      />

      <SelectAccounts
        isVisible={showSelectAccount}
        accounts={selectedAccounts}
        onSend={onSendSelectAccounts}
      />

      <WebView
        ref={webViewRef}
        userAgent={
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.84 Safari/537.36"
        }
        webViewSettings={{
          loadWithOverviewMode: true,
          useWideViewPort: true,
        }}
        source={{ uri: webView }}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        onNavigationStateChange={(data) => {
          navigationStateChanged(data);
          //, console.log(data)
        }}
        onMessage={onMessage}
        //injectedJavaScript={readContentJs}
        onLoad={() => {
          // Inject the JavaScript code when the WebView has finished loading.
          if (injectedJs) {
            webViewRef.current.injectJavaScript(injectedJs);
          }
        }}
        onShouldStartLoadWithRequest={handleWebViewNavigation}
        // onFileDownload={handleFileDownload} //this get triggered in ios only
        onContentProcessDidTerminate={() => this.webView.reload()}
      />

      <View style={styles.buttonsContainer}>
        <Button
          title="Back"
          onPress={() => {
            if (selectedBank) {
              setInjectedJs(selectedBank.readContentJs());
            }
            webViewRef.current.goBack();
            console.log("going backto logout");
          }}
        />
        <Button
          title="Home"
          onPress={() => {
            if (selectedBank) {
              setWebView(selectedBank.loginUrl);
              setSelectedAccounts([]);
            }
            console.log("going to home page");
          }}
        />
        <Button
          title="Logout"
          onPress={() => {
            if (selectedBank) {
              setWebView(selectedBank.logoutUrl);
            }
            console.log("going to logout");
            setWebView("");
            setSelectedAccounts([]);
            setShowSelectBank(true);
          }}
        />
      </View>
    </SafeAreaView>
  );
};

export default App;
