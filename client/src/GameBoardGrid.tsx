import React, { Fragment } from "react";
import styled from "styled-components";
import { Game } from "../../common/types";

export function GameBoardGrid({ game }: { game: Game }) {
  return (
    <Grid size={game.size}>
      {game.board.map((row, y) => (
        <Fragment key={y}>
          {row.map((cell, x) => (
            <Cell key={x} style={{ background: getColor(cell) }}>
              {cell}
            </Cell>
          ))}
        </Fragment>
      ))}
    </Grid>
  );
}

const Grid = styled.div<{ size: number }>`
  display: grid;
  grid-template-columns: repeat(${(props) => props.size}, 60px);
  grid-template-rows: repeat(${(props) => props.size}, 60px);
  gap: 8px;
`;

const Cell = styled.div`
  font-size: 22px;
  text-align: center;
  font-weight: bold;
  line-height: 60px;
  border-radius: 3px;
  color: white;
`;

function getColor(num: number): string {
  if (num === 0) return "#89b6a2";
  const n = Math.floor(Math.log2(num));
  return colors[n % colors.length];
}

//https://colordesigner.io/gradient-generator/?mode=hsl#00A99F-EF357B
const colors = [
  "#00a99f",
  "#0192b3",
  "#036dbd",
  "#0444c6",
  "#0617d0",
  "#2908d9",
  "#6109e3",
  "#9d0cec",
  "#d911f2",
  "#f11dd4",
  "#f029a4",
  "#ef357b",
];
