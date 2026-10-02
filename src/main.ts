import Phaser from 'phaser';
import '@fontsource/vt323/latin.css';
import '@fontsource/vt323/latin-ext.css';
import '@fontsource/pirata-one/latin.css';
import '@fontsource/pirata-one/latin-ext.css';
import './style.css';
import { W, H, RES } from './config';
import { BootScene } from './scenes/Boot';
import { LoginScene } from './scenes/Login';
import { AvatarScene } from './scenes/Avatar';
import { MenuScene } from './scenes/Menu';
import { MapScene } from './scenes/MapScene';
import { CombatScene } from './scenes/Combat';
import { RewardScene } from './scenes/Reward';
import { RuneScene } from './scenes/Rune';
import { CampfireScene } from './scenes/Campfire';
import { EndScene } from './scenes/End';
import { HelpScene } from './scenes/Help';
import { EventScene } from './scenes/Event';
import { ShopScene } from './scenes/Shop';
import { OverlayScene } from './scenes/Overlay';
import { Game } from './state';

const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  // Se dibuja al doble de resolución; cada escena usa coordenadas de 960×540
  width: W * RES,
  height: H * RES,
  backgroundColor: '#060508',
  pixelArt: true,
  roundPixels: true,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    fullscreenTarget: 'game',
  },
  input: { mouse: { preventDefaultWheel: false } },
  disableContextMenu: true,
  scene: [BootScene, LoginScene, AvatarScene, MenuScene, MapScene, CombatScene, RewardScene, RuneScene,
    CampfireScene, EndScene, HelpScene, EventScene, ShopScene, OverlayScene],
});

// Cámara de cada escena: zoom ×RES desde la esquina superior izquierda
game.events.once(Phaser.Core.Events.READY, () => {
  for (const sc of game.scene.scenes) {
    sc.sys.events.on(Phaser.Scenes.Events.CREATE, () => {
      sc.cameras.main.setOrigin(0, 0).setZoom(RES);
      sc.input.enabled = true;
    });
  }
});

// acceso de depuración sólo en modo desarrollo (npm run dev)
if (import.meta.env.DEV) (window as any).__criptas = { game, Game };
