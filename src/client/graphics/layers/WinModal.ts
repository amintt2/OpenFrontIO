import { LitElement, TemplateResult, html } from "lit";
import { customElement, query, state } from "lit/decorators.js";
import { isInIframe, translateText } from "../../../client/Utils";
import { ColorPalette, Pattern } from "../../../core/CosmeticSchemas";
import { EventBus } from "../../../core/EventBus";
import { GameUpdateType } from "../../../core/game/GameUpdates";
import { GameView } from "../../../core/game/GameView";
import "../../components/PatternButton";
import {
  fetchCosmetics,
  handlePurchase,
  patternRelationship,
} from "../../Cosmetics";
import { getUserMe } from "../../jwt";
import { SendWinnerEvent } from "../../Transport";
import { Layer } from "./Layer";

import "../../components/baseComponents/Modal";

@customElement("win-modal")
export class WinModal extends LitElement implements Layer {
  @query("o-modal") private modalEl!: HTMLElement & {
    open: () => void;
    close: () => void;
  };

  public game: GameView;
  public eventBus: EventBus;

  private hasShownDeathModal = false;

  @state()
  isVisible = false;

  @state()
  showButtons = false;

  @state()
  private isWin = false;

  @state()
  private patternContent: TemplateResult | null = null;

  private _title: string;

  private rand = Math.random();

  // Override to prevent shadow DOM creation
  createRenderRoot() {
    return this;
  }

  constructor() {
    super();
  }

  render() {
    if (!this.isVisible) return html``;
    return html`
      <o-modal title="${this._title || ""}">
        <div class="v-stack" style="gap: 12px;">
          ${this.innerHtml()}
          <div class="${this.showButtons ? "h-stack between" : "hidden"}">
            <button
              class="c-button c-button--secondary c-button--block"
              @click=${this._handleExit}
            >
              ${translateText("win_modal.exit")}
            </button>
            <button
              class="c-button c-button--secondary c-button--block"
              @click=${this.hide}
            >
              ${this.isWin
                ? translateText("win_modal.keep")
                : translateText("win_modal.spectate")}
            </button>
          </div>
        </div>
      </o-modal>
    `;
  }

  innerHtml() {
    if (isInIframe() || this.rand < 0.25) {
      return this.steamWishlist();
    }
    return this.renderPatternButton();
  }

  renderPatternButton() {
    return html`
      <div class="text-center mb-6 bg-black/30 p-2.5 rounded">
        <h3 class="text-xl font-semibold text-white mb-3">
          ${translateText("win_modal.support_openfront")}
        </h3>
        <p class="text-white mb-3">
          ${translateText("win_modal.territory_pattern")}
        </p>
        <div class="flex justify-center">${this.patternContent}</div>
      </div>
    `;
  }

  async loadPatternContent() {
    const me = await getUserMe();
    const patterns = await fetchCosmetics();

    const purchasablePatterns: {
      pattern: Pattern;
      colorPalette: ColorPalette;
    }[] = [];

    for (const pattern of Object.values(patterns?.patterns ?? {})) {
      for (const colorPalette of pattern.colorPalettes ?? []) {
        if (
          patternRelationship(
            pattern,
            colorPalette,
            me !== false ? me : null,
            null,
          ) === "purchasable"
        ) {
          const palette = patterns?.colorPalettes?.[colorPalette.name];
          if (palette) {
            purchasablePatterns.push({
              pattern,
              colorPalette: palette,
            });
          }
        }
      }
    }

    if (purchasablePatterns.length === 0) {
      this.patternContent = html``;
      return;
    }

    // Shuffle the array and take patterns based on screen size
    const shuffled = [...purchasablePatterns].sort(() => Math.random() - 0.5);
    const isMobile = window.innerWidth < 768; // md breakpoint
    const maxPatterns = isMobile ? 1 : 3;
    const selectedPatterns = shuffled.slice(
      0,
      Math.min(maxPatterns, shuffled.length),
    );

    this.patternContent = html`
      <div class="flex gap-4 flex-wrap justify-start">
        ${selectedPatterns.map(
          ({ pattern, colorPalette }) => html`
            <pattern-button
              .pattern=${pattern}
              .colorPalette=${colorPalette}
              .requiresPurchase=${true}
              .onSelect=${(p: Pattern | null) => {}}
              .onPurchase=${(p: Pattern, colorPalette: ColorPalette | null) =>
                handlePurchase(p, colorPalette)}
            ></pattern-button>
          `,
        )}
      </div>
    `;
  }

  steamWishlist(): TemplateResult {
    return html`<p class="m-0 mb-5 text-center bg-black/30 p-2.5 rounded">
      <a
        href="https://store.steampowered.com/app/3560670"
        target="_blank"
        rel="noopener noreferrer"
        class="text-[#4a9eff] underline font-medium transition-colors duration-200 text-2xl hover:text-[#6db3ff]"
      >
        ${translateText("win_modal.wishlist")}
      </a>
    </p>`;
  }

  async show() {
    await this.loadPatternContent();
    this.isVisible = true;
    this.requestUpdate();
    this.modalEl?.open();
    setTimeout(() => {
      this.showButtons = true;
      this.requestUpdate();
    }, 3000);
  }

  hide() {
    this.isVisible = false;
    this.showButtons = false;
    this.modalEl?.close();
    this.requestUpdate();
  }

  private _handleExit() {
    this.hide();
    window.location.href = "/";
  }

  init() {}

  tick() {
    const myPlayer = this.game.myPlayer();
    if (
      !this.hasShownDeathModal &&
      myPlayer &&
      !myPlayer.isAlive() &&
      !this.game.inSpawnPhase() &&
      myPlayer.hasSpawned()
    ) {
      this.hasShownDeathModal = true;
      this._title = translateText("win_modal.died");
      this.show();
    }
    const updates = this.game.updatesSinceLastTick();
    const winUpdates = updates !== null ? updates[GameUpdateType.Win] : [];
    winUpdates.forEach((wu) => {
      if (wu.winner === undefined) {
        // ...
      } else if (wu.winner[0] === "team") {
        this.eventBus.emit(new SendWinnerEvent(wu.winner, wu.allPlayersStats));
        if (wu.winner[1] === this.game.myPlayer()?.team()) {
          this._title = translateText("win_modal.your_team");
          this.isWin = true;
        } else {
          this._title = translateText("win_modal.other_team", {
            team: wu.winner[1],
          });
          this.isWin = false;
        }
        this.show();
      } else {
        const winner = this.game.playerByClientID(wu.winner[1]);
        if (!winner?.isPlayer()) return;
        const winnerClient = winner.clientID();
        if (winnerClient !== null) {
          this.eventBus.emit(
            new SendWinnerEvent(["player", winnerClient], wu.allPlayersStats),
          );
        }
        if (
          winnerClient !== null &&
          winnerClient === this.game.myPlayer()?.clientID()
        ) {
          this._title = translateText("win_modal.you_won");
          this.isWin = true;
        } else {
          this._title = translateText("win_modal.other_won", {
            player: winner.name(),
          });
          this.isWin = false;
        }
        this.show();
      }
    });
  }

  renderLayer(/* context: CanvasRenderingContext2D */) {}

  shouldTransform(): boolean {
    return false;
  }
}
