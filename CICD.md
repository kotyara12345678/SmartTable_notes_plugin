# CI/CD Guide

## Автоматическая сборка и публикация релизов

Этот проект использует **GitHub Actions** для автоматической сборки, версионирования и публикации в GitHub Releases.

## Как это работает

### 🔄 При каждом пуше в `main`/`master`:

1. **Сборка** — создаётся ZIP архив с файлами плагина
2. **Автоверсионирование** — увеличивается PATCH версия (например, `1.0.0` → `1.0.1`)
3. **Публикация** — ZIP загружается в GitHub Releases с тегом `plugin`
4. **Коммит** — обновлённые версии в `manifest.json` и `package.json` пушатся обратно в репозиторий

### 📁 Структура CI/CD

```
.github/workflows/ci.yml  # Основной workflow
```

## Настройка

### 1. Разрешения для GitHub Actions

Убедитесь, что у GitHub Actions есть права на запись в репозиторий:

1. Перейдите в **Settings** → **Actions** → **General**
2. В разделе **Workflow permissions** выберите **Read and write permissions**
3. Включите опцию **Allow GitHub Actions to create and approve pull requests**

### 2. Проверка workflow

Workflow файл уже создан в `.github/workflows/ci.yml`. Никаких дополнительных настроек не требуется.

## Использование

### Автоматический режим

Просто сделайте пуш в ветку `main` или `master`:

```bash
git add .
git commit -m "feat: добавлена новая функция"
git push origin main
```

GitHub Actions автоматически:
- Соберёт новую версию
- Увеличит версию (1.0.0 → 1.0.1)
- Опубликует релиз

### Ручной запуск

Можно запустить сборку вручную через GitHub UI:

1. Перейдите в **Actions** → **Build and Release**
2. Нажмите **Run workflow**
3. Выберите ветку и нажмите **Run workflow**

## Версионирование

Используется семантическое версионирование в формате `MAJOR.MINOR.PATCH`:

- **PATCH** (третья цифра) — увеличивается автоматически при каждом пуше
- **MINOR** (вторая цифра) — новые функции (требует ручного изменения)
- **MAJOR** (первая цифра) —breaking changes (требует ручного изменения)

### Ручное изменение версии

Для изменения MINOR или MAJOR версии отредактируйте `manifest.json` и `package.json`:

```json
{
  "version": "1.1.0"  // Измените версию вручную
}
```

Следующий автоматический пуш увеличит PATCH: `1.1.0` → `1.1.1`

## GitHub Releases

После успешной сборки релиз будет доступен по адресу:

```
https://github.com/kotyara12345678/SmartTable_notes_plugin/releases
```

Тег релиза: `plugin` (постоянный, обновляется при каждом пуше)

## Локальная сборка

Для локальной сборки без публикации:

```bash
npm install
npm run build
```

ZIP файл будет создан в папке `build/notes-plugin.zip`

## Локальный релиз (вручную)

Для публикации релиза вручную (без CI/CD):

```bash
# Установите токен
export GITHUB_TOKEN=your_github_token

# Соберите и опубликуйте
npm run deploy
```

Или в одной команде:

```bash
GITHUB_TOKEN=your_token npm run deploy
```

## Создание GitHub Token

1. Перейдите на https://github.com/settings/tokens/new
2. Выберите **Generate new token (classic)**
3. Установите разрешения:
   - ✅ `repo` (Full control of private repositories)
4. Нажмите **Generate token**
5. Сохраните токен в безопасном месте

## Troubleshooting

### Ошибка: "Workflow permissions"

**Решение:** Включите Read and write permissions в настройках репозитория.

### Ошибка: "Release already exists"

**Решение:** Workflow автоматически обновляет существующий релиз с тегом `plugin`. Если возникла ошибка, удалите существующий релиз вручную.

### Ошибка: "Version not incremented"

**Решение:** CI автоматически увеличивает PATCH версию. Если версия не изменилась, проверьте `manifest.json`.

## Ссылки

- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [softprops/action-gh-release](https://github.com/softprops/action-gh-release)
- [Semantic Versioning](https://semver.org/)
