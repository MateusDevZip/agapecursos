#!/usr/bin/env python3
"""
Script para atualizar automaticamente todas as páginas HTML do Ágape Cursos
com os arquivos CSS e JavaScript criados.
"""

import re
import os
from pathlib import Path

# Configurações
HTML_FILES = [
    'pilares.html',
    'cursos.html',
    'sobre.html',
    'contato.html',
    'checkout.html',
    'admin.html',
    'admin-cursos.html',
    'admin-alunos.html',
    'biblioteca.html',
    'progresso.html',
    'agendamento.html'
]

CSS_LINK = '<link rel="stylesheet" href="css/styles.css">'
JS_MAIN = '<script src="js/main.js"></script>'
JS_FORMS = '<script src="js/forms.js"></script>'
JS_FILTERS = '<script src="js/filters.js"></script>'

def update_html_file(filepath):
    """Atualiza um arquivo HTML com CSS e JS"""
    
    print(f"\nProcessando: {filepath}")
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    changes = []
    
    # 1. Adicionar CSS no head (antes de </head>)
    if 'css/styles.css' not in content:
        # Procura por </style> seguido de </head> ou diretamente </head>
        if re.search(r'</style>\s*</head>', content):
            content = re.sub(
                r'(</style>)\s*(</head>)',
                r'\1\n    ' + CSS_LINK + r'\n\2',
                content,
                count=1
            )
            changes.append("CSS adicionado apos </style>")
        else:
            content = re.sub(
                r'(</head>)',
                r'    ' + CSS_LINK + r'\n\1',
                content,
                count=1
            )
            changes.append("CSS adicionado antes de </head>")
    
    # 2. Adicionar JS antes de </body>
    if 'js/main.js' not in content:
        # Remove scripts antigos se existirem
        content = re.sub(r'<script>[\s\S]*?</script>\s*(?=</body>)', '', content)
        
        # Adiciona novos scripts
        js_section = f'''
    <!-- JavaScript Files -->
    {JS_MAIN}
    {JS_FORMS}
'''
        
        # Para páginas de cursos e biblioteca, adicionar filters.js também
        if 'cursos.html' in str(filepath) or 'biblioteca.html' in str(filepath):
            js_section = f'''
    <!-- JavaScript Files -->
    {JS_MAIN}
    {JS_FORMS}
    {JS_FILTERS}
'''
        
        content = re.sub(
            r'(</body>)',
            js_section + r'\1',
            content,
            count=1
        )
        changes.append(" Scripts JS adicionados")
    
    # 3. Adicionar data-mobile-menu-toggle ao botão hamburger
    if 'data-mobile-menu-toggle' not in content:
        # Procura por botões com ícone menu
        content = re.sub(
            r'(<button[^>]*class="[^"]*md:hidden[^"]*"[^>]*>)\s*(<span class="material-symbols-outlined"[^>]*>menu</span>)',
            r'\1\n                        \2',
            content
        )
        # Adiciona o data attribute
        content = re.sub(
            r'(<button)([^>]*class="[^"]*md:hidden[^"]*")',
            r'\1 data-mobile-menu-toggle\2',
            content
        )
        if 'data-mobile-menu-toggle' in content:
            changes.append(" Data attribute mobile menu adicionado")
    
    # 4. Adicionar data-auth-button aos botões de autenticação
    if 'data-auth-button' not in content and 'Área do Aluno' in content or 'Entrar' in content:
        # Procura por botões com texto relacionado a login/área do aluno
        content = re.sub(
            r'(<button[^>]*)(>[\s\n]*(?:Área do Aluno|Entrar|Login))',
            r'\1 data-auth-button\2',
            content,
            count=1
        )
        if 'data-auth-button' in content:
            changes.append(" Data attribute auth button adicionado")
    
    # 5. Atualizar formulários de newsletter
    if 'newsletter' in content.lower() and 'data-newsletter-form' not in content:
        # Procura por divs com formulário de email no footer
        content = re.sub(
            r'(<div class="flex gap-[^"]*">[\s\n]*<input[^>]*type="email")',
            r'<form data-newsletter-form class="flex gap-2">\n                        <input type="email" required',
            content
        )
        content = re.sub(
            r'(</button>[\s\n]*)(</div>[\s\n]*</div>[\s\n]*<div)',
            r'\1</form>\n                \2',
            content
        )
        if 'data-newsletter-form' in content:
            changes.append(" Newsletter form atualizado")
    
    # 6. Atualizar links de navegação no header
    nav_links = {
        'Início': 'index.html',
        'Pilares': 'pilares.html',
        'Cursos': 'cursos.html',
        'Sobre': 'sobre.html',
        'Contato': 'contato.html'
    }
    
    for text, href in nav_links.items():
        # Atualiza links que apontam para # para apontar para o arquivo correto
        pattern = rf'(<a[^>]*href=")#("[^>]*>{text}</a>)'
        if re.search(pattern, content):
            content = re.sub(pattern, rf'\1{href}\2', content)
    
    if nav_links:
        changes.append(" Links de navegação atualizados")
    
    # Salvar apenas se houve mudanças
    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f" Arquivo atualizado com sucesso!")
        for change in changes:
            print(f"   {change}")
        return True
    else:
        print("ℹ  Nenhuma mudança necessária")
        return False

def main():
    """Processa todos os arquivos HTML"""
    
    print("Iniciando atualizacao em massa das paginas HTML...")
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
    print("\nProximos passos:")
    print("   1. Testar as paginas no navegador")
    print("   2. Fazer commit das alteracoes: git add . && git commit -m 'feat: apply JS/CSS to all pages'")
    print("   3. Push para GitHub: git push origin main")

if __name__ == "__main__":
    main()
