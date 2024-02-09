import { Manager } from "./../../../manager.js";
import {
  EmbedBuilder,
  ApplicationCommandOptionType,
  Message,
} from "discord.js";
import delay from "delay";
import { Accessableby, PrefixCommand } from "../../../@types/Command.js";

export default class implements PrefixCommand {
  name = "bassboost";
  description = "Turning on bassboost filter";
  category = "Filter";
  usage = "<number>";
  aliases = [];
  lavalink = true;
  accessableby = Accessableby.Member;

  async run(
    client: Manager,
    message: Message,
    args: string[],
    language: string,
    prefix: string
  ) {
    const value = args[0];
    if (value) {
      if (isNaN(+value)) {
        return message.channel.send(
          `${client.i18n.get(language, "music", "number_invalid")}`
        );
      } else if (Number(value) > 10 || Number(value) < -10) {
        return message.channel.send({
          embeds: [
            new EmbedBuilder()
              .setDescription(
                `${client.i18n.get(language, "filters", "bassboost_limit")}`
              )
              .setColor(client.color),
          ],
        });
      }
    }

    const msg = await message.channel.send({
      embeds: [
        new EmbedBuilder()
          .setDescription(
            `${client.i18n.get(language, "filters", "filter_loading", {
              name: "bassboost",
            })}`
          )
          .setColor(client.color),
      ],
    });

    const player = client.manager.players.get(message.guild!.id);
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
    const { channel } = message.member!.voice;
    if (
      !channel ||
      message.member!.voice.channel !== message.guild!.members.me!.voice.channel
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

    if (!value) {
      const data = {
        guildId: message.guild!.id,
        playerOptions: {
          filters: {
            equalizer: [
              { band: 0, gain: 0.1 },
              { band: 1, gain: 0.1 },
              { band: 2, gain: 0.05 },
              { band: 3, gain: 0.05 },
              { band: 4, gain: -0.05 },
              { band: 5, gain: -0.05 },
              { band: 6, gain: 0 },
              { band: 7, gain: -0.05 },
              { band: 8, gain: -0.05 },
              { band: 9, gain: 0 },
              { band: 10, gain: 0.05 },
              { band: 11, gain: 0.05 },
              { band: 12, gain: 0.1 },
              { band: 13, gain: 0.1 },
            ],
          },
        },
      };

      await player["send"](data);

      const embed = new EmbedBuilder()
        .setDescription(
          `${client.i18n.get(language, "filters", "filter_on", {
            name: "bassboost",
          })}`
        )
        .setColor(client.color);

      await delay(2000);
      return msg.edit({ content: " ", embeds: [embed] });
    }

    if (!isNaN(+value)) {
      const data = {
        guildId: message.guild!.id,
        playerOptions: {
          filters: {
            equalizer: [
              { band: 0, gain: Number(value) / 10 },
              { band: 1, gain: Number(value) / 10 },
              { band: 2, gain: Number(value) / 10 },
              { band: 3, gain: Number(value) / 10 },
              { band: 4, gain: Number(value) / 10 },
              { band: 5, gain: Number(value) / 10 },
              { band: 6, gain: Number(value) / 10 },
              { band: 7, gain: 0 },
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
      await player["send"](data);

      const embed = new EmbedBuilder()
        .setDescription(
          `${client.i18n.get(language, "filters", "bassboost_set", {
            amount: value,
          })}`
        )
        .setColor(client.color);

      await delay(2000);
      return msg.edit({ content: " ", embeds: [embed] });
    }
  }
}
