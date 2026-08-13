// ============================================================
// ELEMENTOS PRINCIPAIS
// ============================================================

const dropZone =
    document.getElementById("drop-zone");

const fileInput =
    document.getElementById("file-input");

const cameraInput =
    document.getElementById("camera-input");

const btnSelecionar =
    document.getElementById("btn-selecionar");

const btnCamera =
    document.getElementById("btn-camera");

const btnReescanear =
    document.getElementById("btn-reescanear");

const btnSalvar =
    document.getElementById("btn-salvar");

const statusArea =
    document.getElementById("status-area");

const statusText =
    document.getElementById("status-text");

const statusIcon =
    document.getElementById("status-icon");

const dataVisualization =
    document.getElementById("data-visualization");

const arquivoSelecionado =
    document.getElementById("arquivo-selecionado");


// ============================================================
// TEMA
// ============================================================

const themeToggle =
    document.getElementById("theme-toggle");


themeToggle.addEventListener(
    "click",
    function () {

        document
            .documentElement
            .classList
            .toggle("dark");


        const icon =
            themeToggle.querySelector(
                ".material-symbols-outlined"
            );


        if (
            document
                .documentElement
                .classList
                .contains("dark")
        ) {

            icon.textContent =
                "light_mode";

        } else {

            icon.textContent =
                "dark_mode";

        }

    }
);


// ============================================================
// SELECIONAR ARQUIVO
// ============================================================

btnSelecionar.addEventListener(
    "click",
    function (event) {

        event.stopPropagation();

        fileInput.click();

    }
);


// ============================================================
// CLIQUE NA ÁREA DE UPLOAD
// ============================================================

dropZone.addEventListener(
    "click",
    function () {

        fileInput.click();

    }
);


// ============================================================
// ARQUIVO SELECIONADO
// ============================================================

fileInput.addEventListener(
    "change",
    function () {

        if (
            fileInput.files.length > 0
        ) {

            const arquivo =
                fileInput.files[0];


            analisarArquivo(
                arquivo
            );

        }

    }
);


// ============================================================
// CÂMERA
// ============================================================

btnCamera.addEventListener(
    "click",
    function (event) {

        // Evita que o clique chegue ao dropZone
        event.preventDefault();
        event.stopPropagation();


        // Limpa seleção anterior.
        // Isso permite tirar outra foto
        // do mesmo nome/tipo depois.
        cameraInput.value = "";


        // Abre câmera / seletor de câmera
        cameraInput.click();

    }
);


// ============================================================
// FOTO CAPTURADA
// ============================================================

cameraInput.addEventListener(
    "change",
    function () {

        if (
            cameraInput.files.length > 0
        ) {

            const foto =
                cameraInput.files[0];


            console.log(
                "Foto capturada:",
                foto
            );


            analisarArquivo(
                foto
            );

        }

    }
);


// ============================================================
// DRAG AND DROP
// ============================================================

[
    "dragenter",
    "dragover",
    "dragleave",
    "drop"

].forEach(

    function (eventName) {

        dropZone.addEventListener(
            eventName,
            preventDefaults
        );

    }

);


function preventDefaults(
    event
) {

    event.preventDefault();

    event.stopPropagation();

}


// ============================================================
// DESTAQUE DRAG
// ============================================================

[
    "dragenter",
    "dragover"

].forEach(

    function (eventName) {

        dropZone.addEventListener(
            eventName,
            function () {

                dropZone
                    .classList
                    .add(
                        "drag-active"
                    );

            }
        );

    }

);


[
    "dragleave",
    "drop"

].forEach(

    function (eventName) {

        dropZone.addEventListener(
            eventName,
            function () {

                dropZone
                    .classList
                    .remove(
                        "drag-active"
                    );

            }
        );

    }

);


// ============================================================
// ARQUIVO ARRASTADO
// ============================================================

dropZone.addEventListener(
    "drop",
    function (event) {

        const arquivos =
            event.dataTransfer.files;


        if (
            arquivos.length > 0
        ) {

            const arquivo =
                arquivos[0];


            analisarArquivo(
                arquivo
            );

        }

    }
);


// ============================================================
// STATUS
// ============================================================

function mostrarStatus(
    mensagem,
    icone = "hourglass_top"
) {

    statusArea
        .classList
        .remove("hidden");


    statusText.textContent =
        mensagem;


    statusIcon.textContent =
        icone;

}


// ============================================================
// ANALISAR ARQUIVO / FOTO
// ============================================================

async function analisarArquivo(
    arquivo
) {

    // --------------------------------------------------------
    // Mostra nome do arquivo
    // --------------------------------------------------------

    arquivoSelecionado
        .classList
        .remove("hidden");


    arquivoSelecionado
        .textContent =
        `Arquivo selecionado: ${arquivo.name}`;


    // --------------------------------------------------------
    // FormData
    // --------------------------------------------------------

    const formData =
        new FormData();


    formData.append(
        "arquivo",
        arquivo
    );


    // --------------------------------------------------------
    // Status
    // --------------------------------------------------------

    mostrarStatus(
        "Analisando documento com Azure Content Understanding...",
        "hourglass_top"
    );


    dropZone
        .classList
        .add(
            "upload-disabled"
        );


    dataVisualization
        .classList
        .add(
            "hidden"
        );


    try {

        // ----------------------------------------------------
        // POST para Flask
        // ----------------------------------------------------

        const response =
            await fetch(
                "/api/analisar",
                {
                    method: "POST",

                    body: formData
                }
            );


        // ----------------------------------------------------
        // Resultado JSON
        // ----------------------------------------------------

        const dados =
            await response.json();


        // ----------------------------------------------------
        // Erro HTTP
        // ----------------------------------------------------

        if (!response.ok) {

            throw new Error(
                dados.detalhe ||
                dados.erro ||
                "Erro ao analisar documento."
            );

        }


        console.log(
            "Resposta da API:",
            dados
        );


        // ----------------------------------------------------
        // Sucesso
        // ----------------------------------------------------

        mostrarStatus(
            "Documento analisado com sucesso.",
            "check_circle"
        );


        // ----------------------------------------------------
        // Preencher campos
        // ----------------------------------------------------

        preencherFormulario(
            dados.resultado
        );


        // ----------------------------------------------------
        // Mostrar formulário
        // ----------------------------------------------------

        dataVisualization
            .classList
            .remove(
                "hidden"
            );


        // ----------------------------------------------------
        // Rolar até resultados
        // ----------------------------------------------------

        dataVisualization
            .scrollIntoView({
                behavior: "smooth",
                block: "start"
            });


    } catch (erro) {

        console.error(
            "Erro:",
            erro
        );


        mostrarStatus(
            erro.message,
            "error"
        );


        alert(
            "Erro ao analisar documento:\n\n"
            + erro.message
        );


    } finally {

        dropZone
            .classList
            .remove(
                "upload-disabled"
            );

    }

}


// ============================================================
// PREENCHER FORMULÁRIO
// ============================================================

function preencherFormulario(
    resultado
) {

    const aluno =
        resultado.aluno || {};


    const confianca =
        resultado.confianca || {};


    // ========================================================
    // IDENTIFICAÇÃO
    // ========================================================

    definirValor(
        "nome",
        aluno.nome
    );

    definirValor(
        "cpf",
        aluno.cpf
    );

    definirValor(
        "rg",
        aluno.rg
    );

    definirValor(
        "data-nascimento",
        aluno.data_nascimento
    );

    definirValor(
        "sexo",
        aluno.sexo
    );

    definirValor(
        "nacionalidade",
        aluno.nacionalidade
    );

    definirValor(
        "naturalidade",
        aluno.naturalidade
    );


    // ========================================================
    // ACADÊMICOS
    // ========================================================

    definirValor(
        "curso",
        aluno.curso
    );

    definirValor(
        "turma",
        aluno.turma
    );

    definirValor(
        "matricula",
        aluno.matricula
    );

    definirValor(
        "nome-pai",
        aluno.nome_pai
    );

    definirValor(
        "nome-mae",
        aluno.nome_mae
    );


    // ========================================================
    // CONTATO
    // ========================================================

    definirValor(
        "telefone",
        aluno.telefone
    );

    definirValor(
        "celular",
        aluno.celular
    );

    definirValor(
        "email",
        aluno.email
    );


    // ========================================================
    // ENDEREÇO
    // ========================================================

    definirValor(
        "cep",
        aluno.cep
    );

    definirValor(
        "logradouro",
        aluno.logradouro
    );

    definirValor(
        "numero",
        aluno.numero
    );

    definirValor(
        "bairro",
        aluno.bairro
    );

    definirValor(
        "municipio",
        aluno.municipio
    );

    definirValor(
        "estado",
        aluno.estado
    );


    // ========================================================
    // CONFIANÇA
    // ========================================================

    mostrarConfianca(
        "nome",
        confianca.nome
    );

    mostrarConfianca(
        "cpf",
        confianca.cpf
    );

    mostrarConfianca(
        "rg",
        confianca.rg
    );

    mostrarConfianca(
        "data-nascimento",
        confianca.data_nascimento
    );

    mostrarConfianca(
        "sexo",
        confianca.sexo
    );

    mostrarConfianca(
        "nacionalidade",
        confianca.nacionalidade
    );

    mostrarConfianca(
        "naturalidade",
        confianca.naturalidade
    );

    mostrarConfianca(
        "curso",
        confianca.curso
    );

    mostrarConfianca(
        "turma",
        confianca.turma
    );

    mostrarConfianca(
        "matricula",
        confianca.matricula
    );

    mostrarConfianca(
        "nome-pai",
        confianca.nome_pai
    );

    mostrarConfianca(
        "nome-mae",
        confianca.nome_mae
    );

    mostrarConfianca(
        "telefone",
        confianca.telefone
    );

    mostrarConfianca(
        "celular",
        confianca.celular
    );

    mostrarConfianca(
        "email",
        confianca.email
    );

    mostrarConfianca(
        "cep",
        confianca.cep
    );

    mostrarConfianca(
        "logradouro",
        confianca.logradouro
    );

    mostrarConfianca(
        "numero",
        confianca.numero
    );

    mostrarConfianca(
        "bairro",
        confianca.bairro
    );

    mostrarConfianca(
        "municipio",
        confianca.municipio
    );

    mostrarConfianca(
        "estado",
        confianca.estado
    );

}


// ============================================================
// DEFINIR VALOR DO CAMPO
// ============================================================

function definirValor(
    id,
    valor
) {

    const campo =
        document.getElementById(id);


    if (!campo) {

        return;

    }


    campo.value =
        valor ?? "";

}


// ============================================================
// MOSTRAR CONFIANÇA
// ============================================================

function mostrarConfianca(
    id,
    valor
) {

    const elemento =
        document.getElementById(
            `confidence-${id}`
        );


    const campo =
        document.getElementById(id);


    if (
        !elemento ||
        !campo
    ) {

        return;

    }


    // --------------------------------------------------------
    // Remove estilos anteriores
    // --------------------------------------------------------

    campo
        .classList
        .remove(
            "campo-baixa-confianca"
        );


    campo
        .classList
        .remove(
            "campo-nao-identificado"
        );


    // --------------------------------------------------------
    // Não identificado
    // --------------------------------------------------------

    if (
        valor === null ||
        valor === undefined
    ) {

        elemento.textContent =
            "Não identificado no documento";


        elemento.className =
            "confidence-info confidence-empty";


        campo
            .classList
            .add(
                "campo-nao-identificado"
            );


        return;

    }


    // --------------------------------------------------------
    // Percentual
    // --------------------------------------------------------

    const percentual =
        Math.round(
            valor * 100
        );


    elemento.textContent =
        `Confiança: ${percentual}%`;


    // --------------------------------------------------------
    // Alta
    // --------------------------------------------------------

    if (
        valor >= 0.85
    ) {

        elemento.className =
            "confidence-info confidence-high";

        return;

    }


    // --------------------------------------------------------
    // Média
    // --------------------------------------------------------

    if (
        valor >= 0.70
    ) {

        elemento.className =
            "confidence-info confidence-medium";

        return;

    }


    // --------------------------------------------------------
    // Baixa
    // --------------------------------------------------------

    elemento.className =
        "confidence-info confidence-low";


    campo
        .classList
        .add(
            "campo-baixa-confianca"
        );

}


// ============================================================
// LIMPAR FORMULÁRIO
// ============================================================

function limparFormulario() {

    const campos = [

        "nome",
        "cpf",
        "rg",
        "data-nascimento",
        "sexo",
        "nacionalidade",
        "naturalidade",

        "curso",
        "turma",
        "matricula",

        "nome-pai",
        "nome-mae",

        "telefone",
        "celular",
        "email",

        "cep",
        "logradouro",
        "numero",
        "bairro",
        "municipio",
        "estado"

    ];


    campos.forEach(
        function (id) {

            const campo =
                document.getElementById(id);


            if (campo) {

                campo.value = "";


                campo.classList.remove(
                    "campo-baixa-confianca"
                );


                campo.classList.remove(
                    "campo-nao-identificado"
                );

            }


            const confidence =
                document.getElementById(
                    `confidence-${id}`
                );


            if (confidence) {

                confidence.textContent = "";

                confidence.className =
                    "confidence-info";

            }

        }
    );

}


// ============================================================
// RE-ESCANEAR
// ============================================================

btnReescanear.addEventListener(
    "click",
    function () {

        // Limpa arquivos
        fileInput.value = "";
        cameraInput.value = "";


        // Esconde dados
        dataVisualization
            .classList
            .add(
                "hidden"
            );


        // Esconde status
        statusArea
            .classList
            .add(
                "hidden"
            );


        // Esconde nome arquivo
        arquivoSelecionado
            .classList
            .add(
                "hidden"
            );


        limparFormulario();


        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    }
);


// ============================================================
// SALVAR
// ============================================================

btnSalvar.addEventListener(
    "click",
    function () {

        const aluno = {

            nome:
                document
                    .getElementById("nome")
                    .value,

            cpf:
                document
                    .getElementById("cpf")
                    .value,

            rg:
                document
                    .getElementById("rg")
                    .value,

            data_nascimento:
                document
                    .getElementById("data-nascimento")
                    .value,

            sexo:
                document
                    .getElementById("sexo")
                    .value,

            nacionalidade:
                document
                    .getElementById("nacionalidade")
                    .value,

            naturalidade:
                document
                    .getElementById("naturalidade")
                    .value,

            curso:
                document
                    .getElementById("curso")
                    .value,

            turma:
                document
                    .getElementById("turma")
                    .value,

            matricula:
                document
                    .getElementById("matricula")
                    .value,

            nome_pai:
                document
                    .getElementById("nome-pai")
                    .value,

            nome_mae:
                document
                    .getElementById("nome-mae")
                    .value,

            telefone:
                document
                    .getElementById("telefone")
                    .value,

            celular:
                document
                    .getElementById("celular")
                    .value,

            email:
                document
                    .getElementById("email")
                    .value,

            cep:
                document
                    .getElementById("cep")
                    .value,

            logradouro:
                document
                    .getElementById("logradouro")
                    .value,

            numero:
                document
                    .getElementById("numero")
                    .value,

            bairro:
                document
                    .getElementById("bairro")
                    .value,

            municipio:
                document
                    .getElementById("municipio")
                    .value,

            estado:
                document
                    .getElementById("estado")
                    .value

        };


        console.log(
            "Dados prontos para salvar:",
            aluno
        );


        alert(
            "Dados revisados. O próximo passo será salvar no banco de dados."
        );

    }
);