const fs = require("fs");

function processSecurityReports() {
  // Read security analysis results
  const slitherOutput = fs.readFileSync("slither-report.json", "utf8");
  const mythrilOutput = fs.readFileSync("security-report.md", "utf8");

  // Parse results
  const slitherResults = JSON.parse(slitherOutput);

  // Generate summary report
  const report = {
    highSeverity: [],
    mediumSeverity: [],
    lowSeverity: [],
  };

  // Process Slither findings
  slitherResults.results.detectors.forEach((finding) => {
    switch (finding.impact) {
      case "High":
        report.highSeverity.push({
          tool: "Slither",
          description: finding.description,
          location: finding.elements[0].source_mapping.filename,
        });
        break;
      case "Medium":
        report.mediumSeverity.push({
          tool: "Slither",
          description: finding.description,
          location: finding.elements[0].source_mapping.filename,
        });
        break;
      case "Low":
        report.lowSeverity.push({
          tool: "Slither",
          description: finding.description,
          location: finding.elements[0].source_mapping.filename,
        });
        break;
    }
  });

  // Process Mythril findings (if available)
  if (mythrilOutput) {
    // Parse Mythril markdown output and categorize findings
    const mythrilFindings = parseMythrilOutput(mythrilOutput);
    report.highSeverity.push(...mythrilFindings.high);
    report.mediumSeverity.push(...mythrilFindings.medium);
    report.lowSeverity.push(...mythrilFindings.low);
  }

  // Generate markdown report
  fs.writeFileSync(
    "security-summary.md",
    `# Security Analysis Summary\n\n` +
      `## High Severity Issues\n${formatFindings(report.highSeverity)}\n\n` +
      `## Medium Severity Issues\n${formatFindings(
        report.mediumSeverity
      )}\n\n` +
      `## Low Severity Issues\n${formatFindings(report.lowSeverity)}`
  );
}

function parseMythrilOutput(output) {
  // Initialize findings categories
  const findings = {
    high: [],
    medium: [],
    low: [],
  };

  // Simple parsing of Mythril markdown output
  const sections = output.split("# Analysis results");
  if (sections.length > 1) {
    const analysisResults = sections[1];
    const issues = analysisResults.split("## ");

    issues.forEach((issue) => {
      if (issue.includes("Critical") || issue.includes("High")) {
        findings.high.push({
          tool: "Mythril",
          description: issue.split("\n")[0],
          location: extractLocation(issue),
        });
      } else if (issue.includes("Medium")) {
        findings.medium.push({
          tool: "Mythril",
          description: issue.split("\n")[0],
          location: extractLocation(issue),
        });
      } else if (issue.includes("Low")) {
        findings.low.push({
          tool: "Mythril",
          description: issue.split("\n")[0],
          location: extractLocation(issue),
        });
      }
    });
  }

  return findings;
}

function extractLocation(issueText) {
  // Extract location information from Mythril output
  const locationMatch = issueText.match(/In file: (.+?)\n/);
  return locationMatch ? locationMatch[1] : "Location not specified";
}

function formatFindings(findings) {
  return findings
    .map((f) => `- [${f.tool}] ${f.description}\n  Location: ${f.location}`)
    .join("\n");
}

// Execute the report processing
processSecurityReports();
