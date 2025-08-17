import { initState, resetStageState, setStage } from '@/store/stageReducer';
import { webgalStore } from '@/store/store';
import cloneDeep from 'lodash/cloneDeep';
import { WebGAL } from '@/Core/WebGAL';
import { PRESERVE_STAGE_KEYS } from '@/Core/constants';

export const resetStage = (resetBacklog: boolean, resetSceneAndVar = true) => {
  /**
   * 清空运行时
   */
  if (resetBacklog) {
    WebGAL.backlogManager.makeBacklogEmpty();
  }
  // 清空sceneData，并重新获取
  if (resetSceneAndVar) {
    WebGAL.sceneManager.resetScene();
  }

  // 清空所有演出和timeOut
  WebGAL.gameplay.performController.removeAllPerform();
  WebGAL.gameplay.resetGamePlay();

  // 清空舞台状态表，但保留特定的状态
  const currentState = webgalStore.getState().stage;
  const initSceneDataCopy = cloneDeep(initState);
  
  // 重置状态
  webgalStore.dispatch(resetStageState(initSceneDataCopy));

  // 恢复需要保留的状态
  if (!resetSceneAndVar) {
    // 在不重置场景和变量的情况下，恢复游戏变量
    webgalStore.dispatch(setStage({ 
      key: PRESERVE_STAGE_KEYS.GAME_VAR, 
      value: currentState[PRESERVE_STAGE_KEYS.GAME_VAR] 
    }));
  }

  // 始终保持帮助内容
  webgalStore.dispatch(setStage({ 
    key: PRESERVE_STAGE_KEYS.TEXT_PAGE, 
    value: currentState[PRESERVE_STAGE_KEYS.TEXT_PAGE] 
  }));
};
