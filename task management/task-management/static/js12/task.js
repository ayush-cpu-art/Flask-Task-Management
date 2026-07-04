// =========================================
// Global Variables
// =========================================

let editingTaskId = null;


// =========================================
// Page Load
// =========================================

document.addEventListener("DOMContentLoaded", () => {

    console.log("Task Management Loaded");

    loadTasks();

    document
        .getElementById("submitBtn")
        .addEventListener("click", submitTask);

});


// =========================================
// Toast Notification
// =========================================

function showToast(message, type = "success") {

    const toast = document.getElementById("toast");

    toast.className = "";

    toast.classList.add(type);

    toast.innerText = message;

    setTimeout(() => {

        toast.classList.add("show");

    }, 100);

    setTimeout(() => {

        toast.classList.remove("show");

    }, 3000);

}


// =========================================
// Add / Update Task
// =========================================

async function submitTask() {

    const title =
        document.getElementById("title").value.trim();

    const priority =
        document.getElementById("priority").value;

    const due_date =
        document.getElementById("due_date").value;

    const completed =
        document.getElementById("completed").value === "true";

    if (title === "") {

        showToast(
            "Please enter a task title.",
            "error"
        );

        return;

    }

    let url = "/submit";
    let method = "POST";

    if (editingTaskId !== null) {

        url = `/update/${editingTaskId}`;
        method = "PUT";

    }

    try {

        const response = await fetch(url, {

            method: method,

            headers: {

                "Content-Type": "application/json"

            },

            body: JSON.stringify({

                title: title,
                priority: priority,
                due_date: due_date,
                completed: completed

            })

        });

        const data = await response.json();

        if (data.success) {

            showToast(data.message);

            clearForm();

            loadTasks(
                document.getElementById("search").value
            );

        }

        else {

            showToast(
                data.message,
                "error"
            );

        }

    }

    catch (error) {

        console.error(error);

        showToast(
            "Server Error!",
            "error"
        );

    }

}


// =========================================
// Load Tasks
// =========================================

async function loadTasks(search = "") {

    try {

        const response = await fetch(

            `/tasks?search=${encodeURIComponent(search)}`

        );

        const tasks = await response.json();

        const tbody =
            document.querySelector("#taskTable tbody");

        tbody.innerHTML = "";

        tasks.forEach(task => {

            let priorityClass = "";

            switch (task.priority) {

                case "High":

                    priorityClass = "high";

                    break;

                case "Medium":

                    priorityClass = "medium";

                    break;

                default:

                    priorityClass = "low";

            }

            const row = document.createElement("tr");

            row.innerHTML = `

                <td>${task.id}</td>

                <td>${task.title}</td>

                <td>

                    <span class="priority ${priorityClass}">

                        ${task.priority}

                    </span>

                </td>

                <td>

                    ${task.due_date || "-"}

                </td>

                <td>

                    <span class="${
                        task.completed
                        ? "status-completed"
                        : "status-pending"
                    }">

                        ${
                            task.completed
                            ? "✅ Completed"
                            : "⏳ Pending"
                        }

                    </span>

                </td>

                <td>

                    <button
                        class="edit-btn">

                        Edit

                    </button>

                    <button
                        class="delete-btn">

                        Delete

                    </button>

                </td>

            `;

            row.querySelector(".edit-btn")
                .addEventListener("click", () => {

                    editTask(task);

                });

            row.querySelector(".delete-btn")
                .addEventListener("click", () => {

                    deleteTask(task.id);

                });

            tbody.appendChild(row);

        });

    }

    catch (error) {

        console.error(error);

        showToast(
            "Unable to load tasks.",
            "error"
        );

    }

}

// =========================================
// Search Tasks
// =========================================

function searchTasks() {

    const keyword =
        document.getElementById("search").value.trim();

    loadTasks(keyword);

}


// =========================================
// Edit Task
// =========================================

function editTask(task) {

    editingTaskId = task.id;

    document.getElementById("title").value =
        task.title;

    document.getElementById("priority").value =
        task.priority;

    document.getElementById("due_date").value =
        task.due_date || "";

    document.getElementById("completed").value =
        task.completed ? "true" : "false";

    const button =
        document.getElementById("submitBtn");

    button.innerText = "Update Task";

    button.classList.add("update-btn");

    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

}


// =========================================
// Delete Task
// =========================================

async function deleteTask(id) {

    const confirmDelete = confirm(
        "Are you sure you want to delete this task?"
    );

    if (!confirmDelete) {

        return;

    }

    try {

        const response = await fetch(

            `/delete/${id}`,

            {

                method: "DELETE"

            }

        );

        const data = await response.json();

        if (data.success) {

            showToast(
                "Task Deleted Successfully!"
            );

            if (editingTaskId === id) {

                clearForm();

            }

            loadTasks(
                document.getElementById("search").value
            );

        }

        else {

            showToast(
                data.message,
                "error"
            );

        }

    }

    catch (error) {

        console.error(error);

        showToast(
            "Unable to delete task.",
            "error"
        );

    }

}


// =========================================
// Clear Form
// =========================================

function clearForm() {

    editingTaskId = null;

    document.getElementById("title").value = "";

    document.getElementById("priority").value =
        "Medium";

    document.getElementById("due_date").value = "";

    document.getElementById("completed").value =
        "false";

    const button =
        document.getElementById("submitBtn");

    button.innerText = "Add Task";

    button.classList.remove("update-btn");

}


// =========================================
// Keyboard Shortcut
// Press Enter to Submit
// =========================================

document.addEventListener("keypress", function(event){

    if(event.key === "Enter"){

        const active =
            document.activeElement.tagName;

        if(active !== "TEXTAREA"){

            submitTask();

        }

    }

});


// =========================================
// Optional Refresh Function
// =========================================

function refreshTasks(){

    clearForm();

    loadTasks();

}


// =========================================
// End of task.js
// =========================================