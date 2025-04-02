from flask import Flask, render_template

app = Flask(__name__)

@app.route('/')
def home():
    return 'Hello, World!'

@app.route('/developer')
def dev():
    return render_template('developer.html')