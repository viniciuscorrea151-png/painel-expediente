const socket = io();


// ==========================================
// CONFIGURAÇÃO DO EXPEDIENTE
// ==========================================

const HORARIO_ENTRADA = "08:00";
const HORARIO_SAIDA = "18:00";


// ==========================================
// ELEMENTOS
// ==========================================

const login = document.getElementById("login");
const app = document.getElementById("app");

const usernameInput =
    document.getElementById("username");

const enterButton =
    document.getElementById("enter");

const clock =
    document.getElementById("clock");

const countdown =
    document.getElementById("countdown");

const message =
    document.getElementById("message");

const progressBar =
    document.getElementById("progressBar");

const start =
    document.getElementById("start");

const end =
    document.getElementById("end");

const messages =
    document.getElementById("messages");

const chatForm =
    document.getElementById("chatForm");

const messageInput =
    document.getElementById("messageInput");

const usersList =
    document.getElementById("usersList");

const online =
    document.getElementById("online");

const panicButton =
    document.getElementById("panicButton");

const panicAlert =
    document.getElementById("panicAlert");

const panicText =
    document.getElementById("panicText");

const closePanic =
    document.getElementById("closePanic");


// ==========================================
// HORÁRIOS
// ==========================================

start.textContent = HORARIO_ENTRADA;
end.textContent = HORARIO_SAIDA;


// ==========================================
// USUÁRIO
// ==========================================

let currentUsername = "";


// ==========================================
// ENTRAR
// ==========================================

function entrar() {

    const username =
        usernameInput.value.trim();

    if (!username) {

        usernameInput.focus();

        return;
    }

    currentUsername = username;

    login.classList.add("hidden");

    app.classList.remove("hidden");

    socket.emit(
        "join",
        currentUsername
    );

    messageInput.focus();
}


enterButton.addEventListener(
    "click",
    entrar
);


usernameInput.addEventListener(
    "keydown",
    (event) => {

        if (event.key === "Enter") {

            entrar();

        }

    }
);


// ==========================================
// RELÓGIO
// ==========================================

function atualizarRelogio() {

    const agora = new Date();

    clock.textContent =
        agora.toLocaleTimeString(
            "pt-BR",
            {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit"
            }
        );
}


// ==========================================
// TEMPORIZADOR
// ==========================================

function criarHorarioHoje(horario) {

    const [hora, minuto] =
        horario.split(":").map(Number);

    const data = new Date();

    data.setHours(
        hora,
        minuto,
        0,
        0
    );

    return data;
}


function formatarTempo(segundos) {

    if (segundos < 0) {
        segundos = 0;
    }

    const horas =
        Math.floor(segundos / 3600);

    const minutos =
        Math.floor(
            (segundos % 3600) / 60
        );

    const segundosRestantes =
        segundos % 60;

    return [
        horas,
        minutos,
        segundosRestantes
    ]
        .map(
            numero =>
                String(numero).padStart(2, "0")
        )
        .join(":");
}


function atualizarTemporizador() {

    const agora = new Date();

    const entrada =
        criarHorarioHoje(HORARIO_ENTRADA);

    const saida =
        criarHorarioHoje(HORARIO_SAIDA);


    // Antes do expediente

    if (agora < entrada) {

        const restante =
            Math.floor(
                (entrada - agora) / 1000
            );

        countdown.textContent =
            formatarTempo(restante);

        message.textContent =
            "O sofrimento ainda nem começou. 😌";

        progressBar.style.width = "0%";

        return;
    }


    // Depois do expediente

    if (agora >= saida) {

        countdown.textContent =
            "00:00:00";

        message.textContent =
            "VOCÊ SOBREVIVEU AO EXPEDIENTE! 🎉";

        progressBar.style.width =
            "100%";

        return;
    }


    // Durante o expediente

    const total =
        (saida - entrada) / 1000;

    const passado =
        (agora - entrada) / 1000;

    const restante =
        Math.floor(
            (saida - agora) / 1000
        );


    countdown.textContent =
        formatarTempo(restante);


    const progresso =
        Math.min(
            100,
            Math.max(
                0,
                (passado / total) * 100
            )
        );


    progressBar.style.width =
        `${progresso}%`;


    // Mensagens aleatórias

    if (restante <= 300) {

        message.textContent =
            "É AGORA! NÃO DESISTA! 🏃";

    } else if (restante <= 1800) {

        message.textContent =
            "Falta pouco. Aguente firme. 🔥";

    } else if (progresso >= 75) {

        message.textContent =
            "Você já sobreviveu à maior parte. 💀";

    } else if (progresso >= 50) {

        message.textContent =
            "Metade da desgraça ficou para trás.";

    } else {

        message.textContent =
            "Força, guerreiro. O relógio está andando.";
    }
}


// ==========================================
// CHAT
// ==========================================

chatForm.addEventListener(
    "submit",
    (event) => {

        event.preventDefault();

        const text =
            messageInput.value.trim();

        if (!text) return;

        socket.emit(
            "chat:message",
            text
        );

        messageInput.value = "";

        messageInput.focus();
    }
);


function adicionarMensagem(
    username,
    text,
    time
) {

    const div =
        document.createElement("div");

    div.className = "message";


    const nome =
        document.createElement("strong");

    nome.textContent =
        username;


    const horario =
        document.createElement("small");

    horario.textContent =
        time;


    const texto =
        document.createElement("p");

    texto.textContent =
        text;


    div.appendChild(nome);

    div.appendChild(horario);

    div.appendChild(texto);


    messages.appendChild(div);


    messages.scrollTop =
        messages.scrollHeight;
}


function adicionarMensagemSistema(
    text
) {

    const div =
        document.createElement("div");

    div.className =
        "system-message";

    div.textContent =
        text;

    messages.appendChild(div);

    messages.scrollTop =
        messages.scrollHeight;
}


socket.on(
    "chat:message",
    (data) => {

        adicionarMensagem(
            data.username,
            data.message,
            data.time
        );

    }
);


socket.on(
    "system:message",
    (data) => {

        adicionarMensagemSistema(
            data.message
        );

    }
);


// ==========================================
// USUÁRIOS ONLINE
// ==========================================

socket.on(
    "users:update",
    (users) => {

        usersList.innerHTML = "";

        online.textContent =
            `${users.length} online`;


        users.forEach(
            user => {

                const div =
                    document.createElement("div");

                div.className =
                    "user";


                const dot =
                    document.createElement("span");

                dot.className =
                    "user-dot";


                const name =
                    document.createElement("span");

                name.textContent =
                    user.username;


                div.appendChild(dot);

                div.appendChild(name);


                usersList.appendChild(div);

            }
        );

    }
);


// ==========================================
// BOTÃO DO DESESPERO
// ==========================================

panicButton.addEventListener(
    "click",
    () => {

        socket.emit("panic");

    }
);


socket.on(
    "panic",
    (data) => {

        panicText.textContent =
            `${data.username} apertou o botão do desespero! 🚨`;

        panicAlert.classList.remove(
            "hidden"
        );

        setTimeout(
            () => {

                panicAlert.classList.add(
                    "hidden"
                );

            },
            5000
        );

    }
);


closePanic.addEventListener(
    "click",
    () => {

        panicAlert.classList.add(
            "hidden"
        );

    }
);


// ==========================================
// INICIALIZAÇÃO
// ==========================================

setInterval(
    atualizarRelogio,
    1000
);

setInterval(
    atualizarTemporizador,
    1000
);


atualizarRelogio();

atualizarTemporizador();
