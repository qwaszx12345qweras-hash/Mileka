package studio.slay.rwapi;

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
}
