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

  // === Добавляем логирование ===
  console.log('Получен запрос:', req.method, req.url);
  console.log('Тело запроса:', JSON.stringify(req.body, null, 2));
  console.log('OPENROUTER_API_KEY из env:', process.env.OPENROUTER_API_KEY ? '[Ключ установлен]' : '[Ключ ОТСУТСТВУЕТ]');
  // =============================

  try {
    // Получаем тело запроса от клиента
    const body = req.body;

    // === Еще одно место для логирования ===
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
        console.error('Критическая ошибка: OPENROUTER_API_KEY не найден в переменных окружения!');
        return res.status(500).json({ error: 'Server configuration error: API key missing' });
    }
    // =====================================

    // Вызываем OpenRouter API с ключом из переменных окружения
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`, // Используем локальную переменную для логирования
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    // === Логируем ответ от OpenRouter (только статус и заголовки, тело может быть большим) ===
    console.log('Ответ от OpenRouter:', response.status, response.statusText);
    console.log('Заголовки ответа от OpenRouter:', [...response.headers.entries()]);
    // =========================================================================================

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
