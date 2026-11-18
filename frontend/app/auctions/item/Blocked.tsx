import Link from "next/link";
import loginStyles from "../../login/page.module.css";
import styles from "./itemForm.module.css";

export default function Blocked({
	title,
	text,
	actions
}: {
	title: string;
	text?: string;
	actions: { href: string; label: string; primary?: boolean }[];
}) {
	return (
		<div className={styles.blocked} role="status">
			<p className={styles.blockedTitle}>{title}</p>
			{text && <p className={styles.blockedText}>{text}</p>}
			<div className={styles.blockedActions}>
				{actions.map((a) => (
					<Link
						key={a.href + a.label}
						href={a.href}
						className={`${loginStyles.btn} ${a.primary ? loginStyles.btnPrimary : loginStyles.btnGhost}`}
					>
						{a.label}
					</Link>
				))}
			</div>
		</div>
	);
}
