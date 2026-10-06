exports.handler = async (event) => {
  const json = (statusCode, payload) => ({
    statusCode,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store'
    },
    body: JSON.stringify(payload)
  });

  if (event.httpMethod !== 'POST') {
    return json(405, { error: 'Método não permitido. Use POST.' });
  }

  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    return json(500, {
      error: 'OPENAI_API_KEY não está configurada no Netlify. Vá em Site configuration → Environment variables e adicione essa variável.'
    });
  }

  try {
    let body;
    try {
      body = JSON.parse(event.body || '{}');
    } catch {
      return json(400, { error: 'Os dados enviados pelo aplicativo não são JSON válido.' });
    }

    const {
      subject,
      format = '1024x1024',
      style = 'Fotografia profissional e realista',
      brand = '',
      text = '',
      details = ''
    } = body;

    if (!subject || !String(subject).trim()) {
      return json(400, { error: 'Informe o que a imagem deve mostrar.' });
    }

    const allowedSizes = ['1024x1024', '1024x1536', '1536x1024'];
    const size = allowedSizes.includes(format) ? format : '1024x1024';

    const prompt = [
      'Crie uma arte profissional para redes sociais de uma empresa de contabilidade no Brasil.',
      `Tema visual: ${subject}.`,
      `Estilo: ${style}.`,
      `Identidade visual: ${brand || 'corporativa, elegante, moderna, limpa e confiável'}.`,
      text ? `Texto que deve aparecer na arte: "${text}".` : '',
      details ? `Detalhes adicionais: ${details}.` : '',
      'Composição profissional, boa hierarquia visual, iluminação e acabamento premium, adequada para Instagram.',
      'Evite aparência genérica de banco de imagens.'
    ].filter(Boolean).join(' ');

    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-image-2',
        prompt,
        size,
        quality: 'high',
        output_format: 'png',
        n: 1
      })
    });

    const raw = await response.text();
    let data = null;
    try { data = JSON.parse(raw); } catch (_) {}

    if (!response.ok) {
      const apiError = data?.error?.message;
      return json(response.status, {
        error: apiError || `A API de imagens retornou HTTP ${response.status}.`,
        details: data || raw.slice(0, 500)
      });
    }

    const image = data?.data?.[0]?.b64_json;
    if (!image) {
      return json(502, {
        error: 'A OpenAI respondeu, mas não enviou os dados da imagem.',
        details: data || raw.slice(0, 500)
      });
    }

    return json(200, {
      b64_json: image,
      prompt,
      format: 'png'
    });
  } catch (error) {
    return json(500, {
      error: error?.message || 'Erro interno ao gerar a imagem.'
    });
  }
};
