import { EmbedBuilder, ChannelType, Message } from "discord.js";
import { Manager } from "../../../manager.js";
import { Accessableby, PrefixCommand } from "../../../@types/Command.js";

export default class implements PrefixCommand {
  name = "setup";
  description = "Setup channel song request";
  category = "Settings";
  accessableby = Accessableby.Manager;
  aliases = ["setup-channel"];
  usage = "<create or delete>";
  lavalink = false;

  async run(
    client: Manager,
    message: Message,
    args: string[],
    language: string,
    prefix: string
  ) {
    let option = ["create", "delete"];
    if (!args[0] || !option.includes(args[0]))
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(language, "utilities", "arg_error", {
                text: "(create or delete)",
              })}`
            )
            .setColor(client.color),
        ],
      });

    const choose = args[0];

    if (choose === "create") {
      const SetupChannel = await client.db.setup.get(`${message.guild!.id}`);
      if (SetupChannel!.enable == true)
        return message.reply({
          embeds: [
            new EmbedBuilder()
              .setDescription(
                `${client.i18n.get(language, "setup", "setup_enable")}`
              )
              .setColor(client.color),
          ],
        });

      const parent = await message.guild!.channels.create({
        name: `${client.user!.username} Music Zone`,
        type: ChannelType.GuildCategory,
      });

      const textChannel = await message.guild!.channels.create({
        name: "song-request",
        type: ChannelType.GuildText,
        topic: `${client.i18n.get(language, "setup", "setup_topic")}`,
        parent: parent.id,
      });
      const queueMsg = `${client.i18n.get(
        language,
        "setup",
        "setup_queuemsg"
      )}`;

      const playEmbed = new EmbedBuilder()
        .setColor(client.color)
        .setAuthor({
          name: `${client.i18n.get(
            language,
            "setup",
            "setup_playembed_author"
          )}`,
        })
        .setImage(client.config.bot.REQUEST_IMAGE);

      const channel_msg = await textChannel.send({
        content: `${queueMsg}`,
        embeds: [playEmbed],
        components: [client.diSwitch],
      });

      const voiceChannel = await message.guild!.channels.create({
        name: `${client.user!.username} Music`,
        type: ChannelType.GuildVoice,
        parent: parent.id,
        userLimit: 30,
      });

      const new_data = {
        guild: message.guild!.id,
        enable: true,
        channel: textChannel.id,
        playmsg: channel_msg.id,
        voice: voiceChannel.id,
        category: parent.id,
      };

      await client.db.setup.set(`${message.guild!.id}`, new_data);

      const embed = new EmbedBuilder()
        .setDescription(
          `${client.i18n.get(language, "setup", "setup_msg", {
            channel: textChannel.name,
          })}`
        )
        .setColor(client.color);
      return message.reply({ embeds: [embed] });
    }

    if (choose === "delete") {
      const SetupChannel = await client.db.setup.get(`${message.guild!.id}`);

      const embed_none = new EmbedBuilder()
        .setDescription(`${client.i18n.get(language, "setup", "setup_null")}`)
        .setColor(client.color);

      if (SetupChannel == null)
        return message.reply({
          embeds: [embed_none],
        });

      if (SetupChannel.enable == false)
        return message.reply({
          embeds: [embed_none],
        });

      const fetchedTextChannel = message.guild!.channels.cache.get(
        SetupChannel.channel
      );
      const fetchedVoiceChannel = message.guild!.channels.cache.get(
        SetupChannel.voice
      );
      const fetchedCategory = message.guild!.channels.cache.get(
        SetupChannel.category
      );

      const embed = new EmbedBuilder()
        .setDescription(
          `${client.i18n.get(language, "setup", "setup_deleted", {
            channel: fetchedTextChannel?.name as string,
          })}`
        )
        .setColor(client.color);
      if (!SetupChannel) return message.reply({ embeds: [embed] });

      if (fetchedCategory) await fetchedCategory.delete();
      if (fetchedVoiceChannel) await fetchedVoiceChannel.delete();
      if (fetchedTextChannel) await fetchedTextChannel.delete();

      const deleted_data = {
        guild: message.guild!.id,
        enable: false,
        channel: "",
        playmsg: "",
        voice: "",
        category: "",
      };

      await client.db.setup.set(`${deleted_data.guild}`, deleted_data);

      return message.reply({ embeds: [embed] });
    }
  }
}
