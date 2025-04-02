const socket = io();

function updateDashboard() {
    fetch("/api/data")
        .then(response => response.json())
        .then(data => {
            document.getElementById("active-users").innerText = data.active_users.length;
            document.getElementById("file-transfers").innerText = data.file_transfers.length;
        });
}

const ctx = document.getElementById("chart").getContext("2d");
const chart = new Chart(ctx, {
    type: "bar",
    data: {
        labels: ["Jan", "Feb", "Mar", "Apr", "May"],
        datasets: [{
            label: "User Activity",
            data: [3, 2, 5, 4, 6],
            backgroundColor: "blue"
        }]
    }
});

socket.on("refresh_data", updateDashboard);
updateDashboard();
