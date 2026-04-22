import { contact } from "../config/site.js";

export default function Rules() {
  return (
    <div className="page prose">
      <h1>Rules</h1>
      <p>
        Sudoku is played on a 9×9 grid made of nine 3×3 boxes. The goal is to
        fill every row, every column, and every 3×3 box with the digits 1
        through 9, using each digit exactly once in each unit. The puzzle starts
        with some cells already filled. You may not change those given values.
      </p>
      <p>
        A move is valid when a digit does not repeat in its row, column, or box.
        The puzzle is solved when all 81 cells are filled correctly.
      </p>
      <h2>Credits</h2>
      <p>
        Made for CS5610 by Xiaoyi Zhuang. For questions, contact{" "}
        <a href={`mailto:${contact.email}`}>{contact.email}</a>. You can also
        visit my{" "}
        <a href={contact.githubUrl} target="_blank" rel="noreferrer">
          GitHub
        </a>{" "}
        and{" "}
        <a href={contact.linkedinUrl} target="_blank" rel="noreferrer">
          LinkedIn
        </a>{" "}
        profiles.
      </p>
    </div>
  );
}
