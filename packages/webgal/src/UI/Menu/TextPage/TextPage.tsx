import styles from './textPage.module.scss';
import { FC } from 'react';
import useTrans from '@/hooks/useTrans';

/**
 * 文本页面组件
 * @constructor
 */
export const TextPage: FC = () => {
  const t = useTrans('menu.');

  return (
    <div className={styles.TextPage_main}>
      <div className={styles.TextPage_content}>
        <h1>文本页面</h1>
        <div className={styles.TextPage_text}>
          这里是文本内容。您可以在这里添加任何想要显示的文本信息。
        </div>
      </div>
    </div>
  );
};
