let ws;
let roomId;

function generateRoomId() {
    // Generate a random 6-digit room ID
    roomId = Math.floor(100000 + Math.random() * 900000).toString();
    
    document.getElementById("generatedRoomId").innerText = `Room ID: ${roomId}`;
    document.getElementById("roomId").value = roomId;
    
    joinRoom(); // Automatically join the room after generating
}

function joinRoom() {
    roomId = document.getElementById("roomId").value;
    if (!roomId) {
        alert("Enter a room code!");
        return;
    }

    ws = new WebSocket(`wss://bubbleshare.up.railway.app/ws/${roomId}`);

    ws.onopen = () => {
        console.log("Connected to WebSocket!");
        document.getElementById("fileSection").classList.remove("hidden");
    };

    ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        
        if (message.type === "file") {
            displayReceivedFile(message.fileName, message.data);
        }
    };

    ws.onerror = (error) => console.error("WebSocket Error:", error);
    ws.onclose = () => console.log("Disconnected from WebSocket");
}

async function sendFile() {
    const fileInput = document.getElementById("fileInput");
    const file = fileInput.files[0];

    if (!file || !ws) {
        alert("Select a file and join a room first!");
        return;
    }

    const totalSize = file.size;
    const chunkSize = 1024 * 1024; // 1 MB
    let offset = 0;

    const progressBar = document.getElementById("sendProgress");

    while (offset < totalSize) {
        const chunk = file.slice(offset, offset + chunkSize);
        const reader = new FileReader();

        reader.onload = () => {
            const base64Data = reader.result.split(',')[1]; // Remove data URL prefix
            ws.send(JSON.stringify({
                type: "file",
                fileName: file.name,
                data: base64Data,
                totalSize: totalSize
            }));

            offset += chunkSize;
            const progress = Math.min((offset / totalSize) * 100, 100);
            progressBar.style.width = progress + "%";
        };

        reader.readAsDataURL(chunk);
    }
}

function displayReceivedFile(fileName, fileData) {
    const fileList = document.getElementById("fileList");

    const link = document.createElement("a");
    link.href = fileData;
    link.download = fileName;
    link.innerText = `📥 Download ${fileName}`;

    fileList.appendChild(link);
    fileList.appendChild(document.createElement("br"));

    // Update receive progress bar (this can be improved to be more accurate based on chunked receiving)
    const progressBar = document.getElementById("receiveProgress");
    progressBar.style.width = "100%";
}

function showFileName() {
    const fileInput = document.getElementById("fileInput");
    const fileName = fileInput.files[0]?.name || "No file selected";
    document.getElementById("fileNameDisplay").innerText = `Selected File: ${fileName}`;
}
