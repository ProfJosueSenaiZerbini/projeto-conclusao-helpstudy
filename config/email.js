// =====================================================================
// Configuração do envio de e-mails (Nodemailer + Gmail)
// Usado para mandar o código de recuperação de senha.
// Os dados ficam no .env: EMAIL_USER e EMAIL_PASS (senha de app do Gmail)
// =====================================================================
const nodemailer = require('nodemailer');
require('dotenv').config();

const emailConfigurado = Boolean(process.env.EMAIL_USER && process.env.EMAIL_PASS);

const transporter = emailConfigurado
    ? nodemailer.createTransport({
          service: 'gmail',
          auth: {
              user: process.env.EMAIL_USER,
              pass: process.env.EMAIL_PASS
          }
      })
    : null;

async function enviarCodigoRecuperacao(destino, nome, codigo) {
    // Sem e-mail configurado no .env: mostra o código no terminal para dar para testar
    if (!emailConfigurado) {
        console.warn(`⚠️  E-mail não configurado no .env. Código de recuperação para ${destino}: ${codigo}`);
        return;
    }

    await transporter.sendMail({
        from: `"HelpStudy" <${process.env.EMAIL_USER}>`,
        to: destino,
        subject: 'Seu código para redefinir a senha - HelpStudy',
        text: `Olá, ${nome}!\n\nSeu código para redefinir a senha do HelpStudy é: ${codigo}\n\nEle vale por 15 minutos. Se não foi você que pediu, é só ignorar este e-mail.`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; color: #08112F;">
                <h2 style="color: #3E53A0;">HelpStudy</h2>
                <p>Olá, <strong>${nome}</strong>!</p>
                <p>Seu código para redefinir a senha é:</p>
                <p style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #5A77DF;">${codigo}</p>
                <p>Ele vale por <strong>15 minutos</strong>.</p>
                <p style="color: #5D667C; font-size: 13px;">Se não foi você que pediu, é só ignorar este e-mail.</p>
            </div>
        `
    });
}

module.exports = { enviarCodigoRecuperacao };
