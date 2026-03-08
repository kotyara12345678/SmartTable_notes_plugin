/**
 * Release Script - Авто-версионирование и публикация в GitHub Releases
 * 
 * Использование:
 *   npm run release -- --token YOUR_GITHUB_TOKEN
 * 
 * Или установите переменную окружения:
 *   GITHUB_TOKEN=your_token npm run release
 */

const { Octokit } = require('@octokit/rest');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Конфигурация
const PLUGIN_DIR = path.resolve(__dirname, '..');
const BUILD_ZIP = path.join(PLUGIN_DIR, 'build', 'notes-plugin.zip');
const MANIFEST_PATH = path.join(PLUGIN_DIR, 'manifest.json');

// GitHub конфиг
const GITHUB_OWNER = 'kotyara12345678';
const GITHUB_REPO = 'SmartTable_notes_plugin';
const RELEASE_TAG = 'plugin';

// Получаем токен
const GITHUB_TOKEN = process.argv.find(arg => arg.startsWith('--token='))?.split('=')[1] 
                  || process.env.GITHUB_TOKEN;

console.log('🚀 Notes Plugin - Release Script');
console.log('==================================');

// Проверяем токен
if (!GITHUB_TOKEN) {
  console.error('❌ Ошибка: Не указан GitHub token');
  console.error('\nИспользуйте один из способов:');
  console.error('  1. npm run release -- --token YOUR_TOKEN');
  console.error('  2. GITHUB_TOKEN=your_token npm run release');
  console.error('\nСоздать токен: https://github.com/settings/tokens/new');
  console.error('Нужные разрешения: repo (Full control of private repositories)');
  process.exit(1);
}

// Проверяем ZIP файл
if (!fs.existsSync(BUILD_ZIP)) {
  console.error('❌ Ошибка: ZIP файл не найден');
  console.error('Сначала выполните: npm run build');
  process.exit(1);
}

// Читаем manifest.json
const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8'));
const version = manifest.version;

console.log(`📦 Плагин: ${manifest.name}`);
console.log(`📌 Версия: v${version}`);
console.log(`📁 ZIP файл: ${BUILD_ZIP}`);
console.log(`🔗 Репозиторий: ${GITHUB_OWNER}/${GITHUB_REPO}`);
console.log('==================================\n');

// Инициализируем Octokit
const octokit = new Octokit({
  auth: GITHUB_TOKEN,
  userAgent: 'notes-plugin-release/1.0.0'
});

async function createRelease() {
  try {
    // Проверяем существующий релиз с таким тегом
    console.log('🔍 Проверка существующего релиза...');
    let release;
    
    try {
      const { data: existingRelease } = await octokit.repos.getReleaseByTag({
        owner: GITHUB_OWNER,
        repo: GITHUB_REPO,
        tag: RELEASE_TAG
      });
      
      console.log(`📝 Найден существующий релиз: ${existingRelease.tag_name}`);
      console.log('🔄 Обновление релиза...');
      
      // Обновляем существующий релиз
      release = await octokit.repos.updateRelease({
        owner: GITHUB_OWNER,
        repo: GITHUB_REPO,
        release_id: existingRelease.id,
        tag_name: RELEASE_TAG,
        name: `v${version}`,
        body: generateReleaseNotes(version),
        draft: false,
        prerelease: false
      });
      
      // Удаляем старый ассет если есть
      if (existingRelease.assets && existingRelease.assets.length > 0) {
        for (const asset of existingRelease.assets) {
          console.log(`🗑️  Удаление старого ассета: ${asset.name}`);
          await octokit.repos.deleteReleaseAsset({
            owner: GITHUB_OWNER,
            repo: GITHUB_REPO,
            asset_id: asset.id
          });
        }
      }
      
    } catch (error) {
      if (error.status === 404) {
        console.log('📝 Создание нового релиза...');
        
        // Создаём новый релиз
        release = await octokit.repos.createRelease({
          owner: GITHUB_OWNER,
          repo: GITHUB_REPO,
          tag_name: RELEASE_TAG,
          name: `v${version}`,
          body: generateReleaseNotes(version),
          draft: false,
          prerelease: false
        });
        
      } else {
        throw error;
      }
    }
    
    // Загружаем ZIP файл
    console.log('⬆️  Загрузка ZIP файла...');
    const zipBuffer = fs.readFileSync(BUILD_ZIP);
    
    const uploadResponse = await octokit.repos.uploadReleaseAsset({
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      release_id: release.data.id,
      name: 'notes-plugin.zip',
      data: zipBuffer
    });
    
    console.log('✅ Релиз успешно создан!');
    console.log(`🔗 URL: ${release.data.html_url}`);
    console.log(`📦 Ассет: ${uploadResponse.data.browser_download_url}`);
    console.log('\n==================================\n');
    
    // Выводим команду для обновления ссылки в PluginMarketplace.ts
    console.log('📝 Для обновления ссылки в SmartTable используйте:');
    console.log(`   releaseUrl: '${uploadResponse.data.browser_download_url}'`);
    console.log('');
    
  } catch (error) {
    console.error('❌ Ошибка при создании релиза:');
    console.error(error.message);
    
    if (error.status === 401) {
      console.error('\n⚠️  Неверный токен. Проверьте GITHUB_TOKEN.');
    } else if (error.status === 403) {
      console.error('\n⚠️  Недостаточно прав. Проверьте разрешения токена.');
    }
    
    process.exit(1);
  }
}

function generateReleaseNotes(version) {
  const date = new Date().toISOString().split('T')[0];
  
  return `## Notes Plugin v${version}

### Изменения
- ✅ Плавающая кнопка в правом нижнем углу
- ✅ Независимость от ribbon API
- ✅ Автоматическое сохранение заметок
- ✅ Поддержка модальных окон

### Установка
1. Скачайте notes-plugin.zip
2. В SmartTable откройте Extensions
3. Нажмите "Установить" и выберите файл

### Совместимость
- SmartTable v1.0.0+
- API Version: 1.0

---
📅 Дата релиза: ${date}
🔗 Репозиторий: https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}
`;
}

// Запускаем
createRelease();
