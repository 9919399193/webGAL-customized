/**
 * @file 引擎初始化时会执行的脚本，包括获取游戏信息，初始化运行时变量，初始化用户数据存储
 */
import { logger } from './util/logger';
import { infoFetcher } from './util/coreInitialFunction/infoFetcher';
import { assetSetter, fileType } from './util/gameAssetsAccess/assetSetter';
import { sceneFetcher } from './controller/scene/sceneFetcher';
import { sceneParser } from './parser/sceneParser';
import { bindExtraFunc } from '@/Core/util/coreInitialFunction/bindExtraFunc';
import { webSocketFunc } from '@/Core/util/syncWithEditor/webSocketFunc';
import { webgalStore } from '@/store/store';
import { stageActions } from '@/store/stageReducer';
import uniqWith from 'lodash/uniqWith';
import { scenePrefetcher } from './util/prefetcher/scenePrefetcher';
import PixiStage from '@/Core/controller/stage/pixi/PixiController';
import axios from 'axios';
import { __INFO } from '@/config/info';
import { WebGAL } from '@/Core/WebGAL';

const u = navigator.userAgent;
export const isIOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); // 判断是否是 iOS终端

/**
 * 引擎初始化函数
 */
export const initializeScript = async (): Promise<void> => {
  // 打印初始log信息
  logger.info(`WebGAL v${__INFO.version}`);
  logger.info('Github: https://github.com/OpenWebGAL/WebGAL ');
  logger.info('Made with ❤ by OpenWebGAL');
  
  if (isIOS) {
    alert(
      `iOS 用户请横屏使用以获得最佳体验
| Please use landscape mode on iOS for the best experience
| iOS ユーザーは横画面での使用をお勧めします`,
    );
  }

  // 初始化基本设置
  loadStyle('./game/userStyleSheet.css');
  getUserAnimation();
  infoFetcher('./game/config.txt');

  try {
    // 加载帮助内容
    const response = await axios.get('./game/notes/notes.json');
    if (!response.data || !response.data.title || !response.data.content) {
      throw new Error('Help content is missing required fields');
    }
    
    logger.info('成功加载帮助内容:', response.data);
    webgalStore.dispatch(stageActions.setStage({ 
      key: 'textPageContent', 
      value: response.data 
    }));
  } catch (error) {
    logger.error(`加载帮助内容失败：${error}`);
    webgalStore.dispatch(stageActions.setStage({ 
      key: 'textPageContent', 
      value: {
        title: 'WebGAL 帮助',
        content: '帮助内容加载失败，请检查 game/notes/notes.json 文件。'
      }
    }));
  }

  // 初始化游戏场景
  const sceneUrl = assetSetter('start.txt', fileType.scene);
  const rawScene = await sceneFetcher(sceneUrl);
  WebGAL.sceneManager.sceneData.currentScene = sceneParser(rawScene, 'start.txt', sceneUrl);
  
  // 场景预加载
  const subSceneList = WebGAL.sceneManager.sceneData.currentScene.subSceneList;
  WebGAL.sceneManager.settledScenes.push(sceneUrl);
  const subSceneListUniq = uniqWith(subSceneList);
  scenePrefetcher(subSceneListUniq);
  WebGAL.gameplay.pixiStage = new PixiStage();

  /**
   * iOS 设备 卸载所有 Service Worker
   */
  // if ('serviceWorker' in navigator && isIOS) {
  //   navigator.serviceWorker.getRegistrations().then((registrations) => {
  //     for (const registration of registrations) {
  //       registration.unregister().then(() => {
  //         logger.info('已卸载 Service Worker');
  //       });
  //     }
  //   });
  // }

  /**
   * 绑定工具函数
   */
  bindExtraFunc();
  webSocketFunc();
};

function loadStyle(url: string) {
  const link = document.createElement('link');
  link.type = 'text/css';
  link.rel = 'stylesheet';
  link.href = url;
  const head = document.getElementsByTagName('head')[0];
  head.appendChild(link);
}

function getUserAnimation() {
  axios.get('./game/animation/animationTable.json').then((res) => {
    const animations: Array<string> = res.data;
    for (const animationName of animations) {
      axios.get(`./game/animation/${animationName}.json`).then((res) => {
        if (res.data) {
          const userAnimation = {
            name: animationName,
            effects: res.data,
          };
          WebGAL.animationManager.addAnimation(userAnimation);
        }
      });
    }
  });
}
