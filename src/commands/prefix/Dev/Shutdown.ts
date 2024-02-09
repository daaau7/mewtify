import { EmbedBuilder, Message } from "discord.js";
import { Accessableby, PrefixCommand } from "../../../@types/Command.js";
import { Manager } from "../../../manager.js";

export default class implements PrefixCommand {
  name = "restart";
  description = "Restart the client!";
  category = "Dev";
  accessableby = Accessableby.Owner;
  usage = "";
  aliases = [];
  lavalink = false;

  async run(
    client: Manager,
    message: Message,
    args: string[],
    language: string,
    prefix: string
  ) {
    const restart = new EmbedBuilder()
      .setDescription(
        `${client.i18n.get(language, "utilities", "restart_msg")}`
      )
      .setColor(client.color);
    await message.reply({ embeds: [restart] });

    process.exit();
  }
}
