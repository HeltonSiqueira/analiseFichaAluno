import os
from datetime import datetime

from dotenv import load_dotenv

from azure.ai.contentunderstanding import ContentUnderstandingClient
from azure.ai.contentunderstanding.models import AnalysisResult
from azure.core.credentials import AzureKeyCredential
from azure.identity import DefaultAzureCredential


# ============================================================
# VARIÁVEIS DE AMBIENTE
# ============================================================

load_dotenv()

AZURE_ENDPOINT = os.getenv("AZURE_ENDPOINT")
AZURE_KEY = os.getenv("AZURE_KEY")


# ============================================================
# CONFIGURAÇÕES DO AZURE CONTENT UNDERSTANDING
# ============================================================

ANALYZER_ID = "AnaliseFichaAluno_v2"
API_VERSION = "2025-11-01"


# ============================================================
# CRIAR CLIENTE AZURE
# ============================================================

def criar_cliente():

    if not AZURE_ENDPOINT:
        raise ValueError(
            "AZURE_ENDPOINT não foi configurado no arquivo .env."
        )

    credential = (
        AzureKeyCredential(AZURE_KEY)
        if AZURE_KEY
        else DefaultAzureCredential()
    )

    return ContentUnderstandingClient(
        endpoint=AZURE_ENDPOINT,
        credential=credential,
        api_version=API_VERSION
    )


# ============================================================
# IDENTIFICAR TIPO DO ARQUIVO
# ============================================================

def obter_content_type(nome_arquivo):

    extensao = os.path.splitext(nome_arquivo)[1].lower()

    tipos = {
        ".pdf": "application/pdf",
        ".png": "image/png",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg"
    }

    if extensao not in tipos:
        raise ValueError(
            "Formato não suportado. "
            "Utilize PDF, PNG, JPG ou JPEG."
        )

    return tipos[extensao]


# ============================================================
# OBTER STRING
# ============================================================

def obter_string(fields, nome_campo):

    campo = fields.get(nome_campo)

    if not campo:
        return None

    return campo.get("valueString")


# ============================================================
# OBTER DATA
# ============================================================

def obter_data(fields, nome_campo):

    campo = fields.get(nome_campo)

    if not campo:
        return None

    data = campo.get("valueDate")

    if not data:
        return None

    try:

        data_convertida = datetime.strptime(
            data,
            "%Y-%m-%d"
        )

        return data_convertida.strftime(
            "%d/%m/%Y"
        )

    except ValueError:

        return data


# ============================================================
# OBTER CONFIANÇA
# ============================================================

def obter_confianca(fields, nome_campo):

    campo = fields.get(nome_campo)

    if not campo:
        return None

    return campo.get("confidence")


# ============================================================
# EXTRAIR DADOS DO ALUNO
# ============================================================

def extrair_dados_aluno(resultado):

    contents = resultado.get("contents", [])

    if not contents:
        raise ValueError(
            "O Azure não retornou conteúdo para o documento."
        )

    fields = contents[0].get("fields", {})


    # ========================================================
    # DADOS DO ALUNO
    # ========================================================

    aluno = {

        "nome": obter_string(
            fields,
            "nomeAluno"
        ),

        "data_nascimento": obter_data(
            fields,
            "dataNascimento"
        ),

        "rg": obter_string(
            fields,
            "rg"
        ),

        "cpf": obter_string(
            fields,
            "cpf"
        ),

        "sexo": obter_string(
            fields,
            "sexo"
        ),

        "nacionalidade": obter_string(
            fields,
            "nacionalidade"
        ),

        "naturalidade": obter_string(
            fields,
            "naturalidade"
        ),

        "nome_pai": obter_string(
            fields,
            "nomePai"
        ),

        "nome_mae": obter_string(
            fields,
            "nomeMae"
        ),

        "cep": obter_string(
            fields,
            "cep"
        ),

        "logradouro": obter_string(
            fields,
            "logradouro"
        ),

        "numero": obter_string(
            fields,
            "numero"
        ),

        "bairro": obter_string(
            fields,
            "bairro"
        ),

        "municipio": obter_string(
            fields,
            "municipio"
        ),

        "estado": obter_string(
            fields,
            "estado"
        ),

        "telefone": obter_string(
            fields,
            "telefone"
        ),

        "celular": obter_string(
            fields,
            "celular"
        ),

        "email": obter_string(
            fields,
            "email"
        ),

        "curso": obter_string(
            fields,
            "nomeCurso"
        ),

        "turma": obter_string(
            fields,
            "turma"
        ),

        "matricula": obter_string(
            fields,
            "matricula"
        )
    }


    # ========================================================
    # CONFIANÇA DOS CAMPOS
    # ========================================================

    confianca = {

        "nome": obter_confianca(
            fields,
            "nomeAluno"
        ),

        "data_nascimento": obter_confianca(
            fields,
            "dataNascimento"
        ),

        "rg": obter_confianca(
            fields,
            "rg"
        ),

        "cpf": obter_confianca(
            fields,
            "cpf"
        ),

        "sexo": obter_confianca(
            fields,
            "sexo"
        ),

        "nacionalidade": obter_confianca(
            fields,
            "nacionalidade"
        ),

        "naturalidade": obter_confianca(
            fields,
            "naturalidade"
        ),

        "nome_pai": obter_confianca(
            fields,
            "nomePai"
        ),

        "nome_mae": obter_confianca(
            fields,
            "nomeMae"
        ),

        "cep": obter_confianca(
            fields,
            "cep"
        ),

        "logradouro": obter_confianca(
            fields,
            "logradouro"
        ),

        "numero": obter_confianca(
            fields,
            "numero"
        ),

        "bairro": obter_confianca(
            fields,
            "bairro"
        ),

        "municipio": obter_confianca(
            fields,
            "municipio"
        ),

        "estado": obter_confianca(
            fields,
            "estado"
        ),

        "telefone": obter_confianca(
            fields,
            "telefone"
        ),

        "celular": obter_confianca(
            fields,
            "celular"
        ),

        "email": obter_confianca(
            fields,
            "email"
        ),

        "curso": obter_confianca(
            fields,
            "nomeCurso"
        ),

        "turma": obter_confianca(
            fields,
            "turma"
        ),

        "matricula": obter_confianca(
            fields,
            "matricula"
        )
    }


    return {
        "aluno": aluno,
        "confianca": confianca
    }


# ============================================================
# ANALISAR FICHA
# ============================================================

def analisar_ficha(file_path):

    nome_arquivo = os.path.basename(file_path)

    content_type = obter_content_type(
        nome_arquivo
    )

    client = criar_cliente()

    try:

        # ----------------------------------------------------
        # Ler arquivo
        # ----------------------------------------------------

        with open(file_path, "rb") as file:

            file_content = file.read()


        # ----------------------------------------------------
        # Enviar para Azure
        # ----------------------------------------------------

        poller = client.begin_analyze_binary(

            analyzer_id=ANALYZER_ID,

            binary_input=file_content,

            content_type=content_type

        )


        # ----------------------------------------------------
        # Aguardar análise
        # ----------------------------------------------------

        result: AnalysisResult = poller.result()


        # ----------------------------------------------------
        # Converter resultado Azure para dict
        # ----------------------------------------------------

        resultado_completo = result.as_dict()


        # ----------------------------------------------------
        # Extrair somente dados necessários
        # ----------------------------------------------------

        return extrair_dados_aluno(
            resultado_completo
        )


    finally:

        client.close()