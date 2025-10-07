import {
  AssessmentCriterionImperative,
  type Assessment,
  type AssessmentStats,
} from "@/types";

const gatherStats = (assessment: Assessment | undefined): AssessmentStats => {
  let total_principles = 0;
  let total_criteria = 0;
  let total_mandatory = 0;
  let total_optional = 0;
  let completed_mandatory = 0;
  let completed_optional = 0;

  if (assessment) {
    total_principles = assessment.principles.length;
    assessment.principles.forEach((pri) => {
      total_criteria += pri.criteria.length;
      pri.criteria.forEach((cri) => {
        if (cri.imperative == AssessmentCriterionImperative.MUST) {
          total_mandatory += 1;
          if (cri.metric.result !== null) completed_mandatory += 1;
        } else {
          total_optional += 1;
          if (cri.metric.result !== null) completed_optional += 1;
        }
      });
    });
  }

  return {
    total_principles: total_principles,
    total_criteria: total_criteria,
    total_mandatory: total_mandatory,
    total_optional: total_optional,
    completed_mandatory: completed_mandatory,
    completed_optional: completed_optional,
  };
};

export default gatherStats;
