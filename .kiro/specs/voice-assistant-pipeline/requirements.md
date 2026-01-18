# Requirements Document

## Introduction

Система Voice Assistant Pipeline — это голосовой ассистент для пожилых пользователей с поддержкой нескольких STT/TTS провайдеров (OpenAI, Google). Система включает простой UI для пожилых пользователей, административную панель для мониторинга и аналитики, а также механизм улучшения распознавания через базу "непонятных слов".

## Glossary

- **Voice_Pipeline**: Основной сервис обработки голосовых запросов
- **STT_Adapter**: Адаптер для преобразования речи в текст (Speech-to-Text)
- **TTS_Adapter**: Адаптер для преобразования текста в речь (Text-to-Speech)
- **Normalization_Service**: Сервис нормализации и исправления распознанного текста
- **Unknown_Terms_Dictionary**: База данных "непонятных слов" для улучшения распознавания
- **Senior_UI**: Упрощённый интерфейс для пожилых пользователей
- **Admin_Panel**: Административная панель для мониторинга и управления
- **WER**: Word Error Rate — метрика качества распознавания на уровне слов
- **CER**: Character Error Rate — метрика качества распознавания на уровне символов
- **VAD**: Voice Activity Detection — определение голосовой активности
- **Confidence**: Уровень уверенности STT в распознанном тексте

## Requirements

### Requirement 1: Голосовой ввод для пожилых пользователей

**User Story:** As a пожилой пользователь, I want нажать одну кнопку и говорить, so that я могу получить голосовой ответ без сложных действий.

#### Acceptance Criteria

1. WHEN пользователь нажимает кнопку "Говорить", THE Senior_UI SHALL начать запись аудио
2. WHEN пользователь отпускает кнопку (push-to-talk режим), THE Senior_UI SHALL остановить запись и отправить аудио на сервер
3. WHERE включён режим VAD, THE Senior_UI SHALL автоматически определять начало и конец речи
4. WHEN аудио отправлено, THE Voice_Pipeline SHALL отобразить индикатор обработки
5. WHEN ответ получен, THE Senior_UI SHALL воспроизвести голосовой ответ и показать текст крупным шрифтом (18-22px+)

### Requirement 2: Подтверждение распознанного текста

**User Story:** As a пожилой пользователь, I want видеть что система распознала и иметь возможность исправить, so that я уверен что меня правильно поняли.

#### Acceptance Criteria

1. WHEN текст распознан, THE Senior_UI SHALL отобразить "Вы сказали: [текст]" крупным шрифтом
2. WHEN отображается распознанный текст, THE Senior_UI SHALL показать кнопки "Да, верно", "Исправить", "Повторить"
3. WHEN пользователь нажимает "Да, верно", THE Voice_Pipeline SHALL продолжить обработку запроса
4. WHEN пользователь нажимает "Исправить", THE Senior_UI SHALL позволить ввести правильный текст
5. WHEN пользователь нажимает "Повторить", THE Senior_UI SHALL начать новую запись
6. WHEN пользователь исправляет текст, THE Voice_Pipeline SHALL сохранить исправление в Unknown_Terms_Dictionary

### Requirement 3: Выбор провайдера на уровне пользователя

**User Story:** As a администратор, I want назначать разных STT/TTS провайдеров разным пользователям, so that я могу сравнивать качество и оптимизировать затраты.

#### Acceptance Criteria

1. THE Voice_Pipeline SHALL поддерживать провайдеры OpenAI и Google для STT
2. THE Voice_Pipeline SHALL поддерживать провайдеры OpenAI и Google для TTS
3. WHEN создаётся пользователь, THE Admin_Panel SHALL позволить выбрать stt_provider и tts_provider
4. WHEN обрабатывается голосовой запрос, THE Voice_Pipeline SHALL использовать STT_Adapter согласно настройкам пользователя
5. WHEN генерируется голосовой ответ, THE Voice_Pipeline SHALL использовать TTS_Adapter согласно настройкам пользователя
6. WHEN администратор меняет провайдера пользователя, THE Voice_Pipeline SHALL применить изменения для следующих запросов

### Requirement 4: Нормализация и исправление текста

**User Story:** As a система, I want автоматически исправлять типичные ошибки распознавания, so that качество понимания пользователя повышается.

#### Acceptance Criteria

1. WHEN текст распознан, THE Normalization_Service SHALL применить словарь точных замен из Unknown_Terms_Dictionary
2. WHEN confidence ниже порога, THE Normalization_Service SHALL применить нечёткое сопоставление (fuzzy matching)
3. WHEN применяется исправление, THE Normalization_Service SHALL сохранить raw_transcript и normalized_transcript отдельно
4. THE Normalization_Service SHALL поддерживать языки RU и KZ
5. WHEN слово не найдено в словаре и confidence низкий, THE Normalization_Service SHALL создать запись в Unknown_Terms_Dictionary со статусом pending

### Requirement 5: Логирование диалогов

**User Story:** As a администратор, I want видеть полную историю диалогов с аудио и метриками, so that я могу анализировать качество работы системы.

#### Acceptance Criteria

1. WHEN происходит голосовой запрос, THE Voice_Pipeline SHALL сохранить аудио в Object Storage
2. WHEN происходит голосовой запрос, THE Voice_Pipeline SHALL сохранить raw_transcript, normalized_transcript, confidence, latency
3. WHEN генерируется ответ, THE Voice_Pipeline SHALL сохранить текст ответа и аудио ответа
4. THE Voice_Pipeline SHALL связать все данные с conversation_id и turn_id
5. WHEN пользователь исправляет текст, THE Voice_Pipeline SHALL пометить turn как user_corrected

### Requirement 6: Административная панель — управление пользователями

**User Story:** As a администратор, I want управлять пользователями и их настройками, so that я могу контролировать систему.

#### Acceptance Criteria

1. THE Admin_Panel SHALL отображать список пользователей с фильтрами
2. WHEN администратор просматривает пользователя, THE Admin_Panel SHALL показать: имя, язык, провайдер, активность
3. WHEN администратор редактирует пользователя, THE Admin_Panel SHALL позволить изменить stt_provider и tts_provider
4. THE Admin_Panel SHALL поддерживать роли: senior (пожилой пользователь) и admin

### Requirement 7: Административная панель — просмотр диалогов

**User Story:** As a администратор, I want просматривать диалоги с возможностью прослушать аудио, so that я могу анализировать проблемы распознавания.

#### Acceptance Criteria

1. THE Admin_Panel SHALL отображать список диалогов с фильтрами по пользователю, дате, провайдеру
2. WHEN администратор открывает диалог, THE Admin_Panel SHALL показать: аудио, raw_transcript, normalized_transcript, ответ
3. WHEN администратор открывает диалог, THE Admin_Panel SHALL показать метрики: confidence, latency
4. THE Admin_Panel SHALL позволить фильтровать диалоги с низким confidence или ошибками STT
5. WHEN администратор отмечает текст как "не распознано", THE Admin_Panel SHALL создать запись в Unknown_Terms_Dictionary

### Requirement 8: База непонятных слов

**User Story:** As a администратор, I want управлять словарём исправлений, so that система улучшает распознавание со временем.

#### Acceptance Criteria

1. THE Admin_Panel SHALL отображать список записей Unknown_Terms_Dictionary
2. WHEN отображается запись, THE Admin_Panel SHALL показать: heard_variant, correct_form, context, provider, count, status
3. WHEN администратор одобряет запись, THE Normalization_Service SHALL использовать её для исправлений
4. WHEN администратор отклоняет запись, THE Unknown_Terms_Dictionary SHALL пометить её как rejected
5. THE Admin_Panel SHALL позволить добавлять новые записи вручную
6. THE Unknown_Terms_Dictionary SHALL поддерживать языки RU и KZ

### Requirement 9: Аналитика и сравнение провайдеров

**User Story:** As a администратор, I want видеть метрики качества STT и сравнивать провайдеров, so that я могу принимать решения об оптимизации.

#### Acceptance Criteria

1. THE Admin_Panel SHALL отображать метрики: WER, CER, средний confidence, latency по провайдерам
2. THE Admin_Panel SHALL показывать топ-N "непонятных слов" по провайдеру
3. THE Admin_Panel SHALL показывать процент запросов, требующих исправления
4. WHERE включён режим дублирования, THE Voice_Pipeline SHALL отправлять аудио в оба провайдера для тестовых пользователей
5. WHEN есть ground_truth (подтверждённый текст), THE Admin_Panel SHALL вычислять WER/CER

### Requirement 10: Безопасность и приватность

**User Story:** As a система, I want защищать данные пользователей, so that соблюдаются требования безопасности и приватности.

#### Acceptance Criteria

1. THE Voice_Pipeline SHALL использовать TLS для всех соединений
2. THE Voice_Pipeline SHALL хранить аудио с подписанными URL (private links)
3. THE Admin_Panel SHALL ограничивать доступ по ролям (RBAC)
4. THE Voice_Pipeline SHALL вести audit log: кто и когда просматривал диалоги
5. WHERE настроена retention policy, THE Voice_Pipeline SHALL удалять аудио старше указанного срока
6. IF запрос не авторизован, THEN THE Voice_Pipeline SHALL вернуть ошибку 401

### Requirement 11: API для голосовых сессий

**User Story:** As a клиентское приложение, I want использовать REST API для голосовых запросов, so that я могу интегрироваться с бэкендом.

#### Acceptance Criteria

1. WHEN клиент вызывает POST /api/voice/session, THE Voice_Pipeline SHALL создать новую сессию
2. WHEN клиент вызывает POST /api/voice/upload, THE Voice_Pipeline SHALL принять аудио файл
3. WHEN клиент вызывает POST /api/voice/transcribe, THE Voice_Pipeline SHALL вернуть raw_transcript и normalized_transcript
4. WHEN клиент вызывает POST /api/voice/respond, THE Voice_Pipeline SHALL вернуть текст и аудио ответа
5. WHEN клиент вызывает POST /api/voice/confirm, THE Voice_Pipeline SHALL сохранить подтверждение или исправление

### Requirement 12: Adapter Layer для провайдеров

**User Story:** As a разработчик, I want единый интерфейс для разных провайдеров, so that легко добавлять новых провайдеров.

#### Acceptance Criteria

1. THE STT_Adapter SHALL определять метод transcribe(audio, language, hints) возвращающий {text, confidence, words, timings}
2. THE TTS_Adapter SHALL определять метод synthesize(text, language, voice) возвращающий audio
3. WHEN добавляется новый провайдер, THE Voice_Pipeline SHALL требовать только реализацию интерфейса адаптера
4. THE Voice_Pipeline SHALL использовать единый формат логов для всех провайдеров
