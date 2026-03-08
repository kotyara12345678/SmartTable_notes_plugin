# Notes Plugin - Руководство по использованию

## ✅ Что было сделано

### 1. Обновлён код плагина (`main.js`)
- **Убран вызов `api.ui.addRibbonButton()`** — не работал в текущей версии SmartTable
- **Добавлена плавающая кнопка** — создаётся напрямую через `document.createElement()`
- **Независимость от приложения** — плагин работает через прямое добавление элементов в DOM

### 2. Автоматическая сборка в ZIP
**Скрипт:** `npm run build`

Что делает:
- Создаёт папку `build/`
- Упаковывает файлы: `main.js`, `manifest.json`, `styles.css`, `README.md`
- Сохраняет `notes-plugin.zip` в `build/` и `releases/`

### 3. Авто-версионирование и публикация в GitHub Releases
**Скрипт:** `npm run release -- --token YOUR_GITHUB_TOKEN`

Что делает:
- Читает версию из `manifest.json`
- Создаёт/обновляет релиз с тегом `plugin`
- Загружает ZIP файл как ассет
- Удаляет старые ассеты
- Выводит URL для обновления ссылки в SmartTable

---

## 📁 Структура проекта

```
notes-plugin/
├── main.js              # Основной код (обновлён с плавающей кнопкой)
├── manifest.json        # Манифест (измените version для新版本)
├── styles.css           # Стили
├── README.md            # Документация
├── package.json         # Зависимости и скрипты
├── .gitignore           # Игнорируемые файлы
├── scripts/
│   ├── build.js         # Сборка ZIP
│   └── release.js       # Публикация в GitHub
├── build/               # Папка сборки (автоматически)
│   └── notes-plugin.zip
└── releases/            # Копии релизов (автоматически)
    └── notes-plugin.zip
```

---

## 🚀 Как использовать

### Быстрый старт

```bash
# Перейдите в папку плагина
cd C:\Users\glino\OneDrive\Рабочий стол\notes-plugin

# Установите зависимости (один раз)
npm install

# Соберите ZIP архив
npm run build

# Проверьте, что архив создан
dir build\notes-plugin.zip
```

### Публикация в GitHub Releases

```bash
# Создайте GitHub token:
# 1. https://github.com/settings/tokens/new
# 2. Выберите разрешение: repo
# 3. Скопируйте токен

# Опубликуйте релиз
npm run release -- --token YOUR_GITHUB_TOKEN
```

### Обновление версии

1. Откройте `manifest.json`
2. Измените версию:
   ```json
   {
     "version": "1.0.1"
   }
   ```
3. Запустите:
   ```bash
   npm run build
   npm run release -- --token YOUR_GITHUB_TOKEN
   ```

---

## 📝 Обновление ссылки в SmartTable

После публикации скрипт выведет:
```
📝 Для обновления ссылки в SmartTable используйте:
   releaseUrl: 'https://github.com/.../releases/download/plugin/notes-plugin.zip'
```

Скопируйте эту ссылку и обновите файл:
```
SmartTable-master/sheets/src/electron/src/ui/core/plugins/PluginMarketplace.ts
```

Найдите плагин `com.smarttable.notes-plugin` и обновите `releaseUrl`:
```typescript
{
  id: 'com.smarttable.notes-plugin',
  name: 'Заметки',
  releaseUrl: 'https://github.com/kotyara12345678/SmartTable_notes_plugin/releases/download/plugin/notes-plugin.zip',
}
```

---

## 🔧 Команды

| Команда | Описание |
|---------|----------|
| `npm install` | Установка зависимостей |
| `npm run build` | Сборка ZIP архива |
| `npm run release -- --token=XXX` | Публикация в GitHub |
| `npm run deploy` | Build + Release (но нужен токен) |

---

## 🎯 Как это работает

### Плавающая кнопка

При активации плагина:
```javascript
// Создаётся кнопка в правом нижнем углу
const floatBtn = document.createElement('button');
floatBtn.style.cssText = `
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, #107c41 0%, #0d5c33 100%);
  z-index: 9999;
`;
document.body.appendChild(floatBtn);
```

**Преимущества:**
- ✅ Работает независимо от SmartTable API
- ✅ Всегда видна пользователю
- ✅ Не требует изменений в приложении
- ✅ Красивая анимация при наведении

### Сборка ZIP

```javascript
const zip = new AdmZip();
zip.addLocalFile('main.js', '');
zip.addLocalFile('manifest.json', '');
zip.addLocalFile('styles.css', '');
zip.addLocalFile('README.md', '');
zip.writeZip('build/notes-plugin.zip');
```

### Публикация в GitHub

```javascript
// Создаёт/обновляет релиз с тегом 'plugin'
await octokit.repos.createRelease({
  owner: 'kotyara12345678',
  repo: 'SmartTable_notes_plugin',
  tag_name: 'plugin',
  name: `v${version}`,
});

// Загружает ZIP как ассет
await octokit.repos.uploadReleaseAsset({
  release_id: releaseId,
  name: 'notes-plugin.zip',
  data: zipBuffer
});
```

---

## ⚠️ Важные замечания

1. **GitHub Token** — храните в секрете, не коммитьте в git
2. **Версия** — обновляйте в `manifest.json` перед релизом
3. **Тег релиза** — всегда `plugin` для совместимости
4. **ZIP файл** — должен содержать файлы в корне архива (без папок)

---

## 📞 Поддержка

Вопросы и предложения: https://github.com/kotyara12345678/SmartTable_notes_plugin/issues
