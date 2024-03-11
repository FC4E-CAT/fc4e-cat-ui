import { Metric } from "@/types";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";

export function CriterionProgress({ metric }: { metric: Metric }) {
  const tests = metric.tests;
  const total = tests.length;
  let filled = 0;
  const testMarkers = [];

  console.log(tests);

  for (const item of tests) {
    if (item.result !== null) {
      if (item.result === 0) {
        testMarkers.push(
          <span
            key={item.id}
            className="badge badge-pill bg-danger me-1 flex-1"
          >
            {" "}
          </span>,
        );
      }
      if (item.result === 1) {
        testMarkers.push(
          <span
            key={item.id}
            className="badge badge-pill bg-success me-1 flex-1"
          >
            {" "}
          </span>,
        );
      }
      filled = filled + 1;
    } else {
      testMarkers.push(
        <span
          key={item.id}
          className="badge badge-pill bg-secondary me-1 flex-1"
        >
          {" "}
        </span>,
      );
    }
  }

  return (
    <div>
      <div className="d-flex">{testMarkers}</div>
      <div>
        {metric.result === null ? (
          <div>
            <small>
              in progress: {filled}/{total} tests
            </small>
          </div>
        ) : (
          <>
            <div>
              <small>
                complete - result:
                {metric.result === 1 ? (
                  <span>
                    <FaCheckCircle className="text-success mx-2" /> PASS{" "}
                  </span>
                ) : (
                  <span>
                    <FaTimesCircle className="text-danger mx-2" /> FAIL{" "}
                  </span>
                )}
              </small>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
