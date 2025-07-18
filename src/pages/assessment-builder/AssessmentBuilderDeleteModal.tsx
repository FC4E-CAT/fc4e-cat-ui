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
    <div className={styles["delete-modal-overlay"]} onClick={onCancel}>
      <div
        className={styles["delete-modal-content"]}
        onClick={(e) => e.stopPropagation()}
      >
        <h4 className={styles["delete-modal-title"]}>
          Remove {itemType.charAt(0).toUpperCase() + itemType.slice(1)}
        </h4>
        <p className={styles["delete-modal-message"]}>
          Are you sure you want to remove the {itemType}{" "}
          <strong>{itemName}</strong> from the assessment?
        </p>
        <div className={styles["delete-modal-actions"]}>
          <button
            className={styles["delete-modal-cancel-btn"]}
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            className={styles["delete-modal-remove-btn"]}
            onClick={onConfirm}
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}

export default AssessmentBuilderDeleteModal;
