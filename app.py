from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from models import db, User, Course, Order
from dotenv import load_dotenv
import os

load_dotenv()

# Configuração Padrão Flask (templates/ e static/ são automáticos)
app = Flask(__name__)
CORS(app) 

# Configuração do Banco de Dados
basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///' + os.path.join(basedir, 'agape.db'))
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = 'uma-chave-secreta-muito-segura'

db.init_app(app)

# --- Inicialização do Banco de Dados ---
with app.app_context():
    db.create_all()
    if not Course.query.first():
        initial_courses = [
            Course(id='combo', name='Combo Completo (2 em 1)', price=497.00, description='Terapia Capilar + Massagem'),
            Course(id='terapia-capilar', name='Pilar 1: Terapia Capilar', price=297.00, description='Curso de Terapia Capilar'),
            Course(id='massagem', name='Pilar 2: Massagem Terapêutica', price=297.00, description='Curso de Massagem Terapêutica')
        ]
        db.session.add_all(initial_courses)
        db.session.commit()

# --- Rotas de API ---
@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Email e senha são obrigatórios'}), 400
    
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email já cadastrado'}), 400
    
    hashed_password = generate_password_hash(data['password'])
    new_user = User(
        name=data.get('name', ''),
        email=data['email'],
        password_hash=hashed_password,
        phone=data.get('phone', '')
    )
    db.session.add(new_user)
    db.session.commit()
    return jsonify({'message': 'Usuário criado com sucesso!', 'user': new_user.to_dict()}), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    user = User.query.filter_by(email=data.get('email')).first()
    if user and check_password_hash(user.password_hash, data.get('password')):
        return jsonify({'message': 'Login realizado com sucesso', 'user': user.to_dict()})
    return jsonify({'error': 'Credenciais inválidas'}), 401

@app.route('/api/checkout', methods=['POST'])
def checkout():
    data = request.json
    user_id = data.get('user_id')
    if not user_id:
        return jsonify({'error': 'Usuário não identificado'}), 400

    new_order = Order(
        user_id=user_id,
        course_id=data.get('course_id'),
        total_amount=data.get('amount'),
        payment_method=data.get('payment_method', 'credit_card'),
        status='paid'
    )
    db.session.add(new_order)
    db.session.commit()
    return jsonify({'message': 'Compra realizada com sucesso!', 'order': new_order.to_dict()}), 201

# --- Rotas Frontend ---
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/<page>')
def serve_page(page):
    # Proteção simples de diretório e renderização segura
    if page.endswith('.html'):
        return render_template(page)
    return render_template('index.html') # Fallback

if __name__ == '__main__':
    app.run(debug=True, port=5000)
