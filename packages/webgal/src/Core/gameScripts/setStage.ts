import { ISentence } from '@/Core/controller/scene/sceneInterface';
import { IPerform } from '@/Core/Modules/perform/performInterface';
import { webgalStore } from '@/store/store';
import { setStage as setStageAction } from '@/store/stageReducer';
import { logger } from '@/Core/util/logger';
import { IStageState } from '@/store/stageInterface';

/**
 * 设置舞台状态
 * @param sentence 语句
 */
export const setStage = (sentence: ISentence): IPerform => {
  try {
    // 找到要设置的键
    const key = sentence.commandRaw as keyof IStageState;

    // 获取内容值
    let value: any = sentence.content;
    logger.debug(`设置舞台状态，key: ${key}, raw content: `, value);

    // 如果内容是字符串，尝试解析JSON
    let jsonValue;
    try {
      // 如果内容是字符串，尝试解析JSON
      if (typeof value === 'string' && value.trim().startsWith('{')) {
        jsonValue = JSON.parse(value);
      } else {
        jsonValue = value;
      }

      // 如果是textPageContent，验证格式
      if (key === 'textPageContent') {
        if (typeof jsonValue === 'object' && jsonValue !== null && 
            typeof jsonValue.title === 'string' && typeof jsonValue.content === 'string') {
          // 格式正确，不需要处理
        } else {
          logger.error('textPageContent格式错误，应为{title: string, content: string}');
          jsonValue = {title: '', content: ''};
        }
      }
    } catch (e) {
      logger.error(`JSON解析错误：${e}，原始值：${value}`);
      jsonValue = value; // 如果不是JSON就用原始值
    }

    // 设置舞台状态
    webgalStore.dispatch(setStageAction({ key, value: jsonValue }));
    logger.debug('设置舞台状态后store中的值：', { key, value: webgalStore.getState().stage[key] });
  } catch (error) {
    logger.error('设置舞台状态失败：', error);
  }

  return {
    performName: 'none',
    duration: 0,
    isHoldOn: false,
    stopFunction: () => {},
    blockingNext: () => false,
    blockingAuto: () => true,
    stopTimeout: undefined,
  };
};
