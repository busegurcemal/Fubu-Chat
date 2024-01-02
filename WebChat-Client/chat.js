"use strict";

const connection = new signalR.HubConnectionBuilder()
    .withUrl("https://localhost:7123/chathub")
    .configureLogging(signalR.LogLevel.Information)
    .build();

const start = async () => {
    try {
        await connection.start();
        console.log("Connected to signal r hub");
    } catch (error) {
        console.log(error);
    }
}

// kullanıcı adını istem modundan alıyoruz ve oturum depolama alanında saklıyoruz
// oturum depolama alanı, bir tarayıcı sekmesi açılana kadar mevcuttur
const joinUser = async () => {
    const name = window.prompt('Kullanıcı adınızı giriniz: ');
    if (name)
    {
        sessionStorage.setItem('user', name);   
        // burada kullanıcı sohbete katılacak
        await joinChat(name);
    }
}

const joinChat = async (user) => {
    if (!user)
       return;
    try {
        const message = `${user} katıldı`;
        await connection.invoke("JoinChat", user, message);
        alert(user, message);
    } catch (error) {
        console.log(error);
    }
}

const LeaveChat = async (user) => {
    if (!user)
       return;
    try {
        const message = `${user} ayrıldı`;
        await connection.invoke("LeaveChat", user, message);
        alert(user, message);
    } catch (error) {
        console.log(error);
    }
}

// kullanıcıyı oturum deposundan getiriyoruz
const getUser = () => sessionStorage.getItem('user')

// sunucu tarafından bildirim alma metodu 
const receiveMessage = async () => {
    const currentUser = getUser();
    if (!currentUser)
        return;

    try {
        // ReceiveMessage olayına abone ol
        connection.on("ReceiveMessage", (user, message) => {
            const messageClass = currentUser === user ? "send" : "received";
            appendMessage(message, messageClass);
            const alertSound = new Audio('chat-sound.mp3');
            alertSound.play();
        });

        // ReceiveLeaveMessage olayına abone ol
        connection.on("ReceiveLeaveMessage", (user, message) => {
            const leaveMessage = `${user}`;
            appendMessage(leaveMessage, "leave");
        });
    } catch (error) {
        console.log(error);
    }
}

// mesaj bölümüne mesaj ekle
const appendMessage = (message,messageClass) => {
    const messageSectionEl = document.getElementById('messageSection');
    const msgBoxEl = document.createElement("div");
    msgBoxEl.classList.add("msg-box");
    msgBoxEl.classList.add(messageClass);
    msgBoxEl.innerHTML = message;
    messageSectionEl.appendChild(msgBoxEl);
}

// send button çalışma
document.getElementById('btnSend').addEventListener('click', async (e) => {
    e.preventDefault();
    const user = getUser();
    if (!user)
        return;
    const txtMessageEl = document.getElementById('txtMessage');
    const msg = txtMessageEl.value;
    if (msg) {

        await sendMessage(user,`${user}: ${msg}`);
        txtMessageEl.value = "";
    }
})

document.getElementById('btnLeave').addEventListener('click', async (e) => {
    e.preventDefault();
    const user = getUser();
    if (!user)
        return;

    await LeaveChat(`${user} ayrıldı`);
     connection.stop();
});

const sendMessage = async (user,message) => {
    
    try {
        await connection.invoke('SendMessage', user, message);
    } catch (error) {
        console.log(error);
    }
}


// uyg başla
const startApp = async () => {
    
    await start(); // bağlantı sabitleme
    await joinUser();
    await receiveMessage();
    await LeaveChat();
    await receiveLeaveMessage();

}

startApp();