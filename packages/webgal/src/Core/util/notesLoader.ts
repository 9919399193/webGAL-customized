import axios from 'axios';
import { logger } from '../util/logger';
import { webgalStore } from '@/store/store';
import { setStage } from '@/store/stageReducer';

/**
 * 从场景URL中提取文件名
 * @param sceneUrl 场景文件路径
 * @returns 文件名（不含扩展名）
 */
const getSceneFileName = (sceneUrl: string): string => {
  // 移除查询参数
  const urlWithoutQuery = sceneUrl.split('?')[0];
  // 获取路径最后一段
  const fileName = urlWithoutQuery.split('/').pop() || '';
  // 移除扩展名
  return fileName.replace(/\.[^.]+$/, '');
};

/**
 * 加载场景对应的备忘录内容
 * @param sceneUrl 场景文件路径，将使用其文件名作为notes文件名
 */
export const loadNotes = async (sceneUrl: string) => {
  try {
    if (!sceneUrl) {
      webgalStore.dispatch(setStage({ 
        key: 'textPageContent', 
        value: {
          title: '',
          content: ''
        }
      }));
      return;
    }

    // 使用场景文件名作为notes文件名
    const sceneFileName = getSceneFileName(sceneUrl);
    const notesPath = `./game/notes/${sceneFileName}.json`;
    
    const response = await axios.get(notesPath);
    if (!response.data || !response.data.title || !response.data.content) {
      throw new Error('Notes content is missing required fields');
    }
    
    logger.info('成功加载备忘录内容:', response.data);
    webgalStore.dispatch(setStage({ 
      key: 'textPageContent', 
      value: response.data 
    }));
  } catch (error) {
    logger.error(`加载备忘录内容失败：${error}`);
    // 加载失败时显示空白页面
    webgalStore.dispatch(setStage({ 
      key: 'textPageContent', 
      value: {
        title: '',
        content: ''
      }
    }));
  }
};
