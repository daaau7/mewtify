import delay from "delay";
import {
  PermissionsBitField,
  EmbedBuilder,
  VoiceState,
  GuildMember,
  Role,
  TextChannel,
} from "discord.js";
import { Manager } from "../../manager.js";
import { AutoReconnectBuilder } from "../../database/build/AutoReconnect.js";

export default class {
  async execute(client: Manager, oldState: VoiceState, newState: VoiceState) {
    if (!client.isDatabaseConnected)
      return client.logger.warn(
        "The database is not yet connected so this event will temporarily not execute. Please try again later!"
      );

    let data = await new AutoReconnectBuilder(client).get(newState.guild.id);

    client.emit("voiceStateUpdateJoin", oldState, newState);
    client.emit("voiceStateUpdateLeave", oldState, newState);

    let guildModel = await client.db.language.get(`${newState.guild.id}`);
    if (!guildModel) {
      guildModel = await client.db.language.set(`${newState.guild.id}`, "en");
    }
    const language = guildModel;

    const player = client.manager?.players.get(newState.guild.id);
    if (!player) return;

    if (data && data.twentyfourseven) return;

    if (!newState.guild.members.cache.get(client.user!.id)!.voice.channelId)
      //  player.destroy();
      return;

    if (
      newState.channelId &&
      String(newState.channel!.type) == "GUILD_STAGE_VOICE" &&
      newState.guild.members.me!.voice.suppress
    ) {
      if (
        newState.guild.members.me!.permissions.has(
          PermissionsBitField.Flags.Connect
        ) ||
        (newState.channel &&
          newState.channel
            .permissionsFor(newState.guild.members.me as GuildMember | Role)
            .has(PermissionsBitField.Flags.Speak))
      ) {
        newState.guild.members.me!.voice.setSuppressed(false);
      }
    }

    if (oldState.id === client.user!.id) return;
    if (!oldState.guild.members.cache.get(client.user!.id)!.voice.channelId)
      return;

    const vcRoom = oldState.guild.members.me!.voice.channel!.id;

    const leaveEmbed = client.channels.cache.get(player.textId) as TextChannel;

    if (
      oldState.guild.members.cache.get(client.user!.id)!.voice.channelId ===
      oldState.channelId
    ) {
      if (
        oldState.guild.members.me!.voice?.channel &&
        oldState.guild.members.me!.voice.channel.members.filter(
          (m) => !m.user.bot
        ).size === 0
      ) {
        await delay(client.config.lavalink.LEAVE_TIMEOUT);

        const vcMembers =
          oldState.guild.members.me!.voice.channel?.members.size;
        if (!vcMembers || vcMembers === 1) {
          const newPlayer = client.manager?.players.get(newState.guild.id);
          newPlayer ? player.destroy() : true;
          const TimeoutEmbed = new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(language, "player", "player_end", {
                leave: vcRoom,
                serversupport: client.config.bot.SERVER_SUPPORT,
                vote: client.config.bot.VOTE_URL,
                bot: client.user!.username,
              })}`
            )
            .setColor(client.color);
          try {
            if (leaveEmbed) {
              const msg = await leaveEmbed.send({ embeds: [TimeoutEmbed] });
            }
          } catch (error) {
            client.logger.error(
              `Error sending leave message in Guild ${player.guildId}`
            );
          }
        }
      }
    }
  }
}
