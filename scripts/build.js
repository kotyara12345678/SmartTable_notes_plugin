/**
 * Build Script - Сборка плагина в ZIP архив
 * Автоматическое создание архива для релиза
 */

const AdmZip = require('adm-zip');
const fs = require('fs');
const path = require('path');

// Конфигурация
const PLUGIN_DIR = path.resolve(__dirname, '..');
const BUILD_DIR = path.join(PLUGIN_DIR, 'build');
const OUTPUT_ZIP = path.join(BUILD_DIR, 'notes-plugin.zip');

// Файлы для включения в сборку
const FILES_TO_INCLUDE = [
  'main.js',
  'manifest.json',
  'styles.css',
  'README.md'
];

console.log('🔨 Notes Plugin - Build Script');
console.log('================================');

// Создаём папку build
if (!fs.existsSync(BUILD_DIR)) {
  fs.mkdirSync(BUILD_DIR, { recursive: true });
  console.log('✅ Создана папка build/');
}

// Проверяем наличие файлов
const existingFiles = FILES_TO_INCLUDE.filter(file => 
  fs.existsSync(path.join(PLUGIN_DIR, file))
);

console.log(`📁 Найдено файлов: ${existingFiles.length}`);
existingFiles.forEach(file => console.log(`   - ${file}`));

// Создаём ZIP архив
console.log('\n📦 Создание ZIP архива...');
const zip = new AdmZip();

// Добавляем файлы в архив (без путей)
existingFiles.forEach(file => {
  const filePath = path.join(PLUGIN_DIR, file);
  zip.addLocalFile(filePath, '');
  console.log(`   ✅ Добавлен: ${file}`);
});

// Сохраняем архив
zip.writeZip(OUTPUT_ZIP);

// Получаем размер
const stats = fs.statSync(OUTPUT_ZIP);
const sizeKB = (stats.size / 1024).toFixed(2);

console.log('\n✅ Сборка завершена!');
console.log(`📦 Архив: ${OUTPUT_ZIP}`);
console.log(`📊 Размер: ${sizeKB} KB`);
console.log('================================\n');

// Копируем в папку releases для удобства
const RELEASES_DIR = path.join(PLUGIN_DIR, 'releases');
if (!fs.existsSync(RELEASES_DIR)) {
  fs.mkdirSync(RELEASES_DIR, { recursive: true });
}

const releaseZip = path.join(RELEASES_DIR, 'notes-plugin.zip');
fs.copyFileSync(OUTPUT_ZIP, releaseZip);
console.log(`📋 Копия сохранена: ${releaseZip}\n`);
