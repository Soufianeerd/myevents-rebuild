import Image from 'next/image';
import type { InvitationDemo } from '@/lib/invitations/demos';
import styles from './invitation.module.css';

export function InvitationCover({
  demo,
  eager = false,
}: {
  demo: InvitationDemo;
  eager?: boolean;
}) {
  return (
    <div className={`${styles.cover} ${styles[demo.theme]}`}>
      <div className={styles.photo}>
        <Image
          src={demo.image}
          alt=""
          fill
          sizes="(max-width: 700px) 85vw, 420px"
          loading={eager ? 'eager' : 'lazy'}
        />
      </div>
      <div className={styles.words}>
        <span className={styles.overline}>{demo.overline}</span>
        <p className={styles.names}>{demo.names}</p>
        <span className={styles.rule} aria-hidden="true" />
        <p className={styles.date}>{demo.date}</p>
        <p className={styles.place}>{demo.location}</p>
        <span className={styles.signature}>Avec vous, surtout.</span>
      </div>
    </div>
  );
}
