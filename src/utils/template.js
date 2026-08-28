const getPitchTemplate = (lead) => {
  const safeName = lead.name || "Team";
  const safeCompany = lead.company || lead.name || "your business";
  const safeCity = lead.city || "your area";
  const safeLink = "https://arc-n-beam.vercel.app";

  return `
    <div style="font-family: Arial, sans-serif; font-size: 14px; line-height: 1.6; color: #111; max-width: 600px;">
      <p>Hi ${safeName},</p>
      
      <p>
        I came across <strong>${safeCompany}</strong> while looking for top project builders in ${safeCity}, and I really loved your portfolio work.
      </p>
      
      <p>
        I did notice one thing, though: your mobile layout isn't fully optimized for fast project inquiries. This can cause you to lose potential clients who are searching for instant project estimates on their phones.
      </p>
      
      <p>So I went ahead and created a quick redesign/demo website for you that:</p>
      
      <ul style="padding-left: 20px;">
        <li>Makes your business look more modern + trustworthy</li>
        <li>Makes it easier for customers to book/contact you directly</li>
        <li>Helps turn site visitors into actual paying clients</li>
      </ul>
      
      <p>
        Here is the live demo preview: <a href="${safeLink}" style="color: #0066cc; font-weight: bold;">${safeLink}</a>
      </p>
      
      <p>
        If you're open to it, I'd love to quickly show you what I built (no pressure at all). Would you be open to a 5-minute call sometime this week?
      </p>
      
      <p>
        Best,<br>
        <strong>Daniel</strong>
      </p>
    </div>
  `;
};

export default getPitchTemplate;