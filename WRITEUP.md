# Project 3 Writeup

**Author:** Xiaoyi Zhuang  
**Repository:** [Xiaoyi-Zhuang-project3](https://github.com/zxiaoyii/Xiaoyi-Zhuang-project3)  
**Collaborators:** None (solo work)

---

## Challenges

The hardest part was keeping the Sudoku rules correct when the board size changed. Easy mode in my Project 2 build used a 6×6 grid with 2×3 boxes, while normal mode stayed at 9×9. The first Project 3 version only changed how many cells were blank, so easy games still looked like standard Sudoku. I rewrote the generator and validation helpers in `backend/lib/sudoku.js` so row, column, and box checks all use `size`, `boxRows`, and `boxCols`. The game document in MongoDB now stores those three fields, and the React game page reads them so the grid, thick borders, number pad, and conflict highlighting stay consistent.

Deploying on Render failed at first because `vite build` could not load `@rollup/rollup-linux-x64-gnu`. The lockfile came from macOS, so Linux on Render did not install the right optional Rollup binary. I stopped tracking `package-lock.json` in git and added it to `.gitignore` so each environment runs `npm install` on its own platform.

MongoDB Atlas needed the correct URI in environment variables and an IP allow rule. Until both were set, the server would hang or time out on queries. Restarting the dev server after changing `.env` was easy to forget.

## If I Had More Time

I would add automated tests for the Sudoku API (create, put state, delete, custom) and for login or register edge cases. I would also add loading skeletons on the games list and game page so slow networks feel less empty.

For design, I might extract shared board markup into one component used by the game page and the custom puzzle page, so border styles and cell size stay in sync without copying CSS class names.

## Assumptions

I assumed the grader runs Node 20 and a recent npm, same as Render. I assumed cookies over HTTPS in production are enough for session identity for a class project, and that storing password hashes with scrypt meets the encryption bonus as written.

I assumed "nearly identical" to Project 2 for gameplay includes the 6×6 easy board, not only keyboard entry and invalid cell styling. I aligned easy mode with the Project 2 `engine.js` layout (6×6, eighteen clues, 2×3 boxes).

I assumed existing games in the database without `size` / `boxRows` / `boxCols` should default to 9×9 so old documents still load.

## Time Spent

Roughly 8 to 10 hours in total, spread across environment setup, API wiring, UI polish, debugging Atlas and Render, and the variable board size change. The total would be lower if someone already knew hosting and MongoDB well.

## Bonus Points Completed

**Password encryption (2 pts):** Passwords are never stored in plain text. Registration hashes with scrypt and a random salt; login verifies with `crypto.timingSafeEqual`. See `backend/lib/password.js` and usage in `backend/api/user.api.js`.

**Delete game (5 pts):** The creator sees a `DELETE` button on the game page. `DELETE /api/sudoku/:id` removes the game and decrements `wins` for each username in `completedBy`. See `backend/api/sudoku.api.js` and the delete handler in `frontend/src/pages/GamePage.jsx`.

**Custom games (10 pts):** The games page links to `/custom` for logged in users. The page is a blank 9×9 grid with Submit. `POST /api/sudoku/custom` runs uniqueness checks on the server and creates a `CUSTOM` game if there is exactly one solution. See `frontend/src/pages/Custom.jsx` and `validateCustomClues` in `backend/lib/sudoku.js` plus the custom route in `backend/api/sudoku.api.js`.

**AI survey (1 pt):** Completed separately; screenshot with timestamp submitted on Canvas as required.

**Submit early (3 pts):** I submitted the full Canvas package at least 48 hours before the deadline, so this bonus applies.
