const urlBase = 'http://ucfgroup9.xyz/LAMPAPI';
const extension = 'php';

let userId = 0;
let firstName = "";
let lastName = "";

function doLogin() {
    userId = 0;
    firstName = "";
    lastName = "";

    let login = document.getElementById("loginName").value;
    let password = document.getElementById("loginPassword").value;

    document.getElementById("loginResult").innerHTML = "";

    let tmp = { login: login, password: password };
    let jsonPayload = JSON.stringify(tmp);

    let url = urlBase + '/Login.' + extension;

    let xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
    try {
        xhr.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                let jsonObject = JSON.parse(xhr.responseText);
                userId = jsonObject.id;

                if (userId < 1) {
                    document.getElementById("loginResult").innerHTML = "User/Password combination incorrect";
                    return;
                }

                firstName = jsonObject.firstName;
                lastName = jsonObject.lastName;

                saveCookie();

                window.location.href = "contact.html";
            }
        };
        xhr.send(jsonPayload);
    }
    catch (err) {
        document.getElementById("loginResult").innerHTML = err.message;
    }
}

function doRegister() {
    let login = document.getElementById("registerName").value;
    let password = document.getElementById("registerPassword").value;
    let registerFirstName = document.getElementById("firstName").value;
    let registerLastName = document.getElementById("lastName").value;

    document.getElementById("registerResult").innerHTML = "";

    if (login.trim() === "" || password.trim() === "" || registerFirstName.trim() === "" || registerLastName.trim() === "") {
        console.log("Username, Password, First Name, and Last Name can't be empty");
        document.getElementById("registerResult").innerHTML = "All fields are required.";
        return;
    }

    let tmp = {
        login: login,
        password: password,
        firstName: registerFirstName,
        lastName: registerLastName
    };
    let jsonPayload = JSON.stringify(tmp);

    let url = urlBase + '/Register.' + extension;

    let xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
    try {
        xhr.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                let jsonObject = JSON.parse(xhr.responseText);

                if (jsonObject.error) {
                    document.getElementById("registerResult").innerHTML = jsonObject.error;
                    return;
                }
                console.log(jsonObject.id);
                if (jsonObject.id && jsonObject.id > 0) {
                    document.getElementById("registerResult").innerHTML = "Registration successful! Redirecting to login...";
                    console.log("Registration successful");
                    setTimeout(() => {
                        window.location.href = "index.html";
                    }, 1000); // return to login after 1 sec
                }
            }
        };
        xhr.send(jsonPayload);
    }
    catch (err) {
        document.getElementById("registerResult").innerHTML = "An unexpected error occurred: " + err.message;
        console.error("Caught error during registration process:", err);
    }
}

function saveCookie() {
    let minutes = 20;
    let date = new Date();
    date.setTime(date.getTime() + (minutes * 60 * 1000));
    document.cookie = "firstName=" + firstName + ",lastName=" + lastName + ",userId=" + userId + ";expires=" + date.toGMTString();
}

function readCookie() {
    userId = -1;
    let data = document.cookie;
    let splits = data.split(",");
    for (var i = 0; i < splits.length; i++) {
        let thisOne = splits[i].trim();
        let tokens = thisOne.split("=");
        if (tokens[0] == "firstName") {
            firstName = tokens[1];
        }
        else if (tokens[0] == "lastName") {
            lastName = tokens[1];
        }
        else if (tokens[0] == "userId") {
            userId = parseInt(tokens[1].trim());
        }
    }
    const path = window.location.pathname;
    const currentPage = path.substring(path.lastIndexOf('/') + 1)
    if (userId < 0) {
		if (currentPage !== "index.html" && currentPage !== "") {
           window.location.href = "index.html";
        }
    }
    else {
        document.getElementById("userName").innerHTML = "Welcome " + firstName + " " + lastName;
    }
}

function doLogout() {
    userId = 0;
    firstName = "";
    lastName = "";
    document.cookie = "firstName= ; expires = Thu, 01 Jan 1970 00:00:00 GMT";
    window.location.href = "index.html";
}

function showAddContactForm() {
    var modal = document.getElementById("addContactModal");
    modal.style.display = "block";
}

function hideAddContactForm() {
    var modal = document.getElementById("addContactModal");
    modal.style.display = "none";
    document.getElementById("addFirstNameText").value = "";
    document.getElementById("addLastNameText").value = "";
    document.getElementById("addEmailText").value = "";
    document.getElementById("addPhoneText").value = "";
    document.getElementById("contactAddResult").innerHTML = "";
}

window.onclick = function (event) {
    var modal = document.getElementById("addContactModal");
    if (event.target == modal) {
        hideAddContactForm();
    }
}

function addContact() {
    let firstName = document.getElementById("addFirstNameText").value;
    let lastName = document.getElementById("addLastNameText").value;
    let email = document.getElementById("addEmailText").value;
    let phoneNum = document.getElementById("addPhoneText").value;
    document.getElementById("contactAddResult").innerHTML = "";

    if (!(checkRequirements(firstName, lastName, email, phoneNum))) {
        return;
    }

    let tmp = {
        firstName: firstName,
        lastName: lastName,
        phone: phoneNum,
        email: email,
        userId: userId
    };
    let jsonPayload = JSON.stringify(tmp);

    let url = urlBase + '/AddContact.' + extension;

    let xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
    try {
        xhr.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                let jsonObject = JSON.parse(xhr.responseText);
                if (jsonObject.error) {
                    document.getElementById("contactAddResult").innerHTML = jsonObject.error;
                } else {
                    let message = firstName + " was added to your contacts";
                    document.getElementById("contactAddResult").innerHTML = message;
                    console.log("Contact added successfully");
                    // Refresh the contact list after adding
                    searchContact();
                }
            }
        };
        xhr.send(jsonPayload);
    }
    catch (err) {
        document.getElementById("contactAddResult").innerHTML = err.message;
    }
}

function checkRequirements(firstName, lastName, email, phoneNum) {
    if (firstName === "" || lastName === "" || email === "" || phoneNum === "") {
        document.getElementById("contactAddResult").innerHTML = "All contact fields are required.";
        console.log("No empty Fields");
        return false;
    }
    if (!(email.includes('@') && email.includes('.'))) { // Changed .com to . for broader email validity
        document.getElementById("contactAddResult").innerHTML = "Ensure email is a valid email (e.g., example@domain.com)";
        console.log("Missing @ or . in email");
        return false;
    }
    const validArr = new Set(["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "+", "-", "(", ")", " "]); // Added more valid characters for phone numbers
    for (let i = 0; i < phoneNum.length; i++) {
        const curr = phoneNum[i];
        if (i !== 0 && curr === "+") {
            document.getElementById("contactAddResult").innerHTML = "For International Numbers please make sure + is at the beginning.";
            console.log("International numbers must start with +. There can't be a + anywhere else");
            return false;
        }
        if (!validArr.has(curr)) {
            document.getElementById("contactAddResult").innerHTML = "Invalid phone number format. Only numbers, +, -, (), and spaces are allowed.";
            console.log("Invalid phone number character: " + curr);
            return false;
        }
    }
    return true;
}

function searchContact() {
    let srch = document.getElementById("searchText").value;
    document.getElementById("contactSearchResult").innerHTML = "";

    let tmp = { search: srch, userId: userId };
    let jsonPayload = JSON.stringify(tmp);

    let url = urlBase + '/SearchContacts.' + extension;

    let xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
    try {
        xhr.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                let jsonObject = JSON.parse(xhr.responseText);

                // Clear existing table rows
                let tableBody = document.querySelector("#contacts tbody");
                tableBody.innerHTML = "";

                if (jsonObject.error) {
                    document.getElementById("contactSearchResult").innerHTML = "Error: " + jsonObject.error;
                    return;
                }

                if (jsonObject.results.length === 0) {
                    document.getElementById("contactSearchResult").innerHTML = "No contacts found.";
                } else {
                    jsonObject.results.forEach(contact => {
                        let row = tableBody.insertRow();
                        row.insertCell().textContent = contact.FirstName;
                        row.insertCell().textContent = contact.LastName;
                        row.insertCell().textContent = contact.Email;
                        row.insertCell().textContent = contact.Phone;

                        // Add action buttons (Edit and Delete)
                        let actionsCell = row.insertCell();
                        let editButton = document.createElement("button");
                        editButton.textContent = "Edit";
                        editButton.className = "buttons";
                        editButton.onclick = function() { editContact(contact); }; // Pass the contact object to edit
                        actionsCell.appendChild(editButton);

                        let deleteButton = document.createElement("button");
                        deleteButton.textContent = "Delete";
                        deleteButton.className = "buttons";
                        deleteButton.onclick = function() { deleteContact(contact.ID); }; // Pass contact ID to delete
                        actionsCell.appendChild(deleteButton);
                    });
                }
            }
        };
        xhr.send(jsonPayload);
    }
    catch (err) {
        document.getElementById("contactSearchResult").innerHTML = err.message;
    }
}
		document.addEventListener('DOMContentLoaded', function () {
		readCookie();
		if(userId > 0){
		searchContact(); // Call searchContact on page load to display all contacts
		// Add event listener for real-time search
		document.getElementById("searchText").addEventListener("keyup", searchContact);
		}
	}, false);

function editContact(contact) {
   // ToDO
   alert("Todo")
}

function deleteContact(contactId) {
    if (!confirm("Are you sure you want to delete this contact?")) {
        return;
    }

    let tmp = { id: contactId };
    let jsonPayload = JSON.stringify(tmp);

    let url = urlBase + '/DeleteContact.' + extension;

    let xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
    try {
        xhr.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                let jsonObject = JSON.parse(xhr.responseText);
                if (jsonObject.error) {
                    document.getElementById("contactSearchResult").innerHTML = "Error deleting contact: " + jsonObject.error;
                } else {
                    document.getElementById("contactSearchResult").innerHTML = "Contact deleted successfully.";
                    // Refresh the contact list after deletion
                    searchContact();
                }
            }
        };
        xhr.send(jsonPayload);
    }
    catch (err) {
        document.getElementById("contactSearchResult").innerHTML = err.message;
    }
}
