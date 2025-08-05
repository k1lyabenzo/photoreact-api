// api/ocr.js
export default async function handler(req, res) {
  // Обработка preflight OPTIONS-запроса (для CORS)
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', 'https://photoreact.ru');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  // Только POST-запросы
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Получаем тело запроса от клиента
    const body = req.body;

    // Вызываем OpenRouter API с ключом из переменных окружения
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`, // 🔐 Ключ из переменной
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    // Получаем ответ
    const data = await response.json();

    // Возвращаем клиенту с правильными CORS-заголовками
    res.setHeader('Access-Control-Allow-Origin', 'https://photoreact.ru');
    res.status(response.status).json(data);

  } catch (error) {
    console.error('Ошибка в функции:', error);
    res.status(500).json({ error: error.message });
  }
}
