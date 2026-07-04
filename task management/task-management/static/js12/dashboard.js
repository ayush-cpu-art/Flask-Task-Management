// =========================================
// Dashboard
// =========================================

let statusChart;
let priorityChart;

document.addEventListener("DOMContentLoaded", () => {

    loadDashboard();

});


// =========================================
// Load Dashboard
// =========================================

async function loadDashboard() {

    try {

        const response = await fetch("/dashboard/stats");

        const data = await response.json();

        if (!data.success) {

            alert("Unable to load dashboard.");

            return;

        }

        // ================================
        // Statistics Cards
        // ================================

        document.getElementById("totalTasks").innerText =
            data.total;

        document.getElementById("completedTasks").innerText =
            data.completed;

        document.getElementById("pendingTasks").innerText =
            data.pending;

        // ================================
        // Welcome Text
        // ================================

        const welcome =
            document.getElementById("welcomeText");

        if (welcome) {

            welcome.innerText =
                "Welcome Back 👋";

        }

        // ================================
        // Charts
        // ================================

        createStatusChart(data);

        createPriorityChart(data);

    }

    catch (error) {

        console.error(error);

        alert("Unable to load dashboard.");

    }

}


// =========================================
// Status Chart
// =========================================

function createStatusChart(data) {

    if (statusChart) {

        statusChart.destroy();

    }

    const ctx =
        document.getElementById("statusChart");

    statusChart = new Chart(ctx, {

        type: "doughnut",

        data: {

            labels: [

                "Completed",
                "Pending"

            ],

            datasets: [{

                data: [

                    data.completed,
                    data.pending

                ],

                backgroundColor: [

                    "#22c55e",
                    "#ef4444"

                ],

                borderWidth: 2

            }]

        },

        options: {

            responsive: true,

            plugins: {

                legend: {

                    position: "bottom"

                }

            }

        }

    });

}


// =========================================
// Priority Chart
// =========================================

function createPriorityChart(data) {

    if (priorityChart) {

        priorityChart.destroy();

    }

    const ctx =
        document.getElementById("priorityChart");

    priorityChart = new Chart(ctx, {

        type: "bar",

        data: {

            labels: [

                "High",
                "Medium",
                "Low"

            ],

            datasets: [{

                label: "Tasks",

                data: [

                    data.high,
                    data.medium,
                    data.low

                ],

                backgroundColor: [

                    "#ef4444",
                    "#f59e0b",
                    "#22c55e"

                ],

                borderRadius: 8

            }]

        },

        options: {

            responsive: true,

            plugins: {

                legend: {

                    display: false

                }

            },

            scales: {

                y: {

                    beginAtZero: true,

                    ticks: {

                        precision: 0

                    }

                }

            }

        }

    });

}