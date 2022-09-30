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
import { Standard, SummativeGrade } from "@prisma/client";
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
      ticks: {
        callback: function (_: unknown, __: unknown, ticks: Tick[]) {
          if (ticks[0]) {
            ticks[0].value = getGradeValue("NE");
            ticks[0].label = "NE";
          }
          if (ticks[1]) {
            ticks[1].value = getGradeValue("BE");
            ticks[1].label = "BE";
          }
          if (ticks[2]) {
            ticks[2].value = getGradeValue("AE");
            ticks[2].label = "AE";
          }
          if (ticks[3]) {
            ticks[3].value = getGradeValue("ME");
            ticks[3].label = "ME";
          }
          if (ticks[4]) {
            ticks[4].value = getGradeValue("EE");
            ticks[4].label = "EE";
          }
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
