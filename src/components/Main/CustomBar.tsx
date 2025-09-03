"use client"

interface ChartDataPoint {
  month: string;
  income: number;
  isCurrent: boolean;
}

interface CustomBarShapeProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  payload?: ChartDataPoint;
}

  export const CustomBarShape = ({ x, y, width, height, payload }: CustomBarShapeProps) => {
    if (y === undefined || height === undefined) return null;
    console.log(payload , 'PAYLOAD')
    const income = payload?.income ?? 0;
    const displayHeight = income === 0 ? 100 : height;
    const displayY = income === 0 ? y - 100 : y;

    return (
      <rect
        x={x}
        y={displayY}
        width={width}
        height={displayHeight}
        fill={income === 0 ? "#7D8D86" : "#22c55e"}
        rx={8}
      />
    );
  };
