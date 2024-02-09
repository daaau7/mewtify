import { EmbedBuilder, Message } from "discord.js";
import humanizeDuration from "humanize-duration";
import { Playlist } from "../../../database/schema/Playlist.js";
import { Manager } from "../../../manager.js";
import { Accessableby, PrefixCommand } from "../../../@types/Command.js";

let info: Playlist | null;

export default class implements PrefixCommand {
  name = "pl-info";
  description = "Check the playlist infomation";
  category = "Playlist";
  usage = "<playlist_id>";
  aliases = ["pl-i"];
  lavalink = false;
  accessableby = Accessableby.Member;

  async run(
    client: Manager,
    message: Message,
    args: string[],
    language: string,
    prefix: string
  ) {
    const value = args[0] ? args[0] : null;

    if (value == null)
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(language, "playlist", "invalid")}`
            )
            .setColor(client.color),
        ],
      });

    const info = await client.db.playlist.get(value);

    if (!info)
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(language, "playlist", "invalid")}`
            )
            .setColor(client.color),
        ],
      });

    const created = humanizeDuration(Date.now() - Number(info.created), {
      largest: 1,
    });

    const name = await client.users.fetch(info.owner);

    const embed = new EmbedBuilder()
      .setTitle(info.name)
      .addFields([
        {
          name: `${client.i18n.get(language, "playlist", "info_des")}`,
          value: `${
            info.description === null || info.description === "null"
              ? client.i18n.get(language, "playlist", "no_des")
              : info.description
          }`,
        },
        {
          name: `${client.i18n.get(language, "playlist", "info_owner")}`,
          value: `${name.username}`,
        },
        {
          name: `${client.i18n.get(language, "playlist", "info_id")}`,
          value: `${info.id}`,
        },
        {
          name: `${client.i18n.get(language, "playlist", "info_total")}`,
          value: `${info.tracks!.length}`,
        },
        {
          name: `${client.i18n.get(language, "playlist", "info_created")}`,
          value: `${created}`,
        },
        {
          name: `${client.i18n.get(language, "playlist", "info_private")}`,
          value: `${
            info.private
              ? client.i18n.get(language, "playlist", "public")
              : client.i18n.get(language, "playlist", "private")
          }`,
        },
      ])
      .setColor(client.color);
    message.reply({ embeds: [embed] });
  }
}
