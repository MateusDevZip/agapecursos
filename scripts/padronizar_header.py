#!/usr/bin/env python3
"""
Script para padronizar header e adicionar favicon em todas as páginas HTML
"""

import re
from pathlib import Path

# Arquivos HTML para processar
HTML_FILES = [
    'index.html',
    'pilares.html',
    'cursos.html',
    'sobre.html',
    'contato.html',
    'checkout.html',
    'login.html',
    'admin.html',
    'admin-cursos.html',
    'admin-alunos.html',
    'biblioteca.html',
    'progresso.html',
    'agendamento.html'
]

# Favicon HTML para adicionar no head
FAVICON_HTML = '''    <!-- Favicon -->
    <link rel="icon" type="image/png" href="logo.png">
    <link rel="apple-touch-icon" href="logo.png">'''

def update_html_file(filepath):
    """Atualiza header e adiciona favicon"""
    
    print(f"\nProcessando: {filepath.name}")
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    changes = []
    
    # 1. Adicionar favicon antes de </head> se não existir
    if 'logo.png' not in content and 'favicon' not in content.lower():
        # Procura por </head> e adiciona o favicon antes
        content = re.sub(
            r'(\s*)(</head>)',
            f'\n{FAVICON_HTML}\n\\1\\2',
            content,
            count=1
        )
        changes.append("Favicon adicionado")
    
    # 2. Substituir ícone spa por logo.png no header
    # Procura por divs com ícone spa e substitui por img
    pattern = r'<div class="[^"]*text-primary[^"]*">\s*<span class="material-symbols-outlined[^"]*">spa</span>\s*</div>'
    replacement = '<img src="logo.png" alt="Ágape Cursos Logo" class="h-10 w-auto">'
    
    if re.search(pattern, content):
        content = re.sub(pattern, replacement, content)
        changes.append("Icone substituido por logo.png no header")
    
    # 3. Também substituir casos onde está como size-8, size-10, etc
    pattern2 = r'<div class="[^"]*size-\d+[^"]*"[^>]*>\s*<span class="material-symbols-outlined[^"]*">spa</span>\s*</div>'
    if re.search(pattern2, content):
        content = re.sub(pattern2, replacement, content)
        changes.append("Icone size-X substituido por logo.png")
    
    # 4. Padronizar texto "Ágape Cursos" no header
    # Garantir que o título ao lado do logo seja consistente
    pattern3 = r'(<img[^>]*logo\.png[^>]*>)\s*(?:</div>)?\s*<h1[^>]*>([^<]*)</h1>'
    if re.search(pattern3, content):
        content = re.sub(
            pattern3,
            r'\1\n                    <h1 class="text-xl font-bold tracking-tight text-text-main dark:text-white">Ágape Cursos</h1>',
            content
        )
        changes.append("Titulo padronizado")
    
    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print("  Arquivo atualizado!")
        for change in changes:
            print(f"  - {change}")
        return True
    else:
        print("  Nenhuma mudanca necessaria")
        return False

def main():
    """Processa todos os arquivos HTML"""
    
    print("Padronizando header e adicionando favicon...")
    print("=" * 60)
    
    base_dir = Path(__file__).parent
    updated_count = 0
    
    for html_file in HTML_FILES:
        filepath = base_dir / html_file
        
        if not filepath.exists():
            print(f"\nArquivo nao encontrado: {html_file}")
            continue
        
        if update_html_file(filepath):
            updated_count += 1
    
    print("\n" + "=" * 60)
    print(f"Processamento concluido!")
    print(f"Arquivos atualizados: {updated_count}/{len(HTML_FILES)}")
    print("\nResumo das mudancas:")
    print("- Favicon logo.png adicionado em todas as paginas")
    print("- Icone 'spa' substituido por logo.png no header")
    print("- Header padronizado em todas as paginas")

if __name__ == "__main__":
    main()
