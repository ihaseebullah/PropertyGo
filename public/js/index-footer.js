document.getElementById("ownerCount").addEventListener("change", function () {
  const ownerCount = parseInt(this.value);
  const ownerFieldsDiv = document.getElementById("ownerFields");
  ownerFieldsDiv.innerHTML = "";

  for (let i = 0; i < ownerCount; i++) {
    const ownerNumber = i + 1;

    const ownerNameInput = document.createElement("input");
    ownerNameInput.type = "text";
    ownerNameInput.className = "form-control   mb-2";
    ownerNameInput.name = `ownerName`;
    ownerNameInput.placeholder = `Owner ${ownerNumber} Name`;
    ownerFieldsDiv.appendChild(ownerNameInput);

    const phoneNumberInput = document.createElement("input");
    phoneNumberInput.type = "text";
    phoneNumberInput.className = "form-control   mb-3";
    phoneNumberInput.name = `phoneNumber`;
    phoneNumberInput.placeholder = `Owner ${ownerNumber} Phone Number`;
    ownerFieldsDiv.appendChild(phoneNumberInput);
  }
});
const generateInstallmentsButton = document.getElementById(
  "generateInstallmentsButton"
);
const removeInstallmentsButton = document.getElementById(
  "removeInstallmentsButton"
);
const installmentFieldsContainer = document.getElementById(
  "installmentFieldsContainer"
);

generateInstallmentsButton.addEventListener("click", () => {
  const installmentNumberInput = document.getElementById("installmentNumber");
  const numInstallments = parseInt(installmentNumberInput.value);

  // Clear previous installment fields
  installmentFieldsContainer.innerHTML = "";

  for (let i = 1; i <= numInstallments; i++) {
    const installmentDiv = document.createElement("div");
    installmentDiv.className = "mb-3";

    const amountLabel = document.createElement("label");
    amountLabel.textContent = `Installment ${i} Amount`;
    amountLabel.setAttribute("for", `installmentAmount${i}`);

    const amountInput = document.createElement("input");
    amountInput.type = "text";
    amountInput.className = "form-control";
    amountInput.id = `installmentAmount${i}`;
    amountInput.placeholder = `Installment ${i} Amount`;
    amountInput.name = "installmentAmount";

    const dateLabel = document.createElement("label");
    dateLabel.textContent = `Installment ${i} Date`;
    dateLabel.setAttribute("for", `installmentDate${i}`);

    const dateInput = document.createElement("input");
    dateInput.type = "date";
    dateInput.className = "form-control";
    dateInput.id = `installmentDate${i}`;
    dateInput.name = "installmentDate";

    installmentDiv.appendChild(amountLabel);
    installmentDiv.appendChild(amountInput);
    installmentDiv.appendChild(dateLabel);
    installmentDiv.appendChild(dateInput);

    installmentFieldsContainer.appendChild(installmentDiv);
  }
});

removeInstallmentsButton.addEventListener("click", () => {
  // Clear installment fields
  installmentFieldsContainer.innerHTML = "";
});

function createInstallmentInput() {
  const originalDiv = document.getElementById("installmentRow").parentNode;

  // Clone the entire row div
  const clone = originalDiv.cloneNode(true);

  // Clear input values in the cloned div
  const inputFields = clone.querySelectorAll("input[type='text']");
  inputFields.forEach((input) => (input.value = ""));

  // Append the cloned div after the original div
  originalDiv.parentNode.insertBefore(clone, originalDiv.nextSibling);
}

function removeRow(button) {
  const rowToRemove = button.parentNode.parentNode;
  rowToRemove.parentNode.removeChild(rowToRemove);
}

function toggleInstallments(show) {
  const installmentDiv = document.getElementById("installmentDiv");
  installmentDiv.style.display = show ? "block" : "none";
}

function createBuyerInput() {
  const originalDiv = document.getElementById("buyerRow").parentNode;

  // Clone the entire row div
  const clone = originalDiv.cloneNode(true);

  // Clear input values in the cloned div
  const inputFields = clone.querySelectorAll("input");
  inputFields.forEach((input) => (input.value = ""));

  // Append the cloned div after the original div
  originalDiv.parentNode.insertBefore(clone, originalDiv.nextSibling);
}

function removeBuyerRow(button) {
  const rowToRemove = button.parentNode.parentNode;
  rowToRemove.parentNode.removeChild(rowToRemove);
}

function formatNumberToShortString(number) {
  const suffixes = ["", "Thousands", "Millions", "Billions", "Trillion"]; // K = Thousand, M = Million, B = Billion, T = Trillion

  const numString = number.toString();
  const numLength = numString.length;

  if (numLength <= 3) {
    return numString;
  }

  const suffixIndex = Math.floor((numLength - 1) / 3);
  const roundedValue = (number / Math.pow(1000, suffixIndex)).toFixed(1);

  return `${roundedValue} ${suffixes[suffixIndex]}`;
}

const number = 25000000;
const formattedString = formatNumberToShortString(number);
console.log(formattedString); // Output: "25.0 M"

