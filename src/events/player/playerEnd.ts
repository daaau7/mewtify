import { MewwmePlayer } from "mewwme.player";
import chalk from "chalk";
import { Manager } from "../../manager.js";
import { EmbedBuilder, Client, TextChannel } from "discord.js";
import { ClearMessageService } from "../../utilities/ClearMessageService.js";
// import { AutoReconnectBuilder } from "../../database/build/AutoReconnect.js";
// auto reconnect is not needed now for skip track commands

export default class {
  async execute(client: Manager, player: MewwmePlayer) {
    if (!client.isDatabaseConnected)
      return client.logger.warn(
        "The database is not yet connected so this event will temporarily not execute. Please try again later!"
      );

    const guild = await client.guilds.cache.get(player.guildId);
    client.logger.info(
      `${chalk.hex("#f08080")("Player End in @ ")}${chalk.hex("#f08080")(
        guild!.name
      )} / ${chalk.hex("#f08080")(player.guildId)}`
    );

    /////////// Update Music Setup //////////
    await client.UpdateMusic(player);
    /////////// Update Music Setup ///////////

    client.emit("playerEnd", player);

    //    let data = await new AutoReconnectBuilder(client, player).get(
    //      player.guildId
    //    );
    const channel = client.channels.cache.get(player.textId) as TextChannel;
    if (!channel) return;

    //    if (data && data.twentyfourseven) return;

    if (player.queue.length || player!.queue!.current)
      return new ClearMessageService(client, channel, player);

    if (player.loop !== "none")
      return new ClearMessageService(client, channel, player);

    let guildModel = await client.db.language.get(`${player.guildId}`);
    if (!guildModel) {
      guildModel = await client.db.language.set(
        `${player.guildId}`,
        client.config.bot.LANGUAGE
      );
    }

    const language = guildModel;

    const embed = new EmbedBuilder()
      .setColor(client.color)
      .setDescription(
        `${client.i18n.get(language, "player", "queue_end_desc")}`
      );

    if (channel) {
      const msg = await channel.send({ embeds: [embed] });
      setTimeout(async () => {
        try {
          await msg.delete();
        } catch (error) {
          client.logger.info(
            `Already deleted message in @ ${guild!.name} / ${player.guildId}`
          );
          // Handle the error, e.g., logging, notifying, etc.
        }
      }, client.config.bot.DELETE_MSG_TIMEOUT);
    }

    player.destroy();
  }
}
