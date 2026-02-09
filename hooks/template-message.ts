
export function generatePasswordResetEmailTemplate(otp: string): {
    html: string;
    text: string;
} {
    const html = `
        <!doctype html>
        <html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta http-equiv="X-UA-Compatible" content="IE=edge" />
          <title>SMM Panel Landing Password Reset Code</title>
          <!--[if mso]>
          <style type="text/css">
            body, table, td {font-family: Arial, sans-serif !important;}
          </style>
          <![endif]-->
        </head>
        <body style="margin:0; padding:0; background-color:#0b1220;">
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#0b1220;">
            <tr>
              <td align="center" style="padding:24px;">
                <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px; background: linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03)); border:1px solid rgba(255,255,255,0.08); border-radius:16px;">
                  <tr>
                    <td align="center" style="padding:40px 24px 20px 24px;">
                      <div style="height:48px; width:48px; border-radius:12px; background:#e6f0ff; color:#1e40af; display:inline-block; text-align:center; line-height:48px; font-weight:700; font-family:Arial, sans-serif; font-size:24px;">🔑</div>
                    </td>
                  </tr>
                  <tr>
                    <td align="center" style="padding:8px 24px;">
                      <h1 style="margin:0; font-family:Arial, sans-serif; font-size:22px; line-height:1.3; color:#ffffff;">Reset your password</h1>
                    </td>
                  </tr>
                  <tr>
                    <td align="center" style="padding:12px 24px 20px;">
                      <p style="margin:0; font-family:Arial, sans-serif; font-size:14px; line-height:1.6; color:#c9d2f0;">Use the 6‑digit code below to reset your password.</p>
                    </td>
                  </tr>
    
                  <tr>
                    <td align="center" style="padding:16px 24px 24px;">
                      <table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:separate; border-spacing:10px;">
                        <tr>
                          ${otp
            .split("")
            .map(
                (d) => `
                                <td align="center" style="height:56px; width:48px; border-radius:12px; background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.12);">
                                  <div style="font-family:Arial, sans-serif; font-size:24px; color:#ffffff; font-weight:700; letter-spacing:1px; line-height:56px;">${d}</div>
                                </td>
                              `
            )
            .join("")}
                      </tr>
                      </table>
                      
                    </td>
                  </tr>
    
                  <tr>
                    <td align="center" style="padding:0 24px 6px;">
                      <p style="margin:0; font-family:Arial, sans-serif; font-size:12px; color:#9aa4c7;">This code expires in 10 minutes.</p>
                    </td>
                  </tr>
                  <tr>
                    <td align="center" style="padding:0 24px 24px;">
                      <p style="margin:0; font-family:Arial, sans-serif; font-size:12px; color:#7781a5;">If you didn't request a password reset, you can safely ignore this email.</p>
                    </td>
                  </tr>
                </table>
    
                <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;">
                  <tr>
                    <td align="center" style="padding:20px 8px;">
                      <p style="margin:0; font-family:Arial, sans-serif; font-size:11px; color:#6b7280;">© ${new Date().getFullYear()} — Password reset</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `;

    const text = `SMM Panel Landing Password Reset Code: ${otp}. It expires in 10 minutes.`;

    return { html, text };
}
