// components/LinkHotspot.jsx
import styles from "./editimage.module.css";

const LinkHotspot = ({ target, images, onChange, onDelete }) => {
  return (
    <div className={styles.linkHotspot}>
      <div className={styles.linkBox}>
        <input
          placeholder="target name"
          value={target}
          onChange={(e) => onChange(e.target.value)}
          className={styles.target}
        />
        <select
          className={`mtselect ${styles.targetSelect}`}
          value={target}
          onChange={(e) => onChange(e.target.value)}
        >
          {images.map((item) => (
            <option key={item.name} value={item.name}>
              {item.name}
            </option>
          ))}
        </select>
        <button className={styles.deleteBtn} onClick={onDelete}>🗑</button>
        <button className={styles.linkIcon}>🔗</button>
      </div>
    </div>
  );
};

export default LinkHotspot;
