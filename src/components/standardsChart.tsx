import { Bar } from "react-chartjs-2";
import {
  Chart,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Tick,
} from "chart.js";
import { getGradeValue, summativeAverage } from "../utils/grade";
import { Standard, SummativeGrade, SummativeGradeValue } from "@prisma/client";
import { useMemo } from "react";

const avgColor = (avg: number | null | undefined) => {
  if (avg == null) return "rgb(0 0 0)";

  if (avg >= getGradeValue("EE")) {
    return "rgb(20 83 45)";
  } else if (avg >= getGradeValue("ME")) {
    return "rgb(34 197 94)";
  } else if (avg >= getGradeValue("AE")) {
    return "rgb(234 179 8)";
  } else if (avg >= getGradeValue("BE")) {
    return "rgb(239 68 68)";
  }

  return "rgb(0 0 0)";
};

Chart.register(CategoryScale, LinearScale, BarElement, Tooltip);

const options = {
  responsive: true,
  scales: {
    y: {
      min: 0,
      max: 100,
      ticks: {
        callback: function (_: unknown, __: unknown, ticks: Tick[]) {
          Object.values(SummativeGradeValue).forEach((val, idx) => {
            ticks[idx] = { value: getGradeValue(val), label: val };
          });
          return null;
        },
      },
    },
  },
  plugins: {
    legend: {
      display: false,
    },
    title: {
      display: false,
    },
  },
};

const StandardsChart: React.FC<{
  className?: string;
  standards: (Standard & {
    summativeGrades: SummativeGrade[];
  })[];
}> = ({ className, standards }) => {
  const data = useMemo(
    () => ({
      labels: standards.map(std => std.name),
      datasets: [
        {
          clip: 100,
          data: standards.map(std => summativeAverage(std.summativeGrades)),

          backgroundColor: standards
            .map(std => summativeAverage(std.summativeGrades))
            .map(avgColor),
        },
      ],
    }),
    [standards],
  );
  return (
    <div className={className}>
      <Bar options={options} data={data}></Bar>
    </div>
  );
};

export default StandardsChart;
