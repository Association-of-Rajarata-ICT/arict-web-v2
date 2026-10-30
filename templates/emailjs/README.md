# ARICT contact notification

This template delivers a Contact Us submission to the ARICT team's inbox. It matches the website's red, black and white branding and uses exactly the eight parameters already sent by `contactTemplateParams()` in `lib/emailjs/index.ts`.

## Install in EmailJS

1. Open **Email Templates** in the [EmailJS dashboard](https://dashboard.emailjs.com/). Create a template or select the template used by the website.
2. Open the email content's **HTML/code editor** and replace the content with the complete contents of [contact-notification.html](./contact-notification.html).
3. Set the following template fields:

   | Field | Value |
   | --- | --- |
   | Template name | `ARICT — Contact notification` |
   | Subject | `[ARICT Website] {{subject}}` |
   | To Email | The actual ARICT team inbox, entered as a fixed address |
   | From Name | `ARICT Website` |
   | From Email | Enable **Use Default Email Address** for the connected email service |
   | Reply To | `{{reply_to}}` |
   | CC / BCC | Leave empty unless copies are needed |

4. Save the template. Use **Test It** with the values in [sample-params.json](./sample-params.json) and send a test to your own team inbox. The sample sender address is fictional.
5. Copy the saved template's ID into `NEXT_PUBLIC_EMAILJS_TEMPLATE_ID` in the website's `.env` and deployment environment. The existing service ID and public key must also be set:

   ```dotenv
   NEXT_PUBLIC_EMAILJS_SERVICE_ID=your_service_id
   NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=your_template_id
   NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=your_public_key
   ```

6. Restart the development server, or rebuild and redeploy after environment changes. If you edit the content of the already configured EmailJS template without changing its ID, no website code change is needed.
7. Submit the website's contact form and verify the received subject, all contact details, multiline message, and Reply destination.

The email's logo uses `https://arict.lk/brand/arict-wordmark.png`. Change that URL if the website uses another domain. It must be publicly accessible; email clients may block remote images, in which case the `ARICT` alt text identifies the brand.

## Variables

| Variable | Existing website value |
| --- | --- |
| `{{from_name}}` | Sender's name |
| `{{from_email}}` | Sender's email address |
| `{{reply_to}}` | Sender's email address; also used by the reply button |
| `{{phone}}` | Phone number, or `Not provided` |
| `{{subject}}` | Contact form subject |
| `{{message}}` | Contact form message |
| `{{submitted_at}}` | Form submission time formatted in `Asia/Colombo` |
| `{{source_page}}` | URL where the contact form was submitted |

Keep the double braces around submitted content: EmailJS escapes these values as text. The message block preserves line breaks with inline `white-space: pre-wrap`; confirm its rendering in the email clients your team uses. The fluid, single-column layout uses presentation tables, system fonts and inline styles. Older Outlook versions may show square corners.

This template sends one notification to the team. It does not send an automatic confirmation to the visitor.

EmailJS references: [template fields and default sender address](https://www.emailjs.com/docs/tutorial/creating-email-template/), [escaped dynamic variables](https://www.emailjs.com/docs/user-guide/dynamic-variables-templates/), and [testing templates](https://www.emailjs.com/docs/user-guide/creating-email-templates/).
