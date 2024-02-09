import {
  ButtonInteraction,
  EmbedBuilder,
  TextChannel,
  VoiceBasedChannel,
} from "discord.js";
import { Manager } from "../../../manager.js";
import { MewwmePlayer } from "mewwme.player";

export class ButtonPause {
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
    let data = await this.client.db.setup.get(`${this.player.guildId}`);
    if (!data) return;
    if (data.enable === false) return;

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
    } else if (!this.player) {
      this.interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${this.client.i18n.get(this.language, "noplayer", "no_player")}`
            )
            .setColor(this.client.color),
        ],
      });
      return;
    } else {
      const getChannel = await this.client.channels.cache.get(data.channel);
      if (!getChannel) return;
      let playMsg = await (getChannel as TextChannel)!.messages.fetch(
        data.playmsg
      );
      if (!playMsg) return;

      await this.player.pause(!this.player.paused);
      const uni = this.player.paused
        ? `${this.client.i18n.get(this.language, "player", "switch_pause")}`
        : `${this.client.i18n.get(this.language, "player", "switch_resume")}`;

      this.player.paused
        ? playMsg.edit({
            // content: playMsg.content,
            // embeds: new EmbedBuilder(playMsg.embeds),
            components: [this.client.enSwitch],
          })
        : playMsg.edit({
            // content: playMsg.content,
            // embeds: playMsg.embeds,
            components: [this.client.enSwitchMod],
          });

      const embed = new EmbedBuilder()
        .setDescription(
          `${this.client.i18n.get(this.language, "player", "pause_msg", {
            pause: uni,
          })}`
        )
        .setColor(this.client.color);

      this.interaction.reply({ embeds: [embed] });
    }
  }
}
