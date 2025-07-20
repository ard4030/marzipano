// components/InfoHotspot.jsx
import styles from "./editimage.module.css";

const InfoHotspot = ({ title, text, onChange, onDelete }) => {
  return (
    <div className={styles.infoHotspot}>
      <div className={styles.infoBox}>
        <input
          placeholder="title"
          value={title}
          onChange={(e) => onChange("title", e.target.value)}
          className={styles.title}
        />
        <input
          placeholder="text"
          value={text}
          onChange={(e) => onChange("text", e.target.value)}
          className={styles.text}
        />
        <button className={styles.deleteBtn} onClick={onDelete}>🗑</button>
        <button className={styles.info}>⠿</button>
      </div>
    </div>
  );
};

export default InfoHotspot;
