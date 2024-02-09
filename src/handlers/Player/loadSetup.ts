import { NormalModeIcons } from "../../assets/normalMode.js";
import { SafeModeIcons } from "../../assets/safeMode.js";
import { Manager } from "../../manager.js";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";

/**
 *
 * @param {Client} client
 */

export class playerLoadSetup {
  client: Manager;
  icons: typeof SafeModeIcons | typeof NormalModeIcons;
  constructor(client: Manager) {
    this.client = client;
    this.icons = this.client.config.bot.SAFE_ICONS_MODE
      ? SafeModeIcons
      : NormalModeIcons;
    this.registerDisableSwitch();
    this.registerEnableSwitch();
    this.registerEnableSwitchMod();
  }
  registerEnableSwitch() {
    this.client.enSwitch = new ActionRowBuilder<ButtonBuilder>().addComponents([
      new ButtonBuilder()
        .setStyle(ButtonStyle.Secondary)
        .setCustomId("sstop")
        .setLabel("Stop")
        .setEmoji(this.icons.stop),
      new ButtonBuilder()
        .setStyle(ButtonStyle.Secondary)
        .setCustomId("sprevious")
        .setLabel("Previous")
        .setEmoji(this.icons.previous),
      new ButtonBuilder()
        .setStyle(ButtonStyle.Secondary)
        .setCustomId("spause")
        .setLabel("Play")
        .setEmoji(this.icons.play),
      new ButtonBuilder()
        .setStyle(ButtonStyle.Secondary)
        .setCustomId("sskip")
        .setLabel("Skip")
        .setEmoji(this.icons.skip),
      new ButtonBuilder()
        .setStyle(ButtonStyle.Secondary)
        .setCustomId("sloop")
        .setLabel("Loop")
        .setEmoji(this.icons.loop),
    ]);
  }

  registerEnableSwitchMod() {
    this.client.enSwitchMod =
      new ActionRowBuilder<ButtonBuilder>().addComponents([
        new ButtonBuilder()
          .setStyle(ButtonStyle.Secondary)
          .setCustomId("sstop")
          .setLabel("Stop")
          .setEmoji(this.icons.stop),
        new ButtonBuilder()
          .setStyle(ButtonStyle.Secondary)
          .setCustomId("sprevious")
          .setLabel("Previous")
          .setEmoji(this.icons.previous),
        new ButtonBuilder()
          .setStyle(ButtonStyle.Secondary)
          .setCustomId("spause")
          .setLabel("Pause")
          .setEmoji(this.icons.pause),
        new ButtonBuilder()
          .setStyle(ButtonStyle.Secondary)
          .setCustomId("sskip")
          .setLabel("Skip")
          .setEmoji(this.icons.skip),
        new ButtonBuilder()
          .setStyle(ButtonStyle.Secondary)
          .setCustomId("sloop")
          .setLabel("Loop")
          .setEmoji(this.icons.loop),
      ]);
  }

  registerDisableSwitch() {
    this.client.diSwitch = new ActionRowBuilder<ButtonBuilder>().addComponents([
      new ButtonBuilder()
        .setStyle(ButtonStyle.Secondary)
        .setCustomId("sstop")
        .setLabel("Stop")
        .setEmoji(this.icons.stop)
        .setDisabled(true),
      new ButtonBuilder()
        .setStyle(ButtonStyle.Secondary)
        .setCustomId("sprevious")
        .setLabel("Previous")
        .setEmoji(this.icons.previous)
        .setDisabled(true),
      new ButtonBuilder()
        .setStyle(ButtonStyle.Secondary)
        .setCustomId("spause")
        .setLabel("Pause")
        .setEmoji(this.icons.pause)
        .setDisabled(true),
      new ButtonBuilder()
        .setStyle(ButtonStyle.Secondary)
        .setCustomId("sskip")
        .setLabel("Skip")
        .setEmoji(this.icons.skip)
        .setDisabled(true),
      new ButtonBuilder()
        .setStyle(ButtonStyle.Secondary)
        .setCustomId("sloop")
        .setLabel("Loop")
        .setEmoji(this.icons.loop)
        .setDisabled(true),
    ]);
  }
}
