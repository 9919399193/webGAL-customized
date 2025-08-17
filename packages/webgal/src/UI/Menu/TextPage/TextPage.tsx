import styles from './textPage.module.scss';
import { FC } from 'react';
import useTrans from '@/hooks/useTrans';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';

/**
 * 文本页面组件
 * @constructor
 */
export const TextPage: FC = () => {
  const t = useTrans('menu.');
  const stageState = useSelector((state: RootState) => state.stage);
  const textPageContent = stageState.textPageContent || {
    title: t('textPage.defaultTitle'),
    content: t('textPage.defaultContent')
  };

  return (
    <div className={styles.TextPage_main}>
      <div className={styles.TextPage_content}>
        <h1 style={{ fontSize: '1.5em', marginBottom: '0.5em' }}>{textPageContent.title}</h1>
        <div className={styles.TextPage_text}>
          {textPageContent.content.split('\n').map((line, index) => (
            <p key={index} style={{ margin: '0.5em 0' }}>{line}</p>
          ))}
        </div>
      </div>
    </div>
  );
};
