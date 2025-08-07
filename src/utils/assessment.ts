/** Helper  */

import {
  type Assessment,
  AssessmentCriterionImperative,
  type Metric,
  type ResultStats,
  type AssessmentTest,
  type GroupTestRef,
  type LastRun,
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

/** iterates over the nested fields based on query to get the appropriate value */
export function queryValue<T>(obj: T, query: string) {
  const keys = query.split(".");
  return keys.reduce((cur: unknown, key: string) => {
    return cur && typeof cur === "object" && key in cur
      ? (cur as Record<string, unknown>)[key]
      : undefined;
  }, obj);
}

export function applyAutoGroupResults(
  assessment: Assessment,
  group: string,
  groupTests: Record<string, GroupTestRef> | null,
  lastRun: LastRun | null,
): Assessment | null {
  // create a deep copy of the existing assessment
  if (assessment) {
    // organise criteria results to mandatory and optional
    const mandatory: (number | null)[] = [];
    const optional: (number | null)[] = [];
    let compliance: boolean | null;

    // create a deep copy
    const asmtUpdate = JSON.parse(JSON.stringify(assessment)) as Assessment;

    asmtUpdate.principles.map((pri) => {
      pri.criteria.map((cri) => {
        // for each criterion check the tests and then calculate the metric

        cri.metric.tests.map((test) => {
          if (test.type === group) {
            if (groupTests !== null) {
              if (test.params in groupTests) {
                test.result = groupTests[test.params].result;
                test.last_run = groupTests[test.params].last_run;
                test.value = test.result ? "Validated" : "Validation Failed";
              }
            } else if (lastRun) {
              // groupTest results are empty this means the whole test failed so clear the results and update
              // the last run info
              test.result = null;
              test.value = null;
              test.last_run = lastRun;
            }
          }
        });
        const { result, value } = evalMetric(cri.metric);
        cri.metric.value = value;
        cri.metric.result = result;
        if (
          cri.imperative === AssessmentCriterionImperative.Must ||
          cri.imperative === AssessmentCriterionImperative.MUST
        ) {
          mandatory.push(cri.metric.result);
        } else {
          optional.push(cri.metric.result);
        }
      });
    });

    if (mandatory.some((result) => result === null)) {
      compliance = null;
    } else {
      compliance = mandatory.every((result) => result === 1);
    }

    // get how many optional items have passed
    const optionalPass: number = optional.reduce(
      (sum: number, current: number | null) => {
        if (current && current > 0) {
          return sum + 1;
        }
        return sum;
      },
      0,
    );

    // if there any optional items available, ranking is equal to the percentage of optional passed / total optional
    // else ranking is 0
    const ranking =
      optional.length > 0 ? (optionalPass / optional.length) * 100 : 0;

    asmtUpdate.result.compliance = compliance;
    asmtUpdate.result.ranking = ranking;

    return asmtUpdate;
  }

  return null;
}
