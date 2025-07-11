import styles from "./AssessmentBuilder.module.css";

interface AssessmentBuilderDeleteModalProps {
  isOpen: boolean;
  itemName: string;
  itemType?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

function AssessmentBuilderDeleteModal({
  isOpen,
  itemName,
  itemType = "item",
  onConfirm,
  onCancel,
}: AssessmentBuilderDeleteModalProps) {
  if (!isOpen) return null;

  return (
    <div className={styles.deleteModalOverlay} onClick={onCancel}>
      <div
        className={styles.deleteModalContent}
        onClick={(e) => e.stopPropagation()}
      >
        <h4 className={styles.deleteModalTitle}>
          Remove {itemType.charAt(0).toUpperCase() + itemType.slice(1)}
        </h4>
        <p className={styles.deleteModalMessage}>
          Are you sure you want to remove the {itemType}{" "}
          <strong>{itemName}</strong> from the assessment?
        </p>
        <div className={styles.deleteModalActions}>
          <button className={styles.deleteModalCancelBtn} onClick={onCancel}>
            Cancel
          </button>
          <button className={styles.deleteModalRemoveBtn} onClick={onConfirm}>
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}

export default AssessmentBuilderDeleteModal;
