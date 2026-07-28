# Suzireis — Site acadêmico

Este repositório contém o scaffold do site acadêmico para Suzireis.

Arquivos criados automaticamente:
- index.html — página principal com suporte PT/EN
- assets/style.css — estilos
- assets/script.js — toggle de idioma e funcionalidade mínima
- publications.bib — arquivo BibTeX gerado a partir do ORCID (vazio até a importação)
- publications.json — metadados das publicações (vazio até a importação)
- CNAME — domínio customizado: www.suzireis.ufsm.br

Como revisar
1. Eu criei uma branch site-acadêmico com os arquivos. Abra um pull request para revisar as mudanças (não mescle até verificar a foto e as publicações).

Como adicionar a foto de perfil
- Coloque o arquivo em assets/photo.jpg e atualize o index.html se quiser outro nome.

Como atualizar publicações
- Há um script de importação no repositório (scripts/import-orcid.js) — rode localmente com Node.js para regenerar publications.bib.
