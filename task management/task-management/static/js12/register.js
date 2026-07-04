// =========================================
// Register User
// =========================================

async function registerUser() {

    const username = document.getElementById("username").value.trim();

    const password = document.getElementById("password").value;

    const confirmPassword =
        document.getElementById("confirmPassword").value;

    if (username === "" || password === "" || confirmPassword === "") {

        alert("Please fill all fields.");

        return;

    }

    if (password !== confirmPassword) {

        alert("Passwords do not match.");

        return;

    }

    try {

        const response = await fetch("/register", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({

                username: username,
                password: password

            })

        });

        const data = await response.json();

        alert(data.message);

        if (data.success) {

            window.location.href = "/";

        }

    }

    catch (error) {

        console.error(error);

        alert("Something went wrong.");

    }

}


// =========================================
// Page Load
// =========================================

document.addEventListener("DOMContentLoaded", () => {

    document
        .getElementById("registerBtn")
        .addEventListener("click", registerUser);

});