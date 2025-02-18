/** Helper  */

import {
  Assessment,
  AssessmentCriterionImperative,
  Metric,
  ResultStats,
  AssessmentTest,
} from "../types";

/** Evaluates all tests of a metric if the metric is number */
export function evalMetric(metric: Metric): {
  result: number | null;
  value: number | null;
} {
  // Usage only for metrics of type number
  let value: number | null = null,
    result: number | null = null;

  // check if metric aggregates with OR
  const metricOR = metric.type.endsWith("-OR");
  // if metric algo indicates sum calculate the sum of test scores
  if (
    metric.label_algorithm_type === "Simple Sum" ||
    metric.label_algorithm_type === "Binary"
  ) {
    // if one of the tests in not filled yet the result of the metric should be -1 (unresolved)
    value = metric.tests.reduce((sum: number | null, item: AssessmentTest) => {
      // if metric aggregates in OR skip unfilled values
      if (sum === null || item.result === null) return metricOR ? sum : null;
      return sum + item.result;
    }, 0);
  } else if (metric.label_algorithm_type === "Simple Maximum") {
    value = metric.tests.reduce((max: number | null, item: AssessmentTest) => {
      // if metric aggregates in OR skip unfilled values
      if (max === null || item.result === null) return metricOR ? max : null;
      return Math.max(item.result, max);
    }, -Infinity);
  } else {
    // same as sum
    // if one of the tests in not filled yet the result of the metric should be -1 (unresolved)
    value = metric.tests.reduce((sum: number | null, item: AssessmentTest) => {
      // if metric aggregates in OR skip unfilled values
      if (sum === null || item.result === null) return metricOR ? sum : null;
      return sum + item.result;
    }, 0);
  }
  // if all the tests are filled-in and a value has been produced calculate also the rating

  if (value !== null && metric.benchmark_value !== undefined) {
    // new templates have benchmark_value parameter
    if (metric.type.endsWith("-Inverse")) {
      result = value && value < metric.benchmark_value ? 1 : 0;
    } else {
      result = value && value >= metric.benchmark_value ? 1 : 0;
    }
  }

  return { result: result, value: value };
}

/** Evaluates compliance, ranking and stats for the Assessment provided by checking all the included criteria */
export function evalAssessment(
  assessment: Assessment | undefined | null,
): ResultStats | null {
  if (!assessment) return null;

  const mandatory: (number | null)[] = [];
  const optional: (number | null)[] = [];

  if (assessment.principles) {
    assessment.principles.forEach((principle) => {
      principle.criteria.forEach((criterion) => {
        if (
          criterion.imperative === AssessmentCriterionImperative.Must ||
          criterion.imperative === AssessmentCriterionImperative.MUST
        ) {
          mandatory.push(criterion.metric.result);
        } else {
          optional.push(criterion.metric.result);
        }
      });
    });
  }

  const mandatoryFilledCount = mandatory.filter(
    (result) => result !== null,
  ).length;
  const optionalFilledCount = optional.filter(
    (result) => result !== null,
  ).length;
  const mandatoryCount = mandatory.filter(
    (result) => result !== null && result > 0,
  ).length;
  const optionalCount = optional.filter(
    (number) => number !== null && number > 0,
  ).length;

  return {
    totalMandatory: mandatory.length,
    totalOptional: optional.length,
    mandatoryFilled: mandatoryFilledCount,
    optionalFilled: optionalFilledCount,
    mandatory: mandatoryCount,
    optional: optionalCount,
  };
}
