export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Use POST');

  const { prompt = '', n = 3, size = '1024x1024', baseImageB64 } = req.body || {};
  if (!baseImageB64) return res.status(400).send('Missing baseImageB64');

  const form = new FormData();
  form.append('model', 'gpt-image-1');
  form.append('prompt', prompt);
  form.append('n', String(n));
  form.append('size', size);

  // base64 -> Blob (PNG)
  const bytes = Uint8Array.from(Buffer.from(baseImageB64, 'base64'));
  const blob = new Blob([bytes], { type: 'image/png' });
  form.append('image', blob, 'base.png');

  const r = await fetch('https://api.openai.com/v1/images/edits', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
    body: form,
  });

  const text = await r.text();
  res.status(r.status).setHeader('content-type','application/json').send(text);
}
