MARKETING CONTÁBIL — VERSÃO CORRIGIDA

IMPORTANTE:
Este ZIP foi preparado para ser publicado com o conteúdo da pasta como raiz do site.

No Netlify:
- Se fizer deploy manual, extraia este ZIP e envie a pasta CONTEÚDO (onde está index.html) como o site.
- Não envie uma pasta que contenha outra pasta "marketing-contabil-netlify-semana" por dentro.

A função de geração de imagens está em:
netlify/functions/generate-image.js

A função é chamada pelo app em:
/.netlify/functions/generate-image

Para gerar imagens de verdade, configure no Netlify:
OPENAI_API_KEY = sua chave da API da OpenAI

Nunca coloque a chave diretamente no index.html.
