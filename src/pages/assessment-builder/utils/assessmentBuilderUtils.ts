import { relMtvPrincpleCriterion } from "@/config";
import {
  AssessmentPrinciple,
  AssessmentCriterion,
  CriterionInput,
  PrincipleInput,
  Criterion,
  Metric,
  FormMode,
  Imperative,
} from "@/types";

// Finds a principle in the assessment by its ID
export const findPrincipleInAssessment = (
  principleId: string,
  assessment: AssessmentPrinciple[],
): AssessmentPrinciple | undefined => {
  return assessment.find((p) => p.id === principleId);
};

// Finds a criterion within all principles in the assessment
export const findCriterionInAssessment = (
  criterionId: string,
  assessment: AssessmentPrinciple[],
): { criterion: AssessmentCriterion; principleId: string } | null => {
  for (const principle of assessment) {
    const criterion = principle.criteria?.find((c) => c.id === criterionId);
    if (criterion) {
      return { criterion, principleId: principle.id };
    }
  }
  return null;
};

// Creates a new principle structure
export const createPrincipleStructure = (
  id: string,
  name: string,
  description: string,
): AssessmentPrinciple => ({
  id,
  name,
  description,
  criteria: [],
});

export const createCriterionStructure = (
  id: string,
  name: string,
  description: string,
  imperative: string,
) => ({
  id,
  name,
  description,
  imperative,
  metric: {
    type: "",
    label_algorithm_type: "",
  } as Metric,
});

// Creates an "Untagged" principle for criteria without a selected principle
export const createUntaggedPrinciple = (): AssessmentPrinciple => ({
  id: "untagged",
  name: "",
  description: "",
  criteria: [],
});

// Gets principle information from allPrinciples by pri
export const getPrincipleInfoById = (
  id: string | null,
  allPrinciples: (PrincipleInput & { id: string })[],
): PrincipleInput | undefined => {
  if (!id) return undefined;
  return allPrinciples.find((p) => p?.id === id);
};

// Gets criterion information from allCriteria by cri
export const getCriterionInfoByCri = (
  cri: string,
  allCriteria: Criterion[],
): Criterion | undefined => {
  return allCriteria.find((c) => c.cri === cri);
};

// Gets the principle ID that contains a specific criterion
export const getPrincipleIdForCriterion = (
  criterionId: string,
  assessment: AssessmentPrinciple[],
): string | null => {
  const criterionLocation = findCriterionInAssessment(criterionId, assessment);
  return criterionLocation ? criterionLocation.principleId : null;
};

// Handles selecting an existing criterion from registry
export const handleSelectCriterion = (
  selectedCriterionId: string,
  allCriteria: Criterion[],
  principleTag: string | null,
  allPrinciples: (PrincipleInput & { id: string })[],
  assessment: AssessmentPrinciple[],
  imperatives: Imperative[],
): AssessmentPrinciple[] => {
  const selectedCriterion = getCriterionInfoByCri(
    selectedCriterionId,
    allCriteria,
  );

  if (!selectedCriterion) {
    return assessment; // No criterion found, return unchanged
  }

  const updatedAssessment = [...assessment];

  // Determine target principle
  const targetPrincipleId = principleTag;
  let targetPrinciple = findPrincipleInAssessment(
    targetPrincipleId || "",
    updatedAssessment,
  );

  if (!targetPrinciple) {
    // Create new principle
    if (principleTag && allPrinciples.length > 0) {
      const principleInfo = getPrincipleInfoById(principleTag, allPrinciples);
      targetPrinciple = createPrincipleStructure(
        principleTag,
        principleInfo?.label || principleTag,
        principleInfo?.description || "",
      );
      updatedAssessment.push(targetPrinciple);
    } else {
      // find or create "Untagged" principle
      targetPrinciple = findPrincipleInAssessment(
        "untagged",
        updatedAssessment,
      );
      if (targetPrinciple == null) {
        targetPrinciple = createUntaggedPrinciple();
        updatedAssessment.push(targetPrinciple);
      }
    }
  }

  const imperativeLabel =
    imperatives?.find(
      (imperative) => imperative.id === String(selectedCriterion.imperative),
    )?.label || String(selectedCriterion.imperative);

  // Create and add the criterion
  const newCriterion = createCriterionStructure(
    selectedCriterion.cri,
    selectedCriterion.label,
    selectedCriterion.description || "",
    imperativeLabel,
  );

  if (targetPrinciple) {
    targetPrinciple.criteria = [
      ...(targetPrinciple.criteria || []),
      newCriterion,
    ];
  }

  return updatedAssessment;
};

// Handles creating a new criterion
export const handleNewCriterion = (
  criterionForm: CriterionInput,
  principleTag: string | null,
  allPrinciples: (PrincipleInput & { id: string })[],
  assessment: AssessmentPrinciple[],
  imperatives: Imperative[],
): AssessmentPrinciple[] => {
  if (!criterionForm.cri) {
    return assessment; // Invalid state, return unchanged
  }

  const updatedAssessment = [...assessment];
  const principleInfo = getPrincipleInfoById(principleTag, allPrinciples);
  let targetPrinciple = findPrincipleInAssessment(
    principleInfo?.pri || "",
    updatedAssessment,
  );

  if (!targetPrinciple) {
    // Create new principle
    if (principleTag && allPrinciples.length > 0) {
      if (principleInfo) {
        targetPrinciple = {
          id: principleInfo.pri,
          name: principleInfo.label,
          description: principleInfo.description,
          criteria: [],
        };
      } else {
        // Fallback if principle not found in allPrinciples
        targetPrinciple = createPrincipleStructure(
          principleTag,
          principleTag,
          "",
        );
      }
      updatedAssessment.push(targetPrinciple);
    } else {
      // find or create "Untagged" principle
      targetPrinciple = findPrincipleInAssessment(
        "untagged",
        updatedAssessment,
      );
      if (targetPrinciple == null) {
        targetPrinciple = createUntaggedPrinciple();
        updatedAssessment.push(targetPrinciple);
      }
    }
  }

  criterionForm.imperative =
    imperatives?.find(
      (imperative) => imperative.id === criterionForm.imperative,
    )?.label || "";

  // Create and add the criterion
  const newCriterion = createCriterionStructure(
    criterionForm.cri,
    criterionForm.label || "",
    criterionForm.description || "",
    criterionForm.imperative || "",
  );

  if (targetPrinciple) {
    targetPrinciple.criteria = [
      ...(targetPrinciple.criteria || []),
      newCriterion,
    ];
  }

  return updatedAssessment;
};

export const findPidGraphOfPrinciple = (
  criterionId: string,
  allPrinciples: (PrincipleInput & { id: string })[],
  assessment: AssessmentPrinciple[],
): string | null => {
  // First find which principle contains this criterion in the assessment
  for (const principle of assessment) {
    const criterion = principle.criteria?.find((c) => c.id === criterionId);
    if (criterion) {
      // Now find the corresponding pid_graph from allPrinciples
      const principleInfo = allPrinciples.find((p) => p.pri === principle.id);
      return principleInfo?.id || null;
    }
  }
  return null;
};

export const findCriterionWithPrinciple = (
  criterionId: string,
  assessment: AssessmentPrinciple[],
): {
  criterion: AssessmentCriterion;
  principle: AssessmentPrinciple;
  criterionIndex: number;
  principleIndex: number;
} | null => {
  for (
    let principleIndex = 0;
    principleIndex < assessment.length;
    principleIndex++
  ) {
    const principle = assessment[principleIndex];
    const criterionIndex =
      principle.criteria?.findIndex((c) => c.id === criterionId) ?? -1;
    if (criterionIndex !== -1) {
      const criterion = principle.criteria![criterionIndex];
      return { criterion, principle, criterionIndex, principleIndex };
    }
  }
  return null;
};

// Checks if a criterion is completed with all required entities (principle, metric, tests)
export const isCriterionCompleted = (
  criterionId: string,
  assessment: AssessmentPrinciple[],
): boolean => {
  const criterionInfo = findCriterionWithPrinciple(criterionId, assessment);

  if (!criterionInfo) {
    return false;
  }

  const { criterion, principle } = criterionInfo;
  const hasPrinciple = principle.id && principle.id !== "untagged";

  const hasMetric =
    criterion?.metric &&
    criterion?.metric.id &&
    criterion?.metric.id.trim() !== "";

  const hasTests =
    criterion?.metric?.tests &&
    Array.isArray(criterion?.metric?.tests) &&
    criterion?.metric?.tests?.length > 0;

  if (hasPrinciple && hasMetric && hasTests) {
    return true;
  }
  return false;
};

export const handleEditCriterion = (
  criterionCri: string,
  updatedCriterion: CriterionInput,
  principleTag: string | null,
  allPrinciples: (PrincipleInput & { id: string })[],
  assessment: AssessmentPrinciple[],
): AssessmentPrinciple[] => {
  const updatedAssessment = [...assessment];

  // Find the existing principle and criterion that belongs to in the assessment
  const criterionInfo = findCriterionWithPrinciple(
    criterionCri,
    updatedAssessment,
  );

  if (!criterionInfo) {
    return assessment; // Criterion not found, return unchanged
  }

  const { criterion, criterionIndex, principleIndex } = criterionInfo;

  // Check if this criterion has the same principle as before
  const actualPidGraphOfPrinciple = findPidGraphOfPrinciple(
    criterionCri,
    allPrinciples,
    assessment,
  );

  // Check if the principle is the same with the previous one
  if (actualPidGraphOfPrinciple === principleTag) {
    updatedAssessment[principleIndex].criteria![criterionIndex] = {
      ...criterion,
      id: updatedCriterion.cri,
      name: updatedCriterion.label || "",
      description: updatedCriterion.description || "",
      imperative: updatedCriterion.imperative || "",
    };
  } else {
    updatedAssessment[principleIndex].criteria!.splice(criterionIndex, 1);

    const newCriterion = {
      id: updatedCriterion.cri,
      name: updatedCriterion.label || "",
      description: updatedCriterion.description || "",
      imperative: updatedCriterion.imperative || "",
      metric: criterion.metric, // Preserve existing metric
    };

    // Determine the target principle
    let targetPrinciple: AssessmentPrinciple | undefined;

    if (!principleTag || principleTag === "untagged") {
      targetPrinciple = findPrincipleInAssessment(
        "untagged",
        updatedAssessment,
      );
      if (!targetPrinciple) {
        targetPrinciple = {
          id: "untagged",
          name: "Untagged Criteria",
          description: "Criteria not assigned to any principle",
          criteria: [],
        };
        updatedAssessment.push(targetPrinciple);
      }
    } else {
      const newPrincipleInfo = allPrinciples.find((p) => p.id === principleTag);

      if (newPrincipleInfo) {
        // Check if principle already exists in assessment
        targetPrinciple = findPrincipleInAssessment(
          newPrincipleInfo.pri,
          updatedAssessment,
        );

        if (!targetPrinciple) {
          targetPrinciple = {
            id: newPrincipleInfo.pri,
            name: newPrincipleInfo.label,
            description: newPrincipleInfo.description,
            criteria: [],
          };
          updatedAssessment.push(targetPrinciple);
        }
      }
    }

    if (targetPrinciple) {
      targetPrinciple.criteria = [
        ...(targetPrinciple.criteria || []),
        newCriterion,
      ];
    }

    // Clean up empty principles (except untagged)
    const filteredAssessment = updatedAssessment.filter(
      (p) => p.id === "untagged" || (p.criteria && p.criteria.length > 0),
    );

    return filteredAssessment;
  }

  return updatedAssessment;
};

// Handles selecting an existing principle from registry
export const handleSelectPrinciple = (
  selectedPrincipleId: string,
  allPrinciples: (PrincipleInput & { id: string })[],
  assessment: AssessmentPrinciple[],
): AssessmentPrinciple[] => {
  const selectedPrinciple = getPrincipleInfoById(
    selectedPrincipleId,
    allPrinciples,
  );
  if (!selectedPrinciple) {
    return assessment; // No principle found, return unchanged
  }

  const updatedAssessment = [...assessment];

  // Check if principle already exists
  const existingPrinciple = findPrincipleInAssessment(
    selectedPrinciple.pri,
    updatedAssessment,
  );
  if (existingPrinciple) {
    return assessment; // Principle already exists, return unchanged
  }

  // Create and add the principle
  const newPrinciple = createPrincipleStructure(
    selectedPrinciple.pri,
    selectedPrinciple.label,
    selectedPrinciple.description,
  );

  updatedAssessment.push(newPrinciple);
  return updatedAssessment;
};

export const handleNewPrinciple = (
  principleForm: PrincipleInput,
  assessment: AssessmentPrinciple[],
): AssessmentPrinciple[] => {
  if (!principleForm.pri || !principleForm.label) {
    return assessment; // Invalid state, return unchanged
  }

  const updatedAssessment = [...assessment];

  // Check if principle already exists
  const existingPrinciple = findPrincipleInAssessment(
    principleForm.pri,
    updatedAssessment,
  );
  if (existingPrinciple) {
    return assessment; // Principle already exists, return unchanged
  }

  // Create and add the principle
  const newPrinciple = createPrincipleStructure(
    principleForm.pri,
    principleForm.label,
    principleForm.description,
  );

  updatedAssessment.push(newPrinciple);
  return updatedAssessment;
};

export const handleEditPrinciple = (
  principleId: string,
  updatedPrinciple: PrincipleInput,
  assessment: AssessmentPrinciple[],
): AssessmentPrinciple[] => {
  const updatedAssessment = [...assessment];

  const targetPrinciple = findPrincipleInAssessment(
    principleId,
    updatedAssessment,
  );
  if (!targetPrinciple) {
    return assessment; // Principle not found, return unchanged
  }

  // Update the principle
  targetPrinciple.id = updatedPrinciple.pri;
  targetPrinciple.name = updatedPrinciple.label;
  targetPrinciple.description = updatedPrinciple.description;

  return updatedAssessment;
};

// Converts AssessmentPrinciple to PrincipleInput for form editing
export const assessmentPrincipleToForm = (
  principleId: string,
  assessment: AssessmentPrinciple[],
): PrincipleInput | null => {
  const principle = findPrincipleInAssessment(principleId, assessment);
  if (!principle) {
    return { pri: "", label: "", description: "" };
  }

  return {
    pri: principle.id,
    label: principle.name,
    description: principle.description,
  };
};

// Converts AssessmentCriterion to CriterionInput for form editing
export const assessmentCriterionToForm = (
  criterionId: string,
  assessment: AssessmentPrinciple[],
  formMode: FormMode,
  setPrincipleTag?: (tag: string) => void,
): CriterionInput | null => {
  const criterionLocation = findCriterionInAssessment(criterionId, assessment);
  if (!criterionLocation || formMode !== "edit") {
    setPrincipleTag?.("");
    return { cri: "", label: "", description: "", imperative: "" };
  }

  const { criterion } = criterionLocation;
  return {
    cri: criterion.id,
    label: criterion.name,
    description: criterion.description || "",
    imperative: criterion.imperative.toString(),
  };
};

// Checks if principle form has changes compared to original
export const hasPrincipleFormChanged = (
  formData: PrincipleInput | null,
  originalPrinciple: PrincipleInput | undefined,
): boolean => {
  if (!formData || !originalPrinciple) return false;

  return (
    formData.pri !== originalPrinciple.pri ||
    formData.label !== originalPrinciple.label ||
    formData.description !== originalPrinciple.description
  );
};

// Checks if criterion form has changes compared to original
export const hasCriterionFormChanged = (
  formData: CriterionInput | null,
  originalCriterion: Criterion | undefined,
): boolean => {
  if (!formData || !originalCriterion) return false;

  return (
    formData.cri !== originalCriterion.cri ||
    formData.label !== originalCriterion.label ||
    formData.description !== originalCriterion.description ||
    formData.imperative !== String(originalCriterion.imperative)
  );
};

interface MotivationCriterion {
  id: string;
  principles?: Array<{ id: string }>;
}

interface PrincipleCriterionRelation {
  criterion_id: string;
  principle_id: string;
  annotation_url: string;
  annotation_text: string;
  relation: string;
}

export const formatDataToAssignPrincipleToCriterion = ({
  allMotivationCriteria,
  criterionId,
  principleId,
}: {
  allMotivationCriteria: MotivationCriterion[] | undefined;
  criterionId?: string;
  principleId?: string;
}): PrincipleCriterionRelation[] => {
  let priCri =
    allMotivationCriteria?.flatMap(
      (cri) =>
        cri?.principles?.map((pri) => ({
          criterion_id: cri.id,
          principle_id: pri.id,
          annotation_url: "",
          annotation_text: "",
          relation: relMtvPrincpleCriterion,
        })) || [],
    ) || [];

  const existingCriterionInPriCri = priCri.find(
    (item) => item.criterion_id === criterionId,
  );

  if (!(criterionId && principleId)) {
    return priCri;
  }

  if (existingCriterionInPriCri) {
    priCri = priCri.map((item) => {
      if (item.criterion_id === criterionId) {
        return {
          ...item,
          principle_id: principleId || "",
          annotation_url: "",
          annotation_text: "",
          relation: relMtvPrincpleCriterion,
        };
      }
      return item;
    });
  } else {
    priCri.push({
      criterion_id: criterionId || "",
      principle_id: principleId || "",
      annotation_url: "",
      annotation_text: "",
      relation: relMtvPrincpleCriterion,
    });
  }

  return priCri;
};
