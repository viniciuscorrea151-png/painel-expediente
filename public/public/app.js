const socket = io();


// ==========================================
// CONFIGURAÇÕES
// ==========================================

const HORARIO_ENTRADA = 9;

const HORARIO_SAIDA_SEMANA = 18;

const HORARIO_SAIDA_SABADO = 15;


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
// CONFIGURAÇÃO INICIAL
// ==========================================

start.textContent = "09:00";


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
// CONFIGURAÇÃO DO DIA
// ==========================================

function obterConfiguracaoDoDia() {

    const agora = new Date();

    const dia =
        agora.getDay();

    /*
        0 = domingo
        1 = segunda
        2 = terça
        3 = quarta
        4 = quinta
        5 = sexta
        6 = sábado
    */

    if (dia === 0) {

        return {
            trabalhando: false,
            domingo: true
        };

    }


    if (dia === 6) {

        return {
            trabalhando: true,
            entrada: 9,
            saida: 15,
            nome: "SÁBADO"
        };

    }


    return {
        trabalhando: true,
        entrada: 9,
        saida: 18,
        nome: "DIA ÚTIL"
    };
}


// ==========================================
// CRIAR HORÁRIO
// ==========================================

function criarHorarioHoje(hora) {

    const data =
        new Date();

    data.setHours(
        hora,
        0,
        0,
        0
    );

    return data;
}


// ==========================================
// FORMATAR TEMPO
// ==========================================

function formatarTempo(segundos) {

    segundos =
        Math.max(
            0,
            Math.floor(segundos)
        );

    const horas =
        Math.floor(
            segundos / 3600
        );

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
                String(numero)
                    .padStart(2, "0")
        )
        .join(":");
}


// ==========================================
// PRÓXIMO DIA ÚTIL
// ==========================================

function encontrarProximoExpediente() {

    const agora =
        new Date();

    let dias =
        1;

    while (dias <= 7) {

        const proximo =
            new Date(agora);

        proximo.setDate(
            agora.getDate() + dias
        );

        const dia =
            proximo.getDay();

        if (dia >= 1 && dia <= 6) {

            return proximo;

        }

        dias++;

    }

    return agora;
}


// ==========================================
// TEMPORIZADOR
// ==========================================

function atualizarTemporizador() {

    const agora =
        new Date();

    const config =
        obterConfiguracaoDoDia();


    // ==============================
    // DOMINGO
    // ==============================

    if (config.domingo) {

        countdown.textContent =
            "DESCANSO";

        message.textContent =
            "Domingo. O expediente não existe hoje. 😎";

        progressBar.style.width =
            "100%";

        end.textContent =
            "--:--";

        return;
    }


    const entrada =
        criarHorarioHoje(
            config.entrada
        );

    const saida =
        criarHorarioHoje(
            config.saida
        );


    end.textContent =
        `${String(config.saida).padStart(2, "0")}:00`;


    // ==============================
    // ANTES DO EXPEDIENTE
    // ==============================

    if (agora < entrada) {

        const restante =
            Math.floor(
                (entrada - agora) / 1000
            );

        countdown.textContent =
            formatarTempo(restante);

        message.textContent =
            "O expediente ainda não começou. Aproveite. ☕";

        progressBar.style.width =
            "0%";

        return;
    }


    // ==============================
    // DEPOIS DO EXPEDIENTE
    // ==============================

    if (agora >= saida) {

        countdown.textContent =
            "00:00:00";

        progressBar.style.width =
            "100%";

        if (config.nome === "SÁBADO") {

            message.textContent =
                "SÁBADO ENCERRADO. VÁ SER FELIZ. 🍺";

        } else {

            message.textContent =
                "EXPEDIENTE ENCERRADO. VOCÊ SOBREVIVEU. 🫡";

        }

        return;
    }


    // ==============================
    // DURANTE O EXPEDIENTE
    // ==============================

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


    // ==============================
    // MENSAGENS
    // ==============================

    if (restante <= 300) {

        message.textContent =
            "É AGORA. SEGURE FIRME. 🏃💨";

    }

    else if (restante <= 1800) {

        message.textContent =
            "FALTA POUQUÍSSIMO. NÃO OLHE PARA TRÁS. 🔥";

    }

    else if (progresso >= 90) {

        message.textContent =
            "VOCÊ ESTÁ NA RETA FINAL. 🫡";

    }

    else if (progresso >= 75) {

        message.textContent =
            "75% DA DESGRAÇA JÁ FOI. 💀";

    }

    else if (progresso >= 50) {

        message.textContent =
            "METADE DO SOFRIMENTO JÁ PASSOU.";

    }

    else if (progresso >= 25) {

        message.textContent =
            "O DIA ESTÁ LONGO, MAS VOCÊ É MAIS.";

    }

    else {

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

    div.className =
        "message";


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


function adicionarMensagemSistema(text) {

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
            `${users.length} sobrevivente${users.length === 1 ? "" : "s"}`;


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

let ultimoPanic = 0;

panicButton.addEventListener(
    "click",
    () => {

        const agora =
            Date.now();

        if (
            agora - ultimoPanic <
            10000
        ) {

            return;
        }

        ultimoPanic =
            agora;

        socket.emit(
            "panic"
        );

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

