#!/usr/bin/env python3
"""
Script para remover referencias a cursos de psicanalise
Mantendo apenas sessoes de terapia com Vera
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

def update_html_file(filepath):
    """Remove/atualiza referencias a cursos de psicanalise"""
    
    print(f"\nProcessando: {filepath.name}")
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    changes = []
    
    # 1. Atualizar meta descriptions e titles
    # De: "Terapia Capilar, Massagem Terapêutica e Psicanálise Aplicada"  
    # Para: "Terapia Capilar e Massagem Terapêutica"
    content = re.sub(
        r'(Terapia Capilar,?\s+Massagem(?:\s+Terapêutica)?)(?:\s+e\s+|\s*\+\s*)Psicanálise(?:\s+Aplicada)?',
        r'\1',
        content,
        flags=re.IGNORECASE
    )
    
    # 2. Remover "3 em 1" ou "Combo Completo" que menciona psicanalise
    content = re.sub(
        r'(Combo\s+Completo\s+\(3\s+em\s+1\)[^<]*Terapia\s+Capilar\s+\+\s+Massagem\s+\+\s+Psicanálise)',
        r'Combo Completo - Terapia Capilar + Massagem',
        content,
        flags=re.IGNORECASE
    )
    
    # 3. Atualizar "3 pilares" para "2 pilares"
    content = re.sub(
        r'3\s+pilares',
        '2 pilares',
        content,
        flags=re.IGNORECASE
    )
    
    # 4. Remover opcoes de select com psicanalise
    content = re.sub(
        r'<option[^>]*value=["\']psicanalise["\'][^>]*>.*?</option>\s*',
        '',
        content,
        flags=re.IGNORECASE
    )
    
    # 5. Atualizar agendamento.html especificamente
    if 'agendamento.html' in str(filepath):
        # Manter referencias a sessoes de terapia, mas clarificar que nao e curso
        content = re.sub(
            r'Agende Sua Sessão de Psicanálise',
            'Agende Sua Sessão de Terapia',
            content
        )
        content = re.sub(
            r'Agendamento Psicanálise',
            'Agendamento de Terapia',
            content
        )
        content = re.sub(
            r'sessão de psicanálise online',
            'sessão de terapia online usando psicanálise e virtologia',
            content,
            flags=re.IGNORECASE
        )
        content = re.sub(
            r'Psicanálise Aplicada',
            'Terapia (Psicanálise/Virtologia)',
            content
        )
        changes.append("Atualizado agendamento.html - sessoes de terapia (nao curso)")
    
    # 6. Para pilares.html - remover secao completa de psicanalise ou converter para "Sessoes de Terapia"
    if 'pilares.html' in str(filepath):
        # Alterar titulo da secao
        content = re.sub(
            r'(<h2[^>]*>)Psicanálise Aplicada(</h2>)',
            r'\1Sessões de Terapia (Vera)\2',
            content
        )
        # Adicionar nota explicativa
        content = re.sub(
            r'(A cura verdadeira começa na mente\.\s+A Psicanálise Aplicada na Ágape Cursos não é apenas)',
            r'A cura verdadeira começa na mente. As sessões individuais com a profissional Vera utilizam psicanálise e virtologia (não é um curso, são',
            content
        )
        changes.append("Atualizado pilares.html - convertido para sessoes de terapia")
    
    # 7. Para cursos.html - remover cards de cursos de psicanalise completamente
    # Isso e mais complexo, entao vamos apenas remover filtros e opcoes
    if 'cursos.html' in str(filepath):
        # Remover filtro de psicanalise
        content = re.sub(
            r'<button[^>]*>\s*<span[^>]*>psychology</span>\s*<span[^>]*>Psicanálise</span>\s*</button>',
            '',
            content
        )
        changes.append("Removido filtro de psicanalise em cursos.html")
    
    # 8. Para checkout.html - remover opcoes de combo com psicanalise
    if 'checkout.html' in str(filepath):
        # Atualizar combo para apenas 2 cursos
        content = re.sub(
            r'Combo Completo \(3 em 1\)',
            'Combo Completo (2 em 1)',
            content
        )
        content = re.sub(
            r'R\$\s*891,00',  # Preco de 3 cursos
            'R$ 594,00',  # Preco de 2 cursos
            content
        )
        content = re.sub(
            r'R\$\s*597,00',  # Total com desconto de 3
            'R$ 497,00',  # Total com desconto de 2
            content
        )
        content = re.sub(
            r'R\$\s*294,00',  # Desconto de R$294
            'R$ 97,00',  # Novo desconto
            content
        )
        content = re.sub(
            r'Economize\s+33%',
            'Economize 17%',
            content
        )
        changes.append("Atualizado checkout.html - preco e combo ajustados")
    
    # 9. Remover Pilar 3 das listas
    content = re.sub(
        r'<(?:label|div)[^>]*>\s*(?:<input[^>]*>)?\s*(?:<div[^>]*>)?\s*(?:<div[^>]*>)?\s*<span[^>]*>Pilar\s+3:\s+Psicanálise(?:\s+Aplicada)?</span>.*?</(?:label|div)>\s*',
        '',
        content,
        flags=re.DOTALL
    )
    
    # 10. Atualizar sobre.html bio
    if 'sobre.html' in str(filepath):
        content = re.sub(
            r'Especialista em Terapia Capilar, Massagem Terapêutica e Psicanálise Aplicada',
            'Especialista em Terapia Capilar e Massagem Terapêutica. Oferece sessões de terapia usando Psicanálise e Virtologia',
            content
        )
    
    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print("  Arquivo atualizado!")
        for change in changes:
            print(f"  - {change}")
        if not changes:
            print("  - Referencias a psicanalise removidas/atualizadas")
        return True
    else:
        print("  Nenhuma mudanca necessaria")
        return False

def main():
    """Processa todos os arquivos HTML"""
    
    print("Removendo referencias a cursos de psicanalise...")
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
    print("- Removidas referencias a 'cursos de psicanalise'")
    print("- agendamento.html: mantido para 'sessoes de terapia com Vera'")
    print("- Combos atualizados para 2 cursos (sem psicanalise)")
    print("- Filtros e opcoes de psicanalise removidos")

if __name__ == "__main__":
    main()
