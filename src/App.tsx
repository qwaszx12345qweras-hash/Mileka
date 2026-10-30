import JSZip from 'jszip';
import { saveAs } from 'file-saver';

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
        getLogger().info("Rwapi plugin enabled!");
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
                getLogger().info("Player joined: " + playerName);
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
          retention-days: 30`;

const gitignore = `target/
*.class
*.jar
*.log
.idea/
*.iml
.DS_Store`;

function downloadFile(content: string, filename: string, mime: string) {
  saveAs(new Blob([content], { type: mime }), filename);
}

export default function App() {
  const downloadZip = async () => {
    const zip = new JSZip();
    zip.file('pom.xml', pomXml);
    zip.file('src/main/resources/plugin.yml', pluginYml);
    zip.file('src/main/java/studio/slay/rwapi/RwapiPlugin.java', rwapiPluginJava);
    zip.file('.github/workflows/build.yml', githubActionsYml);
    zip.file('.gitignore', gitignore);
    const blob = await zip.generateAsync({ type: 'blob' });
    saveAs(blob, 'Rwapi.zip');
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 24, fontFamily: 'monospace' }}>
      <h1>Rwapi Plugin — файлы для скачивания</h1>
      <p>Скачай ZIP и закинь в GitHub репозиторий. Actions соберёт JAR автоматически.</p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 16 }}>
        <button onClick={downloadZip} style={{ padding: '8px 16px', cursor: 'pointer' }}>
          📦 Скачать ZIP (весь проект)
        </button>
        <button onClick={() => downloadFile(rwapiPluginJava, 'RwapiPlugin.java', 'text/x-java')} style={{ padding: '8px 16px', cursor: 'pointer' }}>
          ☕ RwapiPlugin.java
        </button>
        <button onClick={() => downloadFile(pluginYml, 'plugin.yml', 'text/yaml')} style={{ padding: '8px 16px', cursor: 'pointer' }}>
          📋 plugin.yml
        </button>
        <button onClick={() => downloadFile(pomXml, 'pom.xml', 'text/xml')} style={{ padding: '8px 16px', cursor: 'pointer' }}>
          📦 pom.xml
        </button>
        <button onClick={() => downloadFile(githubActionsYml, 'build.yml', 'text/yaml')} style={{ padding: '8px 16px', cursor: 'pointer' }}>
          ⚙️ build.yml (Actions)
        </button>
      </div>

      <hr style={{ margin: '24px 0' }} />

      <h2>pom.xml</h2>
      <pre style={{ background: '#1e1e1e', color: '#d4d4d4', padding: 16, borderRadius: 8, overflowX: 'auto', fontSize: 13 }}>
        <code>{pomXml}</code>
      </pre>

      <h2>RwapiPlugin.java</h2>
      <pre style={{ background: '#1e1e1e', color: '#d4d4d4', padding: 16, borderRadius: 8, overflowX: 'auto', fontSize: 13 }}>
        <code>{rwapiPluginJava}</code>
      </pre>

      <h2>plugin.yml</h2>
      <pre style={{ background: '#1e1e1e', color: '#d4d4d4', padding: 16, borderRadius: 8, overflowX: 'auto', fontSize: 13 }}>
        <code>{pluginYml}</code>
      </pre>

      <h2>.github/workflows/build.yml</h2>
      <pre style={{ background: '#1e1e1e', color: '#d4d4d4', padding: 16, borderRadius: 8, overflowX: 'auto', fontSize: 13 }}>
        <code>{githubActionsYml}</code>
      </pre>

      <hr style={{ margin: '24px 0' }} />
      <h3>Как собрать:</h3>
      <ol>
        <li>Создай репозиторий на GitHub</li>
        <li>Скачай ZIP, распакуй, запушь все файлы</li>
        <li>Зайди в Actions — JAR соберётся сам</li>
        <li>Скачай готовый JAR из Artifacts</li>
      </ol>
    </div>
  );
}
