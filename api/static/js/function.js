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

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = () => {
        ws.send(JSON.stringify({
            type: "file",
            fileName: file.name,
            data: reader.result
        }));
    };
}

function displayReceivedFile(fileName, fileData) {
    const fileList = document.getElementById("fileList");
    
    const link = document.createElement("a");
    link.href = fileData;
    link.download = fileName;
    link.innerText = `📥 Download ${fileName}`;
    
    fileList.appendChild(link);
    fileList.appendChild(document.createElement("br"));
}
