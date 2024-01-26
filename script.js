// Retrieve data from localStorage or initialize an empty array
var transactions = JSON.parse(localStorage.getItem('transactions')) || [];
// Retrieve balance from localStorage or initialize with 7100
var balance = parseFloat(localStorage.getItem('balance')) || 7100;

// Update the balance display on the page
document.getElementById('balance').textContent = 'Balance: ₹' + balance.toFixed(2);

// Function to save data to localStorage
function saveDataToLocalStorage() {
  localStorage.setItem('transactions', JSON.stringify(transactions));
  localStorage.setItem('balance', balance.toFixed(2));
}

// Function to record a new transaction
function recordTransaction() {
  var description = document.getElementById('description').value.trim();
  var amount = parseFloat(document.getElementById('amount').value);
  var transactionType = document.getElementById('transactionType').value;

  if (isNaN(amount) || !description) {
    alert('Please enter valid values for description and amount.');
    return;
  }

  var transaction = {
    date: new Date().toLocaleDateString(),
    description: description,
    receipt: transactionType === 'receipt' ? amount.toFixed(2) : '',
    payment: transactionType === 'payment' ? amount.toFixed(2) : '',
  };

  transactions.push(transaction);
  updateBalance(transactionType, amount);
  updateTransactionList();
  clearInputFields();
  saveDataToLocalStorage(); // Save data after each transaction
}

// Function to update the balance based on the transaction type and amount
function updateBalance(type, amount) {
  if (type === 'receipt') {
    balance += amount;
  } else if (type === 'payment') {
    balance -= amount;
  }

  document.getElementById('balance').textContent = 'Balance: ₹' + balance.toFixed(2);
}

// Function to update the transaction list on the page
function updateTransactionList() {
  var tableBody = document.querySelector('#transactionList tbody');
  tableBody.innerHTML = '';

  transactions.forEach(function (transaction, index) {
    var row = tableBody.insertRow();

    for (var key in transaction) {
      if (transaction.hasOwnProperty(key)) {
        var cell = row.insertCell();
        cell.textContent = transaction[key];
      }
    }

    var editButton = document.createElement('button');
    editButton.textContent = 'Edit';
    editButton.addEventListener('click', function () {
      editTransaction(index);
    });

    var deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.addEventListener('click', function () {
      deleteTransaction(index);
    });

    row.insertCell().appendChild(editButton);
    row.insertCell().appendChild(deleteButton);
  });

  saveDataToLocalStorage(); // Save data after updating the transaction list
}

// Function to clear input fields after recording a transaction
function clearInputFields() {
  document.getElementById('description').value = '';
  document.getElementById('amount').value = '';
}

// Function to delete a transaction
function deleteTransaction(index) {
  transactions.splice(index, 1);
  updateTransactionList();
  updateBalanceAndRefresh();
}

// Function to update the balance and refresh the display
function updateBalanceAndRefresh() {
  balance = 7100;
  transactions.forEach(function (transaction) {
    if (transaction.receipt) {
      balance += parseFloat(transaction.receipt);
    } else if (transaction.payment) {
      balance -= parseFloat(transaction.payment);
    }
  });

  document.getElementById('balance').textContent = 'Balance: ₹' + balance.toFixed(2);
  saveDataToLocalStorage(); // Save data after updating the balance
}

// Function to view the transaction statement
function viewStatement() {
  document.getElementById('main-section').style.display = 'none';
  document.getElementById('statement-section').style.display = 'block';
  updateStatementList();
}

// Function to return to the main page
function returnToMainPage() {
  document.getElementById('main-section').style.display = 'block';
  document.getElementById('statement-section').style.display = 'none';
}

// Function to update the statement list on the page
function updateStatementList() {
  var statementTableBody = document.querySelector('#statementTransactionList tbody');
  statementTableBody.innerHTML = '';

  var runningBalance = 7100;

  transactions.forEach(function (transaction) {
    var statementRow = statementTableBody.insertRow();

    for (var key in transaction) {
      if (transaction.hasOwnProperty(key)) {
        var statementCell = statementRow.insertCell();
        statementCell.textContent = transaction[key];
      }
    }

    runningBalance = updateRunningBalance(transaction, runningBalance);
    var balanceCell = statementRow.insertCell();
    balanceCell.textContent = '₹' + runningBalance.toFixed(2);

    var statementEditButton = document.createElement('button');
    statementEditButton.textContent = 'Edit';
    statementEditButton.addEventListener('click', function () {
      editTransaction(transactions.indexOf(transaction));
    });

    var statementDeleteButton = document.createElement('button');
    statementDeleteButton.textContent = 'Delete';
    statementDeleteButton.addEventListener('click', function () {
      deleteTransaction(transactions.indexOf(transaction));
    });

    statementRow.insertCell().appendChild(statementEditButton);
    statementRow.insertCell().appendChild(statementDeleteButton);
  });

  saveDataToLocalStorage(); // Save data after updating the statement list
}

// Function to update the running balance in the statement
function updateRunningBalance(transaction, runningBalance) {
    if (transaction.receipt !== null && transaction.receipt !== undefined) {
      runningBalance += parseFloat(transaction.receipt);
    } else if (transaction.payment !== null && transaction.payment !== undefined) {
      runningBalance -= parseFloat(transaction.payment);
    }
  
    return runningBalance;
  }

// Function to edit a transaction
function editTransaction(index) {
  var editedTransaction = transactions[index];
  var editDescription = prompt('Edit Description:', editedTransaction.description);
  var editAmount = parseFloat(prompt('Edit Amount:', editedTransaction.receipt || editedTransaction.payment));

  if (editDescription && !isNaN(editAmount)) {
    transactions[index].description = editDescription;
    transactions[index].receipt = editedTransaction.receipt ? editAmount.toFixed(2) : '';
    transactions[index].payment = editedTransaction.payment ? editAmount.toFixed(2) : '';

    updateTransactionList();
    updateBalanceAndRefresh();
  }
}

// Function to download the statement in Excel format
function downloadExcel() {
  var csvContent = 'data:text/csv;charset=utf-8,';
  csvContent += 'Date,Description,Receipt,Payment,Balance\n';

  transactions.forEach(function (transaction) {
    csvContent += Object.values(transaction).join(',') + '\n';
  });

  var encodedUri = encodeURI(csvContent);
  var link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', 'cash_book_statement.csv');
  document.body.appendChild(link); // Required for Firefox
  link.click();
  document.body.removeChild(link);
}

// Function to download the statement in PDF format
function downloadPDF() {
  // ... (unchanged)

  saveDataToLocalStorage(); // Save data after downloading the statement
}

// Run this function when the page is loaded to populate data from localStorage
function initialize() {
    if (localStorage.getItem('transactions')) {
      transactions = JSON.parse(localStorage.getItem('transactions'));
    } else {
      // Initialize with a sample transaction
      transactions = [
        { timestamp: new Date().getTime(), description: 'Initial Balance', receipt: '7100.00', payment: '', balance: '7100.00' }
      ];
      saveDataToLocalStorage();
    }
  
    updateTransactionList();
    updateStatementList();
  }

initialize();
