import {
  ButtonInteraction,
  CacheType,
  InteractionCollector,
  Message,
} from "discord.js";
import { MewwmePlayer } from "mewwme.player";
import { PlayerButton } from "../@types/Button.js";
import { Manager } from "../manager.js";
import { ReplyInteractionService } from "../utilities/ReplyInteractionService.js";

export default class implements PlayerButton {
  name = "replay";
  async run(
    client: Manager,
    message: ButtonInteraction<CacheType>,
    language: string,
    player: MewwmePlayer,
    nplaying: Message<boolean>,
    collector: InteractionCollector<ButtonInteraction<"cached">>
  ): Promise<any> {
    if (!player) {
      collector.stop();
    }
    if (player.queue.previous.length == 0)
      return await new ReplyInteractionService(
        client,
        message,
        `${client.i18n.get(language, "music", "previous_notfound")}`
      );

    await player.queue.unshift(player.queue.previous[0]);
    await player.skip();

    await new ReplyInteractionService(
      client,
      message,
      `${client.i18n.get(language, "music", "previous_msg")}`
    );
    return;
  }
}
