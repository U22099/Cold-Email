export default function getBestTargetEmail(emailString, domain = null) {
  if (
    !emailString ||
    typeof emailString !== "string" ||
    emailString.includes("###")
  ) {
    return null;
  }

  const emails = emailString
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter((e) => e.includes("@"));

  if (emails.length === 0) return null;

  let companyDomain = "";
  if (domain && typeof domain === "string") {
    companyDomain = domain.replace(/^(https?:\/\/)?(www\.)?/, "").split("/")[0];
  } else {
    companyDomain = emails[0].split("@")[1];
  }

  const internalEmails = emails.filter((e) => e.endsWith("@" + companyDomain));
  const poolToUse = internalEmails.length > 0 ? internalEmails : emails;

  const priorityPrefixes = [
    "info@",
    "contact@",
    "studio@",
    "office@",
    "hello@",
    "newwork@",
    "projects@",
  ];

  for (let prefix of priorityPrefixes) {
    const match = poolToUse.find((e) => e.startsWith(prefix));
    if (match) return match;
  }

  const cleanEmails = poolToUse.filter(
    (e) =>
      !e.includes("job") &&
      !e.includes("press") &&
      !e.includes("career") &&
      !e.includes("acct") &&
      !e.includes("vendor"),
  );

  return cleanEmails[0] || emails[0] || null;
}
