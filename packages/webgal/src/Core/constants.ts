export const STAGE_KEYS = {
  BGMAIN: 'bg-main',
  FIG_C: 'fig-center',
  FIG_L: 'fig-left',
  FIG_R: 'fig-right',
};

/**
 * 这些状态键在状态重置和场景切换时会被保留
 */
export const PRESERVE_STAGE_KEYS = {
  GAME_VAR: 'GameVar',         // 游戏变量
  TEXT_PAGE: 'textPageContent' // 帮助页面内容
} as const;

export const WEBGAL_NONE = 'none';
