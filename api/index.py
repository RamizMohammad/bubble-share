from flask import Flask, render_template, Response
import requests

app = Flask(__name__)

GITHUB_FILE_URL = "https://github.com/RamizMohammad/SteamDeck/releases/download/v1.0/Linkium.msix"
# Example: "https://raw.githubusercontent.com/ramizmohammad/SteamDeck/main/Linkium.exe"

@app.route('/')
def home():
    return render_template('home.html')

@app.route('/developer')
def dev():
    return render_template('developer.html')

@app.route('/download')
def download():
    # Fetch file from GitHub
    r = requests.get(GITHUB_FILE_URL, stream=True)
    if r.status_code != 200:
        return "File not found on GitHub!", 404

    # Stream back to client
    return Response(
        r.iter_content(chunk_size=8192),
        headers={
            "Content-Disposition": "attachment; filename=Linkium.exe",
            "Content-Type": "application/octet-stream"
        }
    )
