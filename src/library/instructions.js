import cheerio from "react-native-cheerio";

const Instructions = [
  // CBA INSTRUCTIONS
  {
    identifier: "cba",
    name: "Commonwealth Bank",
    loginUrl: "https://netbank.com.au",
    logoutUrl:
      "https://www.my.commbank.com.au/netbank/UserMaintenance/Logout.aspx",
    readContentJs: function () {
      return `function getHtml() {
                            return document.querySelector("body").innerHTML;
                        }  
                        const html = getHtml();
                        window.ReactNativeWebView.postMessage(html);`;
    },
    parseAccounts: function (html) {
      console.log("parsing cba accounts");
      const $ = cheerio.load(html);

      //scrap accounts
      const accounts = [];
      const accountWrapper = $("div.account-wrapper");
      if (accountWrapper.length > 0) {
        console.log("scrapping accounts information");

        let id = 0;
        accountWrapper.each(function () {
          const account = {};
          const accountName = $(this).find("h3.account-name").attr("title");
          const accountNumbers = $(this)
            .find('div.account-number span[aria-hidden="true"]')
            .text()
            .split(/\s+/);
          const accountBalance = $(this)
            .find("span.monetary-value")
            .attr("title");
          const accountLink = $(this).find("a.account-link").attr("href");

          if (accountName) {
            account.accountName = accountName;
          }

          if (accountNumbers.length === 3) {
            account.accountBSB = accountNumbers[0];
            account.accountNumber = accountNumbers[1] + accountNumbers[2];
          } else {
            account.accountNumber = accountNumbers.join("");
          }

          if (accountBalance) {
            account.accountBalance = accountBalance;
          }

          if (accountLink) {
            account.accountLink = accountLink.includes("https://")
              ? accountLink
              : "https://www.commbank.com.au" + accountLink;
          }

          account.id = id;
          accounts.push(account);
          id++;
        });
      }
      return accounts;
    },
    getTransactionsJs: function (days = 90) {
      return (
        ` setTimeout(function() {
                              let now = new Date();
                              let endDate = now.getDate() + '-' + (now.getMonth() + 1) + '-' + now.getFullYear();
                              let lastDays = new Date(now.setDate(now.getDate() - ` + days + `));
                              let startDate = lastDays.getDate() + '-' + (lastDays.getMonth() + 1) + '-' + lastDays.getFullYear();
                              document.getElementById('date-filter-bubble').click();
                        
                              document.getElementById('date-picker-prev-month-btn').click();
                              document.getElementById('date-picker-prev-month-btn').click();
                              document.getElementById('date-picker-prev-month-btn').click();
                        
                              // Find all buttons on the current page
                              var buttons = document.querySelectorAll('button[data-date="' + startDate + '"]');
                              buttons[0].click();
                        
                        
                              document.getElementById('date-picker-next-month-btn').click();
                              document.getElementById('date-picker-next-month-btn').click();
                              document.getElementById('date-picker-next-month-btn').click();
                        
                        
                              var buttons = document.querySelectorAll('button[data-date="' + endDate + '"]');
                              buttons[0].click();
                           
                        
                              document.getElementById('date-filter-modal-submit-btn').click();
                            }, 1000); // Execute after a 1-second delay
                        
                            setTimeout(function() {
                              document.getElementById('export-link').click();
                              document.getElementById('export-format-type-CSV').click();
                              document.getElementById('txnListExport-submit-btn').click();
                            }, 3000);
                        
                            ` +
        this.readContentJs()
      );
    },
    parseTransactionFromCsvRow: function(txn) {
        /*
        txn = [
        "14/09/2023", //date
        "+3000.00",
        "Transfer from xx5037 CommBank app", //text
        "+18143.01" //balance
          ]
        */
      if (txn.length === 4) {
        const transaction = {};
        let credit = 0;
        let debit = 0;
        if (txn[1].includes("+")) {
          credit = parseFloat(txn[1].replace("+", ""));
        } else {
          debit = parseFloat(txn[1].replace("-", ""));
        }
        transaction.credit = credit;
        transaction.debit = debit;
        transaction.date = txn[0];
        transaction.balance = txn[3].replace("+", ""); //- sign is ok
        transaction.text = txn[2];
        return transaction;
    }
    return false;
  },
  },
  // BNZ BANK INSTRUCTIONS
  {
    identifier: "bnz",
    name: "BNZ Bank",
    loginUrl: "https://secure.bnz.co.nz/auth/personal-login",
    logoutUrl: "https://secure.bnz.co.nz/auth/logout",
    readContentJs: function() { return `function getHtml() {
                            return document.querySelector("body").innerHTML;
                        }
                        setTimeout(function () {
                        const html = getHtml();
                        window.ReactNativeWebView.postMessage(html);
                        },5000);`},
    parseAccounts: function (html) {
      // Load the HTML content into Cheerio
      const $ = cheerio.load(html);

      // Select the account information elements
      const accountElements = $(".js-account");

      // Initialize an array to store the account data
      const accounts = [];
      let id = 0;
      // Iterate over each account element and extract the information
      accountElements.each((index, element) => {
        const accountName = $(element).find(".js-account-name").text().trim();
        const accountNumber = $(element)
          .find(".ProductsList-accountNumber")
          .text()
          .trim();
        const accountBalance = $(element)
          .find(".js-ProductsList-accountCurrentBalance")
          .text()
          .trim();

        const accountId = $(element).attr('data-drag-id');
        console.log(accountId);

        const account = {};
        // Push the extracted data into the accountData array

        if (accountName) {
          account.accountName = accountName;
        }

        if (accountNumber) {
          account.accountNumber = accountNumber;
        }

        account.accountBSB = "";
        if (accountBalance) {
          account.accountBalance = accountBalance;
        }
        if(accountId) {
            let days = 90; //hardcoded for now
            let now = new Date();
            let endDate = now.getFullYear() + '-' + (now.getMonth() + 1) + '-' + now.getDate();
            let lastDays = new Date(now.setDate(now.getDate() - days));
            let startDate = lastDays.getFullYear() + '-' + (lastDays.getMonth() + 1) + '-' + lastDays.getDate();
            account.accountLink = "https://bnz.co.nz/ib/api/accounts/" + accountId + "/transactions/export?fromDate=" + startDate + "&toDate=" + endDate + "&format=C";
        }
        account.id = id;
        accounts.push(account);
        id++;
      });
      return accounts;
    },
    getTransactionsJs: function () {
        return false; //no need to inject js to grab transactions
    },
    isCsvBase64Encoded: true,
    parseTransactionFromCsvRow: function(txn) {
      //Date,Amount,Payee,Particulars,Code,Reference,Tran Type,This Party Account,Other Party Account,Serial,Transaction Code,Batch Number,Originating Bank/Branch,Processed Date
      //24/08/23,-0.50,Ods2,Savings,,,AP,02-0184-0463738-00,02-0184-0463738-01,,"15",0000,"02-0985",24/08/23
      if (txn.length === 14) {
        if(txn[0] === "Date") {
          return false; //header row
        }
        const transaction = {};
        let credit = 0;
        let debit = 0;
        if (txn[1].includes("+")) {
          credit = parseFloat(txn[1].replace("+", ""));
        } else {
          debit = parseFloat(txn[1].replace("-", ""));
        }
        transaction.credit = credit;
        transaction.debit = debit;
        transaction.date = txn[0];
        transaction.balance = 0; // not available in csv, have to think of some other way
        transaction.text = txn[2] + ' ' + txn[3] + ' ' + txn[4];
        return transaction;
    }
    return false;
  },
  },
  // Add more banks as needed
];

export default Instructions