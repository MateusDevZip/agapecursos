#!/usr/bin/env python3
"""
Script para atualizar todas as páginas HTML com a nova logo e paleta de cores
"""

import re
from pathlib import Path

# Diretório do projeto
PROJECT_DIR = Path("/home/ramal442/Documentos/Projetos Mateus/Ágape cursos e Terapia")

# Páginas HTML para atualizar
HTML_FILES = [
    "index.html",
    "pilares.html",
    "cursos.html",
    "sobre.html",
    "contato.html",
    "login.html",
    "progresso.html",
    "biblioteca.html",
    "checkout.html",
    "agendamento.html",
    "admin.html",
    "admin-cursos.html",
    "admin-alunos.html",
]

# Nova paleta de cores
NEW_COLORS = {
    '"primary": "#ee2b[^"]*"': '"primary": "#A76B7D"',
    '"primary-dark": "#[^"]*"': '"primary-dark": "#8C5E66"',
    '"primary-light": "#[^"]*"': '"primary-light": "#C88B9A"',
    '"accent": "#[^"]*"': '"accent": "#E8B4B8"',
    '"background-light": "#[^"]*"': '"background-light": "#FFF9F9"',
    '"background-dark": "#[^"]*"': '"background-dark": "#2D1B1E"',
    '"surface-light": "#[^"]*"': '"surface-light": "#FFF3F4"',
    '"surface-dark": "#[^"]*"': '"surface-dark": "#3D2529"',
    '"text-main": "#[^"]*"': '"text-main": "#5C3A40"',
    '"text-secondary": "#[^"]*"': '"text-secondary": "#8C5E66"',
    '"text-muted": "#[^"]*"': '"text-muted": "#A76B7D"',
}

def update_html_file(filepath):
    """Atualiza um arquivo HTML com nova logo e cores"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    
    # 1. Adicionar favicon se não existir
    if '<link rel="icon"' not in content and '<link rel="shortcut icon"' not in content:
        content = content.replace(
            '</title>',
            '</title>\n    <link rel="icon" type="image/png" href="logo.png"/>'
        )
    
    # 2. Substituir ícone spa por logo
    # Padrão: <span class="material-symbols-outlined">spa</span>
    content = re.sub(
        r'<span class="material-symbols-outlined[^"]*"[^>]*>spa</span>',
        '<img src="logo.png" alt="Ágape Cursos" class="h-8 w-auto"/>',
        content
    )
    
    # Também substituir divs com ícone spa
    content = re.sub(
        r'<div[^>]*>\s*<span class="material-symbols-outlined[^"]*"[^>]*>spa</span>\s*</div>',
        '<img src="logo.png" alt="Ágape Cursos" class="h-8 w-auto"/>',
        content
    )
    
    # 3. Atualizar paleta de cores
    for pattern, replacement in NEW_COLORS.items():
        content = re.sub(pattern, replacement, content)
    
    # Salvar apenas se houver mudanças
    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    return False

def main():
    """Função principal"""
    updated_count = 0
    
    for html_file in HTML_FILES:
        filepath = PROJECT_DIR / html_file
        if filepath.exists():
            if update_html_file(filepath):
                print(f"✓ Atualizado: {html_file}")
                updated_count += 1
            else:
                print(f"- Sem alterações: {html_file}")
        else:
            print(f"✗ Não encontrado: {html_file}")
    
    print(f"\n{updated_count} de {len(HTML_FILES)} arquivos atualizados.")

if __name__ == "__main__":
    main()
