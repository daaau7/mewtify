import { ButtonInteraction, EmbedBuilder, VoiceBasedChannel } from "discord.js";
import { Manager } from "../../../manager.js";
import { MewwmePlayer } from "mewwme.player";

export class ButtonPrevious {
  client: Manager;
  interaction: ButtonInteraction;
  channel: VoiceBasedChannel | null;
  language: string;
  player: MewwmePlayer;
  constructor(
    client: Manager,
    interaction: ButtonInteraction,
    channel: VoiceBasedChannel | null,
    language: string,
    player: MewwmePlayer
  ) {
    this.channel = channel;
    this.client = client;
    this.language = language;
    this.player = player;
    this.interaction = interaction;
    this.execute();
  }

  async execute() {
    if (!this.channel) {
      this.interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${this.client.i18n.get(this.language, "noplayer", "no_voice")}`
            )
            .setColor(this.client.color),
        ],
      });
      return;
    } else if (
      this.interaction.guild!.members.me!.voice.channel &&
      !this.interaction.guild!.members.me!.voice.channel.equals(this.channel)
    ) {
      this.interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${this.client.i18n.get(this.language, "noplayer", "no_voice")}`
            )
            .setColor(this.client.color),
        ],
      });
      return;
    } else if (!this.player || this.player.queue.previous.length == 0) {
      this.interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${this.client.i18n.get(
                this.language,
                "music",
                "previous_notfound"
              )}`
            )
            .setColor(this.client.color),
        ],
      });
      return;
    } else {
      await this.player.queue.unshift(this.player.queue.previous[0]);
      await this.player.skip();

      const embed = new EmbedBuilder()
        .setDescription(
          `${this.client.i18n.get(this.language, "music", "previous_msg")}`
        )
        .setColor(this.client.color);

      this.interaction.reply({ embeds: [embed] });
    }
  }
}
