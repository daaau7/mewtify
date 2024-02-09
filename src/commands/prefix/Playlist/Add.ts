import {
  EmbedBuilder,
  ApplicationCommandOptionType,
  Message,
} from "discord.js";
import { ConvertTime } from "../../../structures/ConvertTime.js";
import { StartQueueDuration } from "../../../structures/QueueDuration.js";
import { MewwmeTrack } from "mewwme.player";
import { Manager } from "../../../manager.js";
import { Accessableby, PrefixCommand } from "../../../@types/Command.js";

const TrackAdd: MewwmeTrack[] = [];

export default class implements PrefixCommand {
  name = "pl-add";
  description = "Add song to a playlist";
  category = "Playlist";
  accessableby = Accessableby.Member;
  usage = "<playlist_id> <url_or_name>";
  aliases = [];
  lavalink = true;

  async run(
    client: Manager,
    message: Message,
    args: string[],
    language: string,
    prefix: string
  ) {
    const value = args[0] ? args[0] : null;
    if (value == null || !value)
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(language, "playlist", "invalid")}`
            )
            .setColor(client.color),
        ],
      });
    const input = args[1];

    const Inputed = input;

    const msg = await message.reply({
      embeds: [
        new EmbedBuilder()
          .setDescription(
            `${client.i18n.get(language, "playlist", "add_loading")}`
          )
          .setColor(client.color),
      ],
    });

    if (!input)
      return msg.edit({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(language, "playlist", "add_match")}`
            )
            .setColor(client.color),
        ],
      });

    const result = await client.manager.search(input, {
      requester: message.author,
    });
    const tracks = result.tracks;

    if (!result.tracks.length)
      return msg.edit({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(language, "playlist", "add_match")}`
            )
            .setColor(client.color),
        ],
      });
    if (result.type === "PLAYLIST")
      for (let track of tracks) TrackAdd.push(track);
    else TrackAdd.push(tracks[0]);

    const Duration = new ConvertTime().parse(tracks[0].length as number);
    const TotalDuration = new StartQueueDuration().parse(tracks);

    if (result.type === "PLAYLIST") {
      const embed = new EmbedBuilder()
        .setDescription(
          `${client.i18n.get(language, "playlist", "add_playlist", {
            title: tracks[0].title,
            url: Inputed,
            duration: new ConvertTime().parse(TotalDuration),
            track: String(tracks.length),
            user: String(message.author),
          })}`
        )
        .setColor(client.color);
      msg.edit({ content: " ", embeds: [embed] });
    } else if (result.type === "TRACK") {
      const embed = new EmbedBuilder()
        .setDescription(
          `${client.i18n.get(language, "playlist", "add_track", {
            title: tracks[0].title,
            url: String(tracks[0].uri),
            duration: Duration,
            user: String(message.author),
          })}`
        )
        .setColor(client.color);
      msg.edit({ content: " ", embeds: [embed] });
    } else if (result.type === "SEARCH") {
      const embed = new EmbedBuilder()
        .setDescription(
          `${client.i18n.get(language, "playlist", "add_search", {
            title: tracks[0].title,
            url: String(tracks[0].uri),
            duration: Duration,
            user: String(message.author),
          })}`
        )
        .setColor(client.color);
      msg.edit({ content: " ", embeds: [embed] });
    } else {
      //The playlist link is invalid.
      return msg.edit(`${client.i18n.get(language, "playlist", "add_match")}`);
    }

    const playlist = await client.db.playlist.get(value);

    if (!playlist)
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(language, "playlist", "invalid")}`
            )
            .setColor(client.color),
        ],
      });

    if (playlist.owner !== message.author.id) {
      message.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(language, "playlist", "add_owner")}`
            )
            .setColor(client.color),
        ],
      });
      TrackAdd.length = 0;
      return;
    }
    const LimitTrack = playlist.tracks!.length + TrackAdd.length;

    if (LimitTrack > client.config.bot.LIMIT_TRACK) {
      message.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(language, "playlist", "add_limit_track", {
                limit: String(client.config.bot.LIMIT_TRACK),
              })}`
            )
            .setColor(client.color),
        ],
      });
      TrackAdd.length = 0;
      return;
    }

    TrackAdd.forEach(async (track) => {
      await client.db.playlist.push(`${value}.tracks`, {
        title: track.title,
        uri: track.uri,
        length: track.length,
        thumbnail: track.thumbnail,
        author: track.author,
        requester: track.requester, // Just case can push
      });
    });

    const embed = new EmbedBuilder()
      .setDescription(
        `${client.i18n.get(language, "playlist", "add_added", {
          count: String(TrackAdd.length),
          playlist: value,
        })}`
      )
      .setColor(client.color);

    message.reply({ content: " ", embeds: [embed] });
    TrackAdd.length = 0;
  }
}
