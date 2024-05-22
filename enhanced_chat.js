const userIdInput = document.getElementById('userIdInput');
const connectButton = document.getElementById('connectButton');
const chat = document.getElementById('chat');
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');
const fileInput = document.getElementById('fileInput');
const fileButton = document.getElementById('fileButton');

let localConnection;
let remoteConnection;
let sendChannel;
let receiveChannel;
let peerId;

function createConnection() {
    localConnection = new RTCPeerConnection();
    sendChannel = localConnection.createDataChannel('sendChannel');

    localConnection.onicecandidate = e => {
        if (e.candidate) {
            remoteConnection.addIceCandidate(e.candidate);
        }
    };

    remoteConnection = new RTCPeerConnection();
    remoteConnection.onicecandidate = e => {
        if (e.candidate) {
            localConnection.addIceCandidate(e.candidate);
        }
    };

    remoteConnection.ondatachannel = e => {
        receiveChannel = e.channel;
        receiveChannel.onmessage = handleReceiveMessage;
    };

    localConnection.createOffer().then(offer => {
        localConnection.setLocalDescription(offer);
        remoteConnection.setRemoteDescription(offer);
        return remoteConnection.createAnswer();
    }).then(answer => {
        remoteConnection.setLocalDescription(answer);
        localConnection.setRemoteDescription(answer);
    });
}

function handleReceiveMessage(event) {
    if (typeof event.data === 'string') {
        const message = document.createElement('div');
        message.textContent = 'Friend: ' + event.data;
        chat.appendChild(message);
    } else {
        const blob = new Blob([event.data]);
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'file';
        link.textContent = 'Download file';
        chat.appendChild(link);
    }
}

sendButton.onclick = () => {
    const message = document.createElement('div');
    message.textContent = 'You: ' + messageInput.value;
    chat.appendChild(message);

    sendChannel.send(messageInput.value);
    messageInput.value = '';
};

fileButton.onclick = () => {
    const file = fileInput.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = () => {
            const arrayBuffer = reader.result;
            sendChannel.send(arrayBuffer);
        };
        reader.readAsArrayBuffer(file);
    }
};

connectButton.onclick = () => {
    peerId = userIdInput.value;
    createConnection();
};
