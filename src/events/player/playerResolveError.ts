import { MewwmePlayer, MewwmeTrack } from "mewwme.player";
import { Manager } from "../../manager.js";
import { TextChannel, EmbedBuilder } from "discord.js";

export default class {
  async execute(
    client: Manager,
    player: MewwmePlayer,
    track: MewwmeTrack,
    message: string
  ) {
    if (!client.isDatabaseConnected)
      return client.logger.warn(
        "The database is not yet connected so this event will temporarily not execute. Please try again later!"
      );

    const guild = await client.guilds.cache.get(player.guildId);

    client.logger.log({ level: "error", message: message });

    /////////// Update Music Setup //////////
    await client.UpdateMusic(player);
    /////////// Update Music Setup ///////////

    const channel = client.channels.cache.get(player.textId) as TextChannel;
    if (!channel) return;

    let guildModel = await client.db.language.get(`${channel.guild.id}`);
    if (!guildModel) {
      guildModel = await client.db.language.set(`${channel.guild.id}`, "en");
    }

    const language = guildModel;

    const embed = new EmbedBuilder()
      .setColor(client.color)
      .setDescription(`${client.i18n.get(language, "player", "error_desc")}`);

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

    client.logger.error(
      `Track Error in ${guild!.name} / ${player.guildId}. Auto-Leaved!`
    );
    await player.destroy();
  }
}
