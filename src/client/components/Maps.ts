import { LitElement, css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { GameMapType } from "../../core/game/Game";
import { terrainMapFileLoader } from "../TerrainMapFileLoader";
import { translateText } from "../Utils";

// Add map descriptions
export const MapDescription: Record<keyof typeof GameMapType, string> = {
  World: "World",
  GiantWorldMap: "Giant World Map",
  Europe: "Europe",
  EuropeClassic: "Europe Classic",
  Mena: "MENA",
  NorthAmerica: "North America",
  Oceania: "Oceania",
  BlackSea: "Black Sea",
  Africa: "Africa",
  Pangaea: "Pangaea",
  Asia: "Asia",
  Mars: "Mars",
  SouthAmerica: "South America",
  Britannia: "Britannia",
  GatewayToTheAtlantic: "Gateway to the Atlantic",
  Australia: "Australia",
  Iceland: "Iceland",
  EastAsia: "East Asia",
  BetweenTwoSeas: "Between Two Seas",
  FaroeIslands: "Faroe Islands",
  DeglaciatedAntarctica: "Deglaciated Antarctica",
  FalklandIslands: "Falkland Islands",
  Baikal: "Baikal",
  Halkidiki: "Halkidiki",
  StraitOfGibraltar: "Strait of Gibraltar",
  Italia: "Italia",
  Japan: "Japan",
  Yenisei: "Yenisei",
  Pluto: "Pluto",
  Montreal: "Montreal",
};

@customElement("map-display")
export class MapDisplay extends LitElement {
  @property({ type: String }) mapKey = "";
  @property({ type: Boolean }) selected = false;
  @property({ type: String }) translation: string = "";
  @state() private mapWebpPath: string | null = null;
  @state() private mapName: string | null = null;
  @state() private isLoading = true;

  static styles = css`
    .option-card {
      width: 100%;
      min-width: 100px;
      max-width: 120px;
      padding: 8px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;
      background: linear-gradient(180deg, #1a1f2e 0%, #0a0e14 100%);
      border: 2px solid #3d4556;
      border-radius: 0;
      cursor: pointer;
      transition: all 0.2s ease-in-out;
      position: relative;
      overflow: visible;
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.03);
    }

    /* 90-degree corner accents */
    .option-card::before {
      content: "";
      position: absolute;
      top: -2px;
      left: -2px;
      width: 14px;
      height: 14px;
      border-style: solid;
      border-color: #3d4556;
      border-width: 2px 0 0 2px;
      transition: all 0.2s ease-in-out;
      opacity: 0.5;
      pointer-events: none;
    }

    .option-card::after {
      content: "";
      position: absolute;
      bottom: -2px;
      right: -2px;
      width: 14px;
      height: 14px;
      border-style: solid;
      border-color: #3d4556;
      border-width: 0 2px 2px 0;
      transition: all 0.2s ease-in-out;
      opacity: 0.5;
      pointer-events: none;
    }

    .option-card:hover {
      transform: translateY(-2px);
      border-color: #4a9d4a;
      background: linear-gradient(180deg, #252b3b 0%, #1a1f2e 100%);
      box-shadow:
        0 3px 8px rgba(0, 0, 0, 0.6),
        0 0 12px rgba(74, 157, 74, 0.3);
    }

    .option-card:hover::before,
    .option-card:hover::after {
      border-color: #4a9d4a;
      opacity: 1;
    }

    .option-card.selected {
      border-color: #5cb85c;
      background: linear-gradient(180deg, #252b3b 0%, #1a1f2e 100%);
      box-shadow:
        0 4px 10px rgba(0, 0, 0, 0.7),
        0 0 16px rgba(74, 157, 74, 0.5);
    }

    .option-card.selected::before,
    .option-card.selected::after {
      border-color: #5cb85c;
      opacity: 1;
      width: 18px;
      height: 18px;
    }

    .option-card-title {
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      color: #9ca3af;
      text-align: center;
      margin: 6px 0 0 0;
      position: relative;
      z-index: 1;
    }

    .option-card.selected .option-card-title {
      color: #5cb85c;
    }

    .option-image {
      width: 100%;
      aspect-ratio: 4/2;
      color: #9ca3af;
      transition: all 0.2s ease-in-out;
      border-radius: 0;
      background-color: #0a0e14;
      border: 1px solid #252b3b;
      font-size: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.5);
    }

    .option-card:hover .option-image {
      border-color: #4a9d4a;
      box-shadow:
        inset 0 2px 4px rgba(0, 0, 0, 0.5),
        0 0 8px rgba(74, 157, 74, 0.2);
    }

    .option-card.selected .option-image {
      border-color: #5cb85c;
      box-shadow:
        inset 0 2px 4px rgba(0, 0, 0, 0.5),
        0 0 12px rgba(74, 157, 74, 0.4);
    }

    .option-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      filter: brightness(0.8) contrast(1.1);
      transition: all 0.2s ease-in-out;
    }

    .option-card:hover .option-image img {
      filter: brightness(1) contrast(1.2);
      transform: scale(1.05);
    }

    .option-card.selected .option-image img {
      filter: brightness(1.1) contrast(1.2);
    }
  `;

  connectedCallback() {
    super.connectedCallback();
    this.loadMapData();
  }

  private async loadMapData() {
    if (!this.mapKey) return;

    try {
      this.isLoading = true;
      const mapValue = GameMapType[this.mapKey as keyof typeof GameMapType];
      const data = terrainMapFileLoader.getMapData(mapValue);
      this.mapWebpPath = await data.webpPath();
      this.mapName = (await data.manifest()).name;
    } catch (error) {
      console.error("Failed to load map data:", error);
    } finally {
      this.isLoading = false;
    }
  }

  render() {
    return html`
      <div class="option-card ${this.selected ? "selected" : ""}">
        ${this.isLoading
          ? html`<div class="option-image">
              ${translateText("map_component.loading")}
            </div>`
          : this.mapWebpPath
            ? html`<img
                src="${this.mapWebpPath}"
                alt="${this.mapKey}"
                class="option-image"
              />`
            : html`<div class="option-image">Error</div>`}
        <div class="option-card-title">${this.translation || this.mapName}</div>
      </div>
    `;
  }
}
