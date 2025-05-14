export const getHtmlResponse = (html: string) =>
    new Response(
        `<!DOCTYPE html>
              <html>
                <head>
                <meta charset="UTF-8" />
                <title>Budget Auth</title>
                </head>
                <body>
                ${html}
                </body>
              </html>`,
        { headers: { 'Content-Type': 'text/html' } },
    );
