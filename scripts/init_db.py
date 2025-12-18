import sys
import os

# Adiciona diretorio pai ao path para importar app
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import app, db, Course, User
from werkzeug.security import generate_password_hash

def init_db():
    print("Iniciando criacao do banco...")
    with app.app_context():
        db.create_all()
        print("Tabelas criadas.")

        # Criar Usuario de Teste
        if not User.query.filter_by(email='admin@agape.com').first():
            print("Criando usuario admin...")
            admin = User(
                name='Admin Agape',
                email='admin@agape.com',
                password_hash=generate_password_hash('123456'),
                phone='11999999999'
            )
            db.session.add(admin)
            db.session.commit()
            print("Usuario admin criado (email: admin@agape.com, senha: 123456)")
        
        if not Course.query.first():
            print("Populando cursos padrao...")
            initial_courses = [
                Course(id='combo', name='Combo Completo (2 em 1)', price=497.00, description='Terapia Capilar + Massagem'),
                Course(id='terapia-capilar', name='Pilar 1: Terapia Capilar', price=297.00, description='Curso de Terapia Capilar'),
                Course(id='massagem', name='Pilar 2: Massagem Terapêutica', price=297.00, description='Curso de Massagem Terapêutica')
            ]
            db.session.add_all(initial_courses)
            db.session.commit()
            print("Cursos criados.")
        else:
            print("Cursos ja existem.")
            
    print("Concluido! Arquivo agape.db deve existir.")

if __name__ == "__main__":
    init_db()
