import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

export const sendInvitationEmail = async (
    email: string,
    inviterName: string,
    projectName: string,
    invitationLink: string
) => {
    const mailOptions = {
        from: process.env.FROM_EMAIL,
        to: email,
        subject: `You've been invited to join ${projectName}`,
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #2c3e50; margin-bottom: 16px;">Project Invitation</h2>
          <p style="color: #5a6c7d; font-size: 16px; margin-bottom: 16px;">
            Hi there! You've been invited by <strong>${inviterName}</strong> to collaborate on the project "<strong>${projectName}</strong>".
          </p>
        </div>
        
        <div style="background-color: #ffffff; padding: 20px; border: 1px solid #e1e8ed; border-radius: 8px; margin-bottom: 20px;">
          <p style="color: #2c3e50; font-size: 16px; margin-bottom: 20px;">
            Click the button below to accept the invitation and join the project:
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${invitationLink}" 
               style="background-color: #3498db; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              Accept Invitation
            </a>
          </div>
          
          <p style="color: #7f8c8d; font-size: 14px; margin-top: 20px;">
            If you can't click the button, copy and paste this link into your browser:
            <br>
            <span style="color: #3498db;">${invitationLink}</span>
          </p>
        </div>
        
        <div style="color: #7f8c8d; font-size: 12px; text-align: center; margin-top: 20px;">
          This invitation will expire in 7 days.
        </div>
      </div>
    `
    };

    try {
        await transporter.sendMail(mailOptions);
        return { success: true };
    } catch (error) {
        console.error('Email sending error:', error);
        return { success: false, error: 'Failed to send email' };
    }
};

export const sendOTPEmail = async (email: string, otp: string) => {
    const mailOptions = {
        from: process.env.FROM_EMAIL,
        to: email,
        subject: 'Your Verification Code',
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #2c3e50; margin-bottom: 16px;">Email Verification</h2>
          <p style="color: #5a6c7d; font-size: 16px; margin-bottom: 16px;">
            Please use this verification code to complete your email verification:
          </p>
        </div>
        
        <div style="background-color: #ffffff; padding: 20px; border: 1px solid #e1e8ed; border-radius: 8px; margin-bottom: 20px; text-align: center;">
          <div style="font-size: 32px; font-weight: bold; color: #2c3e50; letter-spacing: 4px; margin: 20px 0;">
            ${otp}
          </div>
          <p style="color: #7f8c8d; font-size: 14px;">
            This code will expire in 10 minutes.
          </p>
        </div>
      </div>
    `
    };

    try {
        await transporter.sendMail(mailOptions);
        return { success: true };
    } catch (error) {
        console.error('OTP email sending error:', error);
        return { success: false, error: 'Failed to send OTP email' };
    }
};