import styles from './Header.module.css';
import amdLogo from '../../assets/amd-logo.svg';
import rocmLogo from '../../assets/rocm-logo.svg';

export default function Header({ theme }) {
  return (
    <header className={styles.header} data-tour="header" data-theme-local={theme}>
      <div className={styles.inner}>
        <div className={styles.logos}>
          <img src={amdLogo} alt="AMD" className={styles.amdLogo} />
          <span className={styles.divider} />
          <img src={rocmLogo} alt="ROCm" className={styles.rocmLogo} />
        </div>

        <div className={styles.pill}>
          <span className={styles.pillDot} />
          ROCm Assistant&nbsp;&nbsp;·&nbsp;&nbsp;ROCm Platform&nbsp;&nbsp;·&nbsp;&nbsp;AMD MI300X
        </div>

        <div className={styles.badge}>
          <span className={styles.badgeDot} />
          Live Demo
        </div>
      </div>
    </header>
  );
}
