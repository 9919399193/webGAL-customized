import { sceneFetcher } from './sceneFetcher';
import { sceneParser } from '../../parser/sceneParser';
import { logger } from '../../util/logger';
import { nextSentence } from '@/Core/controller/gamePlay/nextSentence';
import uniqWith from 'lodash/uniqWith';
import { scenePrefetcher } from '@/Core/util/prefetcher/scenePrefetcher';
import { loadNotes } from '@/Core/util/notesLoader';

import { WebGAL } from '@/Core/WebGAL';

/**
 * 切换场景
 * @param sceneUrl 场景路径
 * @param sceneName 场景名称
 */
export const changeScene = async (sceneUrl: string, sceneName: string) => {
  if (WebGAL.sceneManager.lockSceneWrite) {
    return;
  }
  WebGAL.sceneManager.lockSceneWrite = true;

  try {
    // 场景写入到运行时
    const rawScene = await sceneFetcher(sceneUrl);
    
    WebGAL.sceneManager.sceneData.currentScene = sceneParser(rawScene, sceneName, sceneUrl);
    WebGAL.sceneManager.sceneData.currentSentenceId = 0;
    
    // 开始场景的预加载
    const subSceneList = WebGAL.sceneManager.sceneData.currentScene.subSceneList;
    WebGAL.sceneManager.settledScenes.push(sceneUrl); // 放入已加载场景列表，避免递归加载相同场景
    const subSceneListUniq = uniqWith(subSceneList); // 去重
    scenePrefetcher(subSceneListUniq);

    // 加载当前场景的notes
    await loadNotes(sceneUrl);

    logger.debug('现在切换场景，切换后的结果：', WebGAL.sceneManager.sceneData);
  } catch (e) {
    logger.error('场景调用错误', e);
  } finally {
    WebGAL.sceneManager.lockSceneWrite = false;
    nextSentence();
  }
};
