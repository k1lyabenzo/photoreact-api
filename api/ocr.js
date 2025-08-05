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
    // === Логирование входящего запроса ===
    console.log('--- НАЧАЛО ЛОГА ЗАПРОСА ---');
    console.log('Метод:', req.method);
    console.log('URL:', req.url);
    console.log('Заголовки запроса от клиента:');
    console.log(JSON.stringify(req.headers, null, 2));
    console.log('Тело запроса от клиента:');
    console.log(JSON.stringify(req.body, null, 2));
    console.log('--- КОНЕЦ ЛОГА ЗАПРОСА ---');
    // ===================================

    // Получаем тело запроса от клиента
    const body = req.body;

    // Получаем API-ключ
    const apiKey = process.env.OPENROUTER_API_KEY;

    // === Логирование ключа и заголовков, которые мы собираемся отправить ===
    console.log('--- НАЧАЛО ЛОГА ИСХОДЯЩЕГО ЗАПРОСА ---');
    console.log('OPENROUTER_API_KEY (первые 10 символов):', apiKey ? apiKey.substring(0, 10) + '...' : 'UNDEFINED');
    console.log('OPENROUTER_API_KEY длина:', apiKey ? apiKey.length : 'N/A');

    const headersToSend = {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
      // OpenRouter иногда требует эти заголовки, добавим их на всякий случай
      // 'HTTP-Referer': 'https://photoreact.ru',
      // 'X-Title': 'PhotoReact',
    };
    console.log('Заголовки, отправляемые в OpenRouter:');
    console.log(JSON.stringify(headersToSend, null, 2));
    console.log('Тело, отправляемое в OpenRouter:');
    console.log(JSON.stringify(body, null, 2));
    console.log('--- КОНЕЦ ЛОГА ИСХОДЯЩЕГО ЗАПРОСА ---');
    // ======================================================================

    // Проверка наличия ключа
    if (!apiKey) {
        console.error('Критическая ошибка: OPENROUTER_API_KEY не найден в переменных окружения!');
        return res.status(500).json({ error: 'Server configuration error: API key missing' });
    }

    // Вызываем OpenRouter API с ключом из переменных окружения
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: headersToSend, // Используем подготовленные заголовки
      body: JSON.stringify(body)
    });

    // === Логируем ответ от OpenRouter ===
    console.log('--- НАЧАЛО ЛОГА ОТВЕТА ОТ OPENROUTER ---');
    console.log('Статус ответа от OpenRouter:', response.status);
    console.log('Статус текст ответа от OpenRouter:', response.statusText);
    console.log('Заголовки ответа от OpenRouter:');
    const responseHeaders = {};
    response.headers.forEach((value, key) => { responseHeaders[key] = value; });
    console.log(JSON.stringify(responseHeaders, null, 2));
    
    // Попробуем получить текст ответа для логирования
    const responseText = await response.text();
    console.log('Текст ответа от OpenRouter (первые 500 символов):', responseText.substring(0, 500));
    console.log('--- КОНЕЦ ЛОГА ОТВЕТА ОТ OPENROUTER ---');
    // ===================================

    // Проверим, является ли ответ JSON
    let responseData;
    try {
        responseData = JSON.parse(responseText);
    } catch (parseError) {
        console.error('Ошибка парсинга JSON ответа от OpenRouter:', parseError);
        // Если не JSON, вернем текст как есть
        res.setHeader('Access-Control-Allow-Origin', 'https://photoreact.ru');
        return res.status(response.status).send(responseText);
    }

    // Возвращаем клиенту с правильными CORS-заголовками
    res.setHeader('Access-Control-Allow-Origin', 'https://photoreact.ru');
    res.status(response.status).json(responseData);

  } catch (error) {
    console.error('--- ОШИБКА В ФУНКЦИИ ---');
    console.error('Ошибка:', error);
    console.error('Стек вызовов:', error.stack);
    console.error('------------------------');
    res.status(500).json({ error: error.message });
  }
}
