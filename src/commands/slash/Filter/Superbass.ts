import { CommandInteraction, EmbedBuilder, GuildMember } from "discord.js";
import delay from "delay";
import { Manager } from "../../../manager.js";
import { Accessableby, SlashCommand } from "../../../@types/Command.js";

export default class implements SlashCommand {
  name = ["superbass"];
  description = "Turning on superbass filter";
  category = "Filter";
  lavalink = true;
  accessableby = Accessableby.Member;
  options = [];

  async run(
    interaction: CommandInteraction,
    client: Manager,
    language: string
  ) {
    await interaction.deferReply({ ephemeral: false });

    const msg = await interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setDescription(
            `${client.i18n.get(language, "filters", "filter_loading", {
              name: "superbass",
            })}`
          )
          .setColor(client.color),
      ],
    });

    const player = client.manager.players.get(interaction.guild!.id);
    if (!player)
      return msg.edit({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(language, "noplayer", "no_player")}`
            )
            .setColor(client.color),
        ],
      });
    const { channel } = (interaction.member as GuildMember)!.voice;
    if (
      !channel ||
      (interaction.member as GuildMember)!.voice.channel !==
        interaction.guild!.members.me!.voice.channel
    )
      return msg.edit({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(language, "noplayer", "no_voice")}`
            )
            .setColor(client.color),
        ],
      });

    const data = {
      guildId: interaction.guild!.id,
      playerOptions: {
        filters: {
          equalizer: [
            { band: 0, gain: 0.2 },
            { band: 1, gain: 0.3 },
            { band: 2, gain: 0 },
            { band: 3, gain: 0.8 },
            { band: 4, gain: 0 },
            { band: 5, gain: 0.5 },
            { band: 6, gain: 0 },
            { band: 7, gain: -0.5 },
            { band: 8, gain: 0 },
            { band: 9, gain: 0 },
            { band: 10, gain: 0 },
            { band: 11, gain: 0 },
            { band: 12, gain: 0 },
            { band: 13, gain: 0 },
          ],
        },
      },
    };

    await player.send(data);

    const sbed = new EmbedBuilder()
      .setDescription(
        `${client.i18n.get(language, "filters", "filter_on", {
          name: "superbass",
        })}`
      )
      .setColor(client.color);

    await delay(2000);
    msg.edit({ content: " ", embeds: [sbed] });
  }
}
