import {
  Client,
  GatewayIntentBits,
  Collection,
  ColorResolvable,
  ActionRowBuilder,
  ButtonBuilder,
  Message,
} from "discord.js";
import BotLogs from "./events/client/GuildCreateDeleteEvent.js";
import TopGGPoster from "./events/client/topgg.js";
import { DatabaseService } from "./database/index.js";
import { I18n } from "mewwme-localpride";
import { resolve } from "path";
import { LavalinkDataType, LavalinkUsingDataType } from "./@types/Lavalink.js";
import { ConfigDataService } from "./services/ConfigDataService.js";
import { LoggerService } from "./services/LoggerService.js";
import { ClusterClient, getInfo } from "discord-hybrid-sharding";
import { Mewwme, MewwmePlayer } from "mewwme.player";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { WebServer } from "./webserver/index.js";
import WebSocket from "ws";
import { Metadata } from "./@types/Metadata.js";
import { ManifestService } from "./services/ManifestService.js";
import { PrefixCommand, SlashCommand } from "./@types/Command.js";
import { Config } from "./@types/Config.js";
import { IconType } from "./@types/Emoji.js";
import { NormalModeIcons } from "./assets/normalMode.js";
import { SafeModeIcons } from "./assets/safeMode.js";
import { config } from "dotenv";
import { DatabaseTable } from "./database/@types.js";
import { initHandler } from "./handlers/index.js";
import { MewwmeInit } from "./structures/Mewwme.js";
import utils from "node:util";
import { RequestInterface } from "./webserver/RequestInterface.js";
import { DeployService } from "./services/DeployService.js";
import { PlayerButton } from "./@types/Button.js";
import Import from "./commands/prefix/Playlist/Import.js";
config();

const __dirname = dirname(fileURLToPath(import.meta.url));
const loggerService = new LoggerService().init();
const configData = new ConfigDataService().data;

const REGEX = [
  /(?:https?:\/\/)?(?:www\.)?youtu(?:\.be\/|be.com\/\S*(?:watch|embed)(?:(?:(?=\/[-a-zA-Z0-9_]{11,}(?!\S))\/)|(?:\S*v=|v\/)))([-a-zA-Z0-9_]{11,})/,
  /^.*(youtu.be\/|list=)([^#\&\?]*).*/,
  /^(?:spotify:|https:\/\/[a-z]+\.spotify\.com\/(track\/|user\/(.*)\/playlist\/|playlist\/))(.*)$/,
  /^https?:\/\/(?:www\.)?deezer\.com\/[a-z]+\/(track|album|playlist)\/(\d+)$/,
  /^(?:(https?):\/\/)?(?:(?:www|m)\.)?(soundcloud\.com|snd\.sc)\/(.*)$/,
  /(?:https:\/\/music\.apple\.com\/)(?:.+)?(artist|album|music-video|playlist)\/([\w\-\.]+(\/)+[\w\-\.]+|[^&]+)\/([\w\-\.]+(\/)+[\w\-\.]+|[^&]+)/,
  /^https?:\/\/(?:www\.|secure\.|sp\.)?nicovideo\.jp\/watch\/([a-z]{2}[0-9]+)/,
];

loggerService.info("Booting client...");

export class Manager extends Client {
  // Interface
  token: string;
  metadata: Metadata;
  config: Config;
  logger: any;
  db!: DatabaseTable;
  owner: string[];
  dev: string[];
  color: ColorResolvable;
  i18n: I18n;
  prefix: string;
  isDatabaseConnected: boolean;
  shardStatus: boolean;
  lavalinkList: LavalinkDataType[];
  lavalinkUsing: LavalinkUsingDataType[];
  lavalinkUsed: LavalinkUsingDataType[];
  manager: Mewwme;
  slash: Collection<string, SlashCommand>;
  commands: Collection<string, PrefixCommand>;
  interval: Collection<string, NodeJS.Timer>;
  sentQueue: Collection<string, boolean>;
  nplayingMsg: Collection<string, Message>;
  aliases: Collection<string, string>;
  plButton: Collection<string, PlayerButton>;
  websocket?: WebSocket;
  wsMessage?: Collection<string, RequestInterface>;
  UpdateMusic!: (player: MewwmePlayer) => Promise<void | Message<true>>;
  UpdateQueueMsg!: (player: MewwmePlayer) => Promise<void | Message<true>>;
  enSwitch!: ActionRowBuilder<ButtonBuilder>;
  diSwitch!: ActionRowBuilder<ButtonBuilder>;
  enSwitchMod!: ActionRowBuilder<ButtonBuilder>;
  icons: IconType;
  cluster?: ClusterClient<Client>;
  REGEX: RegExp[];

  // Main class
  constructor() {
    super({
      // shards: getInfo().SHARD_LIST, // An array of shards that will get spawned
      // shardCount: getInfo().TOTAL_SHARDS, // Total number of shards
      shards: process.env.IS_SHARING == "true" ? getInfo().SHARD_LIST : "auto",
      shardCount: process.env.IS_SHARING == "true" ? getInfo().TOTAL_SHARDS : 1,
      allowedMentions: {
        parse: ["roles", "users", "everyone"],
        repliedUser: false,
      },
      intents: configData.features.MESSAGE_CONTENT.enable
        ? [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildVoiceStates,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.MessageContent,
          ]
        : [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildVoiceStates,
            GatewayIntentBits.GuildMessages,
          ],
    });

    // Initial basic bot config
    this.logger = loggerService;
    this.config = configData;
    this.metadata = new ManifestService().data.metadata.bot;
    this.token = this.config.bot.TOKEN;
    this.owner = this.config.bot.OWNER_IDS;
    this.dev = this.config.features.DEV_ID;
    this.color = (this.config.bot.EMBED_COLOR || "#f4e0c7") as ColorResolvable;
    this.i18n = new I18n({
      defaultLocale: this.config.bot.LANGUAGE || "en",
      directory: resolve(join(__dirname, "languages")),
    });
    this.prefix = this.config.features.MESSAGE_CONTENT.commands.prefix || "me";
    this.shardStatus = false;
    this.REGEX = REGEX;

    // Initial autofix lavalink varibles
    this.lavalinkList = [];
    this.lavalinkUsing = [];
    this.lavalinkUsed = [];

    // Ws varible
    this.config.features.WEB_SERVER.websocket.enable
      ? (this.wsMessage = new Collection())
      : undefined;

    // Collections
    this.slash = new Collection();
    this.commands = new Collection();
    this.interval = new Collection();
    this.sentQueue = new Collection();
    this.aliases = new Collection();
    this.nplayingMsg = new Collection();
    this.plButton = new Collection();
    this.isDatabaseConnected = false;

    // Sharing
    this.cluster =
      process.env.IS_SHARING == "true" ? new ClusterClient(this) : undefined;

    // Remove support for musicard, implements doc check at wiki
    this.config.bot.SAFE_PLAYER_MODE = true;

    // Icons setup
    this.config.bot.SAFE_ICONS_MODE = false; // Change this line

    this.icons = this.config.bot.SAFE_ICONS_MODE
      ? SafeModeIcons
      : NormalModeIcons;

    process.on("unhandledRejection", (error) =>
      this.logger.log({ level: "error", message: utils.inspect(error) })
    );
    process.on("uncaughtException", (error) =>
      this.logger.log({ level: "error", message: utils.inspect(error) })
    );

    if (
      this.config.features.WEB_SERVER.websocket.enable &&
      (!this.config.features.WEB_SERVER.websocket.secret ||
        this.config.features.WEB_SERVER.websocket.secret.length == 0)
    ) {
      this.logger.error("Must have secret in your ws config for secure!");
      process.exit();
    }

    this.manager = new MewwmeInit(this).init;

    if (this.config.features.WEB_SERVER.enable) {
      new WebServer(this);
    }
    new DeployService(this);
    new initHandler(this);
    new DatabaseService(this);
    // Call execute after other setup
    const topGGPoster = new TopGGPoster();
    topGGPoster.execute(this);

    const guildCreateDelete = new BotLogs();
    guildCreateDelete.execute(this);
  }

  connect() {
    super.login(this.token);
  }
}
