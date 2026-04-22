import mongoose from "mongoose";
import sudokuSchema from "../schema/sudoku.schema.js";

const SudokuGame = mongoose.model("SudokuGame", sudokuSchema);
export default SudokuGame;
