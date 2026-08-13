from azure.ai.contentunderstanding import ContentUnderstandingClient

from pathlib import Path

from flask import Flask, render_template, request, jsonify
from werkzeug.utils import secure_filename

from services.azure_content import analisar_ficha


# ============================================================
# Aplicação Flask
# ============================================================

app = Flask(__name__)


# ============================================================
# Configurações
# ============================================================

BASE_DIR = Path(__file__).resolve().parent

UPLOAD_FOLDER = BASE_DIR / "uploads"

UPLOAD_FOLDER.mkdir(exist_ok=True)

app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER


# Limite de upload: 15 MB
app.config["MAX_CONTENT_LENGTH"] = 15 * 1024 * 1024


EXTENSOES_PERMITIDAS = {
    "pdf",
    "png",
    "jpg",
    "jpeg"
}


# ============================================================
# Função auxiliar
# ============================================================

def arquivo_permitido(nome_arquivo):

    return (
        "." in nome_arquivo
        and
        nome_arquivo.rsplit(".", 1)[1].lower()
        in EXTENSOES_PERMITIDAS
    )


# ============================================================
# Página principal
# ============================================================

@app.route("/", methods=["GET"])
def index():

    return render_template("index.html")


# ============================================================
# API - Teste simples
# ============================================================

@app.route("/api/status", methods=["GET"])
def status():

    return jsonify({
        "status": "online",
        "mensagem": "API EduSheet Manager funcionando."
    })


# ============================================================
# API - Analisar ficha
# ============================================================

@app.route("/api/analisar", methods=["POST"])
def analisar():

    # --------------------------------------------------------
    # Verifica se existe um campo chamado "arquivo"
    # --------------------------------------------------------

    if "arquivo" not in request.files:

        return jsonify({
            "sucesso": False,
            "erro": "Nenhum arquivo enviado.",
            "detalhe": (
                "Envie o arquivo utilizando "
                "form-data com o campo 'arquivo'."
            )
        }), 400


    arquivo = request.files["arquivo"]


    # --------------------------------------------------------
    # Verifica nome
    # --------------------------------------------------------

    if arquivo.filename == "":

        return jsonify({
            "sucesso": False,
            "erro": "Nenhum arquivo selecionado."
        }), 400


    # --------------------------------------------------------
    # Verifica extensão
    # --------------------------------------------------------

    if not arquivo_permitido(arquivo.filename):

        return jsonify({
            "sucesso": False,
            "erro": "Formato de arquivo não permitido.",
            "formatos_permitidos": [
                "PDF",
                "PNG",
                "JPG",
                "JPEG"
            ]
        }), 400


    # --------------------------------------------------------
    # Sanitiza nome
    # --------------------------------------------------------

    nome_arquivo = secure_filename(
        arquivo.filename
    )


    caminho_arquivo = (
        app.config["UPLOAD_FOLDER"]
        / nome_arquivo
    )


    try:

        # ----------------------------------------------------
        # Salva temporariamente
        # ----------------------------------------------------

        arquivo.save(caminho_arquivo)


        # ----------------------------------------------------
        # Chama Azure Content Understanding
        # ----------------------------------------------------

        resultado = analisar_ficha(
            caminho_arquivo
        )


        # ----------------------------------------------------
        # Retorna JSON
        # ----------------------------------------------------

        return jsonify({
            "sucesso": True,
            "arquivo": nome_arquivo,
            "resultado": resultado
        })


    except Exception as erro:

        return jsonify({
            "sucesso": False,
            "erro": "Erro ao analisar o documento.",
            "detalhe": str(erro)
        }), 500


    finally:

        # ----------------------------------------------------
        # Remove arquivo temporário
        # ----------------------------------------------------

        if caminho_arquivo.exists():

            try:
                caminho_arquivo.unlink()

            except OSError:
                pass


# ============================================================
# Tratamento de arquivo muito grande
# ============================================================

@app.errorhandler(413)
def arquivo_muito_grande(error):

    return jsonify({
        "sucesso": False,
        "erro": "Arquivo muito grande.",
        "detalhe": "O limite atual é 15 MB."
    }), 413


# ============================================================
# Execução
# ============================================================


if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=5000,
        debug=True
    )


"""

if __name__ == "__main__":

    app.run(
        host="127.0.0.1",
        port=5000,
        debug=True
    )

"""