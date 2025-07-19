export async function sendEmail({
  to,
  subject,
  html,
  text,
  attachments
}: {
  to: string,
  subject: string,
  html?: string,
  text?: string,
  attachments?: { filename: string, content: string }[]
}) {
  const body: any = { to, subject };
  
  if (html) body.html = html;
  if (text) body.text = text;
  if (attachments && attachments.length > 0) {
    body.attachments = attachments;
  }
  
  const response = await fetch('https://mail3.angohost.ao/email/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  
  if (!response.ok) {
    throw new Error('Erro ao enviar e-mail');
  }
  
  return response.json();
}