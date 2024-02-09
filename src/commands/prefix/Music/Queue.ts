import { EmbedBuilder, Message, PermissionsBitField } from "discord.js";
import { FormatDuration } from "../../../structures/FormatDuration.js";
import { PageQueue } from "../../../structures/PageQueue.js";
import { Manager } from "../../../manager.js";
import { Accessableby, PrefixCommand } from "../../../@types/Command.js";

// Main code
export default class implements PrefixCommand {
  name = "queue";
  description = "Show the queue of songs.";
  category = "Music";
  usage = "";
  aliases = ["q"];
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

    if (value && isNaN(+value))
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(language, "music", "number_invalid")}`
            )
            .setColor(client.color),
        ],
      });

    const player = client.manager.players.get(message.guild!.id);
    if (!player)
      return message.reply({
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
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(language, "noplayer", "no_voice")}`
            )
            .setColor(client.color),
        ],
      });

    const song = player.queue.current;
    function fixedduration() {
      const current = player!.queue.current!.length ?? 0;
      return player!.queue.reduce(
        (acc, cur) => acc + (cur.length || 0),
        current
      );
    }
    const qduration = `${new FormatDuration().parse(fixedduration())}`;
    const thumbnail = `https://img.youtube.com/vi/${
      song!.identifier
    }/hqdefault.jpg`;

    let pagesNum = Math.ceil(player.queue.length / 10);
    if (pagesNum === 0) pagesNum = 1;

    const songStrings = [];
    for (let i = 0; i < player.queue.length; i++) {
      const song = player.queue[i];
      songStrings.push(
        `**${i + 1}.** [${song.title}](${
          client.config.bot.SERVER_SUPPORT
        }) \`[${new FormatDuration().parse(song.length)}]\``
      );
    }

    const pages = [];
    for (let i = 0; i < pagesNum; i++) {
      const str = songStrings.slice(i * 10, i * 10 + 10).join("");

      const embed = new EmbedBuilder()
        .setAuthor({
          name: `${message.guild!.members.me!.displayName} Queue`,
          url: client.config.bot.SERVER_SUPPORT,
          iconURL: client.user!.displayAvatarURL() as string,
        })
        .setColor(client.color)
        .setDescription(
          `${client.i18n.get(language, "music", "queue_description", {
            title: String(song!.title),
            url: String(song!.uri),
            serversupport: String(client.config.bot.SERVER_SUPPORT),
            request: String(song!.requester),
            duration: new FormatDuration().parse(song!.length),
            rest: str == "" ? "  Nothing" : "\n" + str,
          })}`
        )
        .setFooter({
          text: `${client.i18n.get(language, "music", "queue_footer", {
            page: String(i + 1),
            pages: String(pagesNum),
            queue_lang: String(player.queue.length),
            duration: qduration,
          })}`,
        });

      pages.push(embed);
    }

    if (!value) {
      if (pages.length == pagesNum && player.queue.length > 10)
        await new PageQueue(
          client,
          pages,
          60000,
          player.queue.length,
          language
        ).prefixPage(message, Number(qduration));
      else return message.reply({ embeds: [pages[0]] });
    } else {
      if (isNaN(+value))
        return message.reply({
          embeds: [
            new EmbedBuilder()
              .setDescription(
                `${client.i18n.get(language, "music", "queue_notnumber")}`
              )
              .setColor(client.color),
          ],
        });
      if (Number(value) > pagesNum)
        return message.reply({
          embeds: [
            new EmbedBuilder()
              .setDescription(
                `${client.i18n.get(language, "music", "queue_page_notfound", {
                  page: String(pagesNum),
                })}`
              )
              .setColor(client.color),
          ],
        });
      const pageNum = Number(value) == 0 ? 1 : Number(value) - 1;
      return message.reply({ embeds: [pages[pageNum]] });
    }
  }
}
