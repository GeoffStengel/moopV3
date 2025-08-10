// deploy/cleanDeployArtifacts.js
const fs = require("fs");
const path = require("path");

async function main() {
  const artifactDir = path.resolve(__dirname, "../saveDeployArtifacts");
  console.log("Cleaning artifacts in:", artifactDir);

  if (fs.existsSync(artifactDir)) {
    const files = fs.readdirSync(artifactDir);
    if (files.length === 0) {
      console.log("Directory is empty, nothing to clean");
    } else {
      for (const file of files) {
        if (file.endsWith(".json")) {
          fs.unlinkSync(path.join(artifactDir, file));
          console.log(`Deleted: ${file}`);
        }
      }
      console.log("Cleanup completed successfully");
    }
  } else {
    console.log("Directory does not exist, nothing to clean");
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Cleanup failed:", err.message);
    process.exit(1);
  });