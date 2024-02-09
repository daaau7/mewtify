import {
  EmbedBuilder,
  ApplicationCommandOptionType,
  CommandInteraction,
  CommandInteractionOptionResolver,
} from "discord.js";
import { Manager } from "../../../manager.js";
import { Accessableby, SlashCommand } from "../../../@types/Command.js";
import { ControlEnum } from "../../../database/schema/Control.js";

export default class implements SlashCommand {
  name = ["settings-control"];
  description = "Enable or disable the player control";
  category = "Settings";
  accessableby = Accessableby.Manager;
  lavalink = false;
  options = [
    {
      name: "type",
      description: "Choose enable or disable",
      type: ApplicationCommandOptionType.String,
      required: true,
      choices: [
        {
          name: "Enable",
          value: "enable",
        },
        {
          name: "Disable",
          value: "disable",
        },
      ],
    },
  ];

  async run(
    interaction: CommandInteraction,
    client: Manager,
    language: string
  ) {
    await interaction.deferReply({ ephemeral: false });
    if (
      (interaction.options as CommandInteractionOptionResolver).getString(
        "type"
      ) === "enable"
    ) {
      await client.db.control.set(
        `${interaction.guild!.id}`,
        ControlEnum.Enable
      );

      const embed = new EmbedBuilder()
        .setDescription(
          `${client.i18n.get(language, "utilities", "control_set", {
            toggle: `${client.i18n.get(language, "music", "enabled")}`,
          })}`
        )
        .setColor(client.color);

      return interaction.editReply({ embeds: [embed] });
    } else if (
      (interaction.options as CommandInteractionOptionResolver).getString(
        "type"
      ) === "disable"
    ) {
      await client.db.control.set(
        `${interaction.guild!.id}`,
        ControlEnum.Disable
      );
      const embed = new EmbedBuilder()
        .setDescription(
          `${client.i18n.get(language, "utilities", "control_set", {
            toggle: `${client.i18n.get(language, "music", "disabled")}`,
          })}`
        )
        .setColor(client.color);

      return interaction.editReply({ embeds: [embed] });
    }
  }
}
