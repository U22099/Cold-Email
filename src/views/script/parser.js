export async function parseLeadsFile(file) {
  const text = await file.text();

  if (file.name.endsWith(".csv")) {
    return new Promise((resolve) => {
      Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const leads = results.data
            .map((row) => {
              const keys = Object.keys(row);
              const getVal = (target) => {
                const k = keys.find(
                  (key) => key.trim().toLowerCase() === target,
                );
                return k ? row[k].trim() : "";
              };
              return {
                name: getVal("name") || getVal("company") || "Team",
                email: getVal("email") || getVal("emails"),
                city: getVal("city") || getVal("location") || "US",
              };
            })
            .filter((lead) => lead.email && isValidEmail(lead.email));

          resolve(leads.length > 0 ? leads : parseRawText(text));
        },
        error: () => resolve(parseRawText(text)),
      });
    });
  }

  return parseRawText(text);
}


function parseRawText(text) {
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const lines = text.split("\n");
  const leads = [];
  const seenEmails = new Set();

  lines.forEach((line) => {
    const matches = line.match(emailRegex);
    if (matches) {
      matches.forEach((email) => {
        const cleanEmail = email.toLowerCase().trim();
        if (!seenEmails.has(cleanEmail)) {
          seenEmails.add(cleanEmail);

          const inferredName = cleanEmail.split("@")[0].replace(/[._-]/g, " ");

          leads.push({
            name: capitalizeWords(inferredName) || "Team",
            email: cleanEmail,
            city: "US",
          });
        }
      });
    }
  });

  return leads;
}

function isValidEmail(email) {
  return /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(email);
}

function capitalizeWords(str) {
  return str.replace(/\b\w/g, (l) => l.toUpperCase());
}
