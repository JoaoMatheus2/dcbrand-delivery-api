#!/usr/bin/env python3
"""
Baixar fotos do site antigo dcbrand.onloja.com
Tenta múltiplas estratégias de extração
"""

import requests
from bs4 import BeautifulSoup
import json
from pathlib import Path
from urllib.parse import urljoin
import re
import time

PRODUTOS = [
    (50593, "Lápis de boca KIKO Milano"),
    (54382, "Batom MAC Modesty"),
    (50679, "Body splash Victoria's Secret Shimmer"),
    (53493, "Tags pra presente"),
    (53494, "Tag aniversário"),
    (54372, "Frasqueira Marc Jacobs"),
]

BASE_URL = "https://dcbrand.onloja.com/produto"
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    "Accept-Language": "pt-BR,pt;q=0.9",
    "Accept-Encoding": "gzip, deflate",
    "Connection": "keep-alive",
    "Upgrade-Insecure-Requests": "1"
}

def criar_pasta():
    """Cria pasta de download"""
    pasta = Path("fotos_dc_brand")
    pasta.mkdir(exist_ok=True)
    return pasta

def extrair_urls_imagem(soup, url_pagina):
    """Tenta múltiplas estratégias para encontrar URL da imagem"""
    
    urls_candidatas = []
    
    # Estratégia 1: Procura por img com class específica
    for classe in ['foto-produto', 'product-image', 'item-photo', 'image-principal', 'principal']:
        img = soup.find('img', {'class': classe})
        if img and img.get('src'):
            urls_candidatas.append(img.get('src'))
    
    # Estratégia 2: Procura por data-src (lazy loading)
    for img in soup.find_all('img'):
        if img.get('data-src'):
            urls_candidatas.append(img.get('data-src'))
    
    # Estratégia 3: Procura por picture > source
    for picture in soup.find_all('picture'):
        for source in picture.find_all('source'):
            if source.get('srcset'):
                # Pega a primeira URL do srcset
                urls_candidatas.append(source.get('srcset').split()[0])
    
    # Estratégia 4: Procura em img data attributes
    for img in soup.find_all('img'):
        if img.get('data-image-url'):
            urls_candidatas.append(img.get('data-image-url'))
        if img.get('data-src-large'):
            urls_candidatas.append(img.get('data-src-large'))
    
    # Estratégia 5: Procura por imagens em divs com background-image
    for div in soup.find_all('div', {'class': re.compile(r'image|photo|product', re.I)}):
        style = div.get('style', '')
        if 'background-image' in style:
            match = re.search(r'url\([\'"]?([^\'")]+)[\'"]?\)', style)
            if match:
                urls_candidatas.append(match.group(1))
    
    # Estratégia 6: Procura por todas as img tags (fallback)
    for img in soup.find_all('img'):
        src = img.get('src')
        if src and 'facebook' not in src.lower() and 'pixel' not in src.lower() and 'tracking' not in src.lower():
            urls_candidatas.append(src)
    
    # Estratégia 7: Procura por links com rel="image_src"
    for link in soup.find_all('link', {'rel': 'image_src'}):
        if link.get('href'):
            urls_candidatas.append(link.get('href'))
    
    # Estratégia 8: Procura em og:image meta tag
    og_image = soup.find('meta', {'property': 'og:image'})
    if og_image and og_image.get('content'):
        urls_candidatas.append(og_image.get('content'))
    
    # Converte URLs relativas para absolutas e filtra
    urls_validas = []
    for url in urls_candidatas:
        if url:
            url_completa = urljoin(url_pagina, url)
            # Filtra tracking pixels
            if not any(x in url_completa.lower() for x in ['facebook', 'pixel', 'tracking', 'analytics']):
                urls_validas.append(url_completa)
    
    return urls_validas

def baixar_imagem(urls, codigo_produto, pasta):
    """Tenta baixar imagem de uma lista de URLs"""
    
    for i, url in enumerate(urls):
        try:
            print(f"  Tentativa {i+1}: {url[:60]}...")
            response = requests.get(url, headers=HEADERS, timeout=10)
            
            if response.status_code == 200 and len(response.content) > 100:  # Mínimo 100 bytes
                # Extrai extensão
                url_limpa = url.split("?")[0]
                ext = url_limpa.split(".")[-1].lower() or "jpg"
                
                if ext not in ['jpg', 'jpeg', 'png', 'gif', 'webp']:
                    ext = "jpg"
                
                nome_arquivo = f"produto_{codigo_produto}.{ext}"
                caminho = pasta / nome_arquivo
                
                with open(caminho, "wb") as f:
                    f.write(response.content)
                
                tamanho_kb = len(response.content) / 1024
                print(f"    ✅ Sucesso! {tamanho_kb:.1f} KB salvo")
                return str(caminho)
        
        except Exception as e:
            print(f"    ❌ Erro: {str(e)[:60]}")
    
    return None

def processar_produto(codigo_produto, nome_esperado, pasta):
    """Processa um produto"""
    url = f"{BASE_URL}/{codigo_produto}"
    
    print(f"\n{'='*60}")
    print(f"Produto: {codigo_produto} - {nome_esperado}")
    print(f"{'='*60}")
    
    try:
        print(f"Requisitando página...")
        response = requests.get(url, headers=HEADERS, timeout=15)
        
        if response.status_code != 200:
            print(f"❌ Erro HTTP {response.status_code}")
            return None
        
        print(f"Fazendo parse do HTML...")
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Extrai URLs
        urls = extrair_urls_imagem(soup, url)
        print(f"Encontradas {len(urls)} URL(s) de imagem")
        
        if not urls:
            print(f"❌ Nenhuma imagem encontrada")
            return None
        
        # Tenta baixar
        print(f"Tentando baixar...")
        resultado = baixar_imagem(urls, codigo_produto, pasta)
        
        return resultado
        
    except requests.exceptions.Timeout:
        print(f"❌ Timeout na requisição")
    except Exception as e:
        print(f"❌ Erro: {e}")
    
    return None

def main():
    """Função principal"""
    print("\n" + "="*60)
    print("📸 BAIXADOR DE FOTOS - DC BRAND ONLOJA")
    print("="*60)
    
    pasta = criar_pasta()
    resultados = {}
    
    for codigo, nome in PRODUTOS:
        resultado = processar_produto(codigo, nome, pasta)
        resultados[codigo] = {
            "nome": nome,
            "caminho": resultado,
            "sucesso": resultado is not None
        }
        time.sleep(2)  # Aguarda entre requisições
    
    # Resumo
    print("\n" + "="*60)
    print("📊 RESUMO")
    print("="*60)
    
    sucesso = sum(1 for r in resultados.values() if r['sucesso'])
    total = len(resultados)
    
    print(f"\nDownloads bem-sucedidos: {sucesso}/{total}\n")
    
    for codigo, info in resultados.items():
        status = "✅" if info['sucesso'] else "❌"
        print(f"{status} {codigo} - {info['nome']}")
        if info['caminho']:
            print(f"   → {info['caminho']}")
    
    print(f"\nPasta: {pasta.absolute()}")
    print("="*60)

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n❌ Cancelado pelo usuário")
    except Exception as e:
        print(f"\n\n❌ Erro fatal: {e}")
