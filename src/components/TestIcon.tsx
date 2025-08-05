import React from "react";
import {
  FaCubes,
  FaCalculator,
  FaChartPie,
  FaCheckCircle,
  FaPercent,
  FaAward,
  FaFont,
} from "react-icons/fa";

const testIconMap: Record<string, React.ComponentType> = {
  "Binary-Manual": FaCheckCircle,
  "Binary-Manual-Evidence": FaCheckCircle,
  "Binary-Auto": FaCheckCircle,
  "Number-Manual": FaCalculator,
  "Number-Auto": FaCalculator,
  "Ratio-Manual": FaChartPie,
  "Percent-Manual": FaPercent,
  "TRL-Manual": FaAward,
  "String-Manual": FaFont,
  "String-Auto": FaFont,
};

type TestIconProps = {
  test: string;
};

export const TestIcon: React.FC<TestIconProps> = ({ test }) => {
  const IconComponent = testIconMap[test] || FaCubes;
  return <IconComponent />;
};
