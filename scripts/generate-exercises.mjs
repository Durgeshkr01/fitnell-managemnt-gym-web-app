import { readFile, writeFile, mkdir } from "fs/promises";
import { resolve, dirname } from "path";

const inputPath = resolve("Exercises_Dataset-main/data/gifs.json");
const outputPath = resolve("src/data/exercises.json");

const raw = await readFile(inputPath, "utf8");
const data = JSON.parse(raw);

const mapped = Array.isArray(data)
  ? data
      .filter((item) => item?.title && item?.src)
      .map((item) => ({
        name: String(item.title).trim(),
        gif: String(item.src).trim(),
        muscleGroup: item.targetMuscle ? String(item.targetMuscle).trim() : null,
      }))
  : [];

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, JSON.stringify(mapped, null, 2));

console.log(`Wrote ${mapped.length} exercises to ${outputPath}`);
