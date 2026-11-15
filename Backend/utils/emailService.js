const nodemailer = require("nodemailer");

// Initialize transporter if credentials are provided
let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT || 587;
  const user = process.env.EMAIL_USER || process.env.SMTP_USER;
  const pass = process.env.EMAIL_PASS || process.env.SMTP_PASS;

  if (user && pass) {
    transporter = nodemailer.createTransport({
      host: host || "smtp.gmail.com",
      port: Number(port),
      secure: Number(port) === 465,
      auth: {
        user,
        pass,
      },
    });
  }

  return transporter;
};

/**
 * Send an email safely with full error handling.
 * Never throws error to caller; logs delivery attempt and errors.
 */
const sendEmail = async ({ to, subject, html, text }) => {
  if (!to) {
    console.warn("[EmailService] No recipient email specified.");
    return { success: false, reason: "No recipient specified" };
  }

  const from =
    process.env.EMAIL_FROM ||
    `"Placement Cell Portal" <${process.env.EMAIL_USER || "placement@college.edu"}>`;

  const mailOptions = {
    from,
    to,
    subject,
    text: text || html.replace(/<[^>]*>?/gm, ""),
    html,
  };

  try {
    const activeTransporter = getTransporter();

    if (activeTransporter) {
      const info = await activeTransporter.sendMail(mailOptions);
      console.log(`[EmailService] Email sent successfully to ${to}. MessageId: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } else {
      // Mock / Dev Log delivery when SMTP is not configured
      console.log(`[EmailService - DEV/MOCK] Notification dispatched to: ${to}`);
      console.log(`Subject: ${subject}`);
      console.log(`Content:\n${text || mailOptions.text}\n---`);
      return { success: true, simulated: true };
    }
  } catch (error) {
    console.error(`[EmailService] Failed to deliver email to ${to}:`, error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Templates for Round Tracking Notifications
 */

// A. When student clears a round
const sendRoundClearedEmail = async ({
  to,
  studentName,
  companyName,
  role,
  roundName,
  nextRoundName,
  nextRoundDetails,
}) => {
  const subject = `Congratulations! You Cleared ${roundName} - ${companyName}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h2 style="color: #16a34a; margin: 0;">🎉 Congratulations, ${studentName}!</h2>
        <p style="color: #64748b; font-size: 14px; margin-top: 4px;">Placement Drive Progress Update</p>
      </div>

      <p style="font-size: 15px; color: #334155; line-height: 1.6;">
        We are thrilled to inform you that you have successfully <strong>cleared</strong> <strong>${roundName}</strong> for the <strong>${role}</strong> position at <strong>${companyName}</strong>!
      </p>

      <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; margin: 20px 0;">
        <h4 style="color: #15803d; margin: 0 0 8px 0; font-size: 14px; text-transform: uppercase;">Round Summary</h4>
        <p style="margin: 4px 0; color: #166534; font-size: 14px;"><strong>Company:</strong> ${companyName}</p>
        <p style="margin: 4px 0; color: #166534; font-size: 14px;"><strong>Job Role:</strong> ${role}</p>
        <p style="margin: 4px 0; color: #166534; font-size: 14px;"><strong>Status:</strong> <span style="background-color: #22c55e; color: white; padding: 2px 8px; border-radius: 4px; font-weight: bold;">CLEARED</span></p>
        ${
          nextRoundName
            ? `<p style="margin: 8px 0 0 0; color: #15803d; font-size: 14px; border-top: 1px dashed #bbf7d0; pt: 8px;"><strong>Next Round:</strong> ${nextRoundName}</p>`
            : ""
        }
        ${
          nextRoundDetails
            ? `<p style="margin: 4px 0; color: #166534; font-size: 13px;">${nextRoundDetails}</p>`
            : ""
        }
      </div>

      <p style="font-size: 14px; color: #64748b; line-height: 1.5;">
        You can log in to your Student Placement Dashboard to view your full placement journey and round instructions.
      </p>

      <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; text-align: center;">
        Placement Cell Management System • Automated Notification
      </div>
    </div>
  `;

  return sendEmail({ to, subject, html });
};

// B. When student is rejected
const sendRoundRejectedEmail = async ({
  to,
  studentName,
  companyName,
  role,
  roundName,
  feedback,
}) => {
  const subject = `Placement Update – Application Status - ${companyName}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h2 style="color: #475569; margin: 0;">Placement Drive Update</h2>
        <p style="color: #64748b; font-size: 14px; margin-top: 4px;">${companyName} • ${role}</p>
      </div>

      <p style="font-size: 15px; color: #334155; line-height: 1.6;">
        Dear <strong>${studentName}</strong>,
      </p>

      <p style="font-size: 14px; color: #475569; line-height: 1.6;">
        Thank you for your active participation in <strong>${roundName}</strong> for the <strong>${role}</strong> opportunity at <strong>${companyName}</strong>.
      </p>

      <p style="font-size: 14px; color: #475569; line-height: 1.6;">
        After careful evaluation, we regret to inform you that your candidacy will not be moving forward to the subsequent rounds for this specific placement drive.
      </p>

      ${
        feedback
          ? `
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; margin: 18px 0;">
          <h4 style="color: #334155; margin: 0 0 6px 0; font-size: 13px;">Reviewer Feedback:</h4>
          <p style="margin: 0; color: #64748b; font-size: 13px; font-style: italic;">"${feedback}"</p>
        </div>
      `
          : ""
      }

      <p style="font-size: 14px; color: #64748b; line-height: 1.5;">
        We appreciate the effort and dedication you displayed. Keep exploring new placement drives on the portal—new opportunities are posted regularly!
      </p>

      <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; text-align: center;">
        Placement Cell Management System • Automated Notification
      </div>
    </div>
  `;

  return sendEmail({ to, subject, html });
};

// C. When next round is scheduled
const sendRoundScheduledEmail = async ({
  to,
  studentName,
  companyName,
  role,
  roundName,
  scheduledDate,
  scheduledTime,
  location,
  meetingLink,
  instructions,
}) => {
  const subject = `Your Next Interview Round Has Been Scheduled - ${companyName}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h2 style="color: #2563eb; margin: 0;">📅 Round Scheduled</h2>
        <p style="color: #64748b; font-size: 14px; margin-top: 4px;">${companyName} • ${role}</p>
      </div>

      <p style="font-size: 15px; color: #334155; line-height: 1.6;">
        Hello <strong>${studentName}</strong>,
      </p>

      <p style="font-size: 14px; color: #475569; line-height: 1.6;">
        Your next placement round <strong>${roundName}</strong> with <strong>${companyName}</strong> has been officially scheduled. Please review the details below:
      </p>

      <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 16px; margin: 20px 0;">
        <p style="margin: 4px 0; color: #1e40af; font-size: 14px;"><strong>Round:</strong> ${roundName}</p>
        <p style="margin: 4px 0; color: #1e40af; font-size: 14px;"><strong>Date:</strong> ${
          scheduledDate ? new Date(scheduledDate).toLocaleDateString() : "To be announced"
        }</p>
        <p style="margin: 4px 0; color: #1e40af; font-size: 14px;"><strong>Time:</strong> ${scheduledTime || "As per schedule"}</p>
        <p style="margin: 4px 0; color: #1e40af; font-size: 14px;"><strong>Location / Mode:</strong> ${location || "Online"}</p>
        ${
          meetingLink
            ? `<p style="margin: 8px 0 4px 0;"><a href="${meetingLink}" target="_blank" style="display: inline-block; background-color: #2563eb; color: #ffffff; padding: 8px 16px; border-radius: 6px; text-decoration: none; font-size: 13px; font-weight: bold;">Join Online Session</a></p>`
            : ""
        }
        ${
          instructions
            ? `<div style="margin-top: 10px; border-top: 1px dashed #bfdbfe; padding-top: 8px; color: #1e3a8a; font-size: 13px;"><strong>Instructions:</strong> ${instructions}</div>`
            : ""
        }
      </div>

      <p style="font-size: 14px; color: #64748b; line-height: 1.5;">
        Please ensure you are prepared and present on time. Best of luck!
      </p>

      <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; text-align: center;">
        Placement Cell Management System • Automated Notification
      </div>
    </div>
  `;

  return sendEmail({ to, subject, html });
};

// D. When student is finally selected
const sendFinalSelectionEmail = async ({
  to,
  studentName,
  companyName,
  role,
  packageAmount,
  additionalInfo,
}) => {
  const subject = `Congratulations! You Have Been Selected - ${companyName} 🎉`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #16a34a; margin: 0; font-size: 26px;">🌟 Outstanding Achievement! 🌟</h1>
        <h3 style="color: #0f172a; margin-top: 6px;">You are Selected by ${companyName}!</h3>
      </div>

      <p style="font-size: 15px; color: #334155; line-height: 1.6;">
        Dear <strong>${studentName}</strong>,
      </p>

      <p style="font-size: 15px; color: #334155; line-height: 1.6;">
        Heartiest congratulations from the College Placement Cell! We are delighted to inform you that you have emerged successfully through all rounds and have been <strong>selected</strong> for the <strong>${role}</strong> position at <strong>${companyName}</strong>!
      </p>

      <div style="background-color: #f0fdf4; border: 2px solid #86efac; border-radius: 10px; padding: 18px; margin: 20px 0;">
        <h4 style="color: #15803d; margin: 0 0 10px 0; font-size: 15px; text-transform: uppercase;">Offer Overview</h4>
        <p style="margin: 4px 0; color: #166534; font-size: 15px;"><strong>Company:</strong> ${companyName}</p>
        <p style="margin: 4px 0; color: #166534; font-size: 15px;"><strong>Role:</strong> ${role}</p>
        ${
          packageAmount
            ? `<p style="margin: 4px 0; color: #166534; font-size: 15px;"><strong>Package / CTC:</strong> ${packageAmount}</p>`
            : ""
        }
        <p style="margin: 6px 0 0 0; color: #15803d; font-size: 15px;"><strong>Final Result:</strong> <span style="background-color: #16a34a; color: white; padding: 2px 10px; border-radius: 4px; font-weight: bold;">SELECTED</span></p>
        ${
          additionalInfo
            ? `<div style="margin-top: 10px; border-top: 1px dashed #86efac; padding-top: 8px; color: #14532d; font-size: 13px;"><strong>Company Notes:</strong> ${additionalInfo}</div>`
            : ""
        }
      </div>

      <p style="font-size: 14px; color: #475569; line-height: 1.5;">
        The placement cell and the recruiter will coordinate next steps regarding onboarding documentation and formal offer rollout.
      </p>

      <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; text-align: center;">
        Placement Cell Management System • Automated Notification
      </div>
    </div>
  `;

  return sendEmail({ to, subject, html });
};

// E. When an interview is scheduled
const sendInterviewScheduledEmail = async ({
  to,
  studentName,
  companyName,
  role,
  roundName,
  date,
  time,
  mode,
  meetingLink,
  venue,
  interviewerName,
  instructions,
}) => {
  const formattedDate = new Date(date).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const subject = `Interview Scheduled: ${roundName} with ${companyName}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h2 style="color: #2563eb; margin: 0;">📅 Interview Scheduled</h2>
        <p style="color: #64748b; font-size: 14px; margin-top: 4px;">Placement Cell Interview Notice</p>
      </div>

      <p style="font-size: 15px; color: #334155; line-height: 1.6;">
        Dear <strong>${studentName}</strong>,
      </p>

      <p style="font-size: 15px; color: #334155; line-height: 1.6;">
        An interview session has been scheduled for you for the <strong>${role}</strong> opportunity at <strong>${companyName}</strong>. Please review the details below:
      </p>

      <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 16px; margin: 20px 0;">
        <h4 style="color: #1d4ed8; margin: 0 0 10px 0; font-size: 14px; text-transform: uppercase;">Interview Details</h4>
        <p style="margin: 4px 0; color: #1e40af; font-size: 14px;"><strong>Round:</strong> ${roundName}</p>
        <p style="margin: 4px 0; color: #1e40af; font-size: 14px;"><strong>Date:</strong> ${formattedDate}</p>
        <p style="margin: 4px 0; color: #1e40af; font-size: 14px;"><strong>Time:</strong> ${time}</p>
        <p style="margin: 4px 0; color: #1e40af; font-size: 14px;"><strong>Mode:</strong> ${mode}</p>
        ${
          mode === "Online" && meetingLink
            ? `<p style="margin: 6px 0; color: #1e40af; font-size: 14px;"><strong>Meeting Link:</strong> <a href="${meetingLink}" target="_blank" style="color: #2563eb; text-decoration: underline; word-break: break-all;">${meetingLink}</a></p>`
            : ""
        }
        ${
          mode === "Offline" && venue
            ? `<p style="margin: 4px 0; color: #1e40af; font-size: 14px;"><strong>Location / Venue:</strong> ${venue}</p>`
            : ""
        }
        ${
          interviewerName
            ? `<p style="margin: 4px 0; color: #1e40af; font-size: 14px;"><strong>Interviewer:</strong> ${interviewerName}</p>`
            : ""
        }
        ${
          instructions
            ? `<div style="margin-top: 10px; border-top: 1px dashed #bfdbfe; padding-top: 8px; color: #1e3a8a; font-size: 13px;"><strong>Instructions:</strong> ${instructions}</div>`
            : ""
        }
      </div>

      <p style="font-size: 14px; color: #475569; line-height: 1.5;">
        Please join or report 10 minutes prior to the scheduled time with your college ID card and updated resume.
      </p>

      <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; text-align: center;">
        Placement Cell Management System • Automated Notification
      </div>
    </div>
  `;

  return sendEmail({ to, subject, html });
};

// F. When an interview is rescheduled
const sendInterviewRescheduledEmail = async ({
  to,
  studentName,
  companyName,
  role,
  roundName,
  newDate,
  newTime,
  mode,
  meetingLink,
  venue,
  reason,
}) => {
  const formattedDate = new Date(newDate).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const subject = `Interview Rescheduled: ${roundName} - ${companyName}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h2 style="color: #d97706; margin: 0;">⏰ Interview Rescheduled</h2>
        <p style="color: #64748b; font-size: 14px; margin-top: 4px;">Placement Cell Schedule Update</p>
      </div>

      <p style="font-size: 15px; color: #334155; line-height: 1.6;">
        Dear <strong>${studentName}</strong>,
      </p>

      <p style="font-size: 15px; color: #334155; line-height: 1.6;">
        Your interview for <strong>${roundName}</strong> (${role} at ${companyName}) has been rescheduled to a new slot:
      </p>

      <div style="background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 16px; margin: 20px 0;">
        <h4 style="color: #b45309; margin: 0 0 10px 0; font-size: 14px; text-transform: uppercase;">Updated Schedule</h4>
        <p style="margin: 4px 0; color: #92400e; font-size: 14px;"><strong>New Date:</strong> ${formattedDate}</p>
        <p style="margin: 4px 0; color: #92400e; font-size: 14px;"><strong>New Time:</strong> ${newTime}</p>
        <p style="margin: 4px 0; color: #92400e; font-size: 14px;"><strong>Mode:</strong> ${mode}</p>
        ${
          mode === "Online" && meetingLink
            ? `<p style="margin: 6px 0; color: #92400e; font-size: 14px;"><strong>Meeting Link:</strong> <a href="${meetingLink}" target="_blank" style="color: #2563eb; text-decoration: underline;">${meetingLink}</a></p>`
            : ""
        }
        ${
          mode === "Offline" && venue
            ? `<p style="margin: 4px 0; color: #92400e; font-size: 14px;"><strong>Location / Venue:</strong> ${venue}</p>`
            : ""
        }
        ${
          reason
            ? `<div style="margin-top: 10px; border-top: 1px dashed #fde68a; padding-top: 8px; color: #78350f; font-size: 13px;"><strong>Reason / Remarks:</strong> ${reason}</div>`
            : ""
        }
      </div>

      <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; text-align: center;">
        Placement Cell Management System • Automated Notification
      </div>
    </div>
  `;

  return sendEmail({ to, subject, html });
};

module.exports = {
  sendEmail,
  sendRoundClearedEmail,
  sendRoundRejectedEmail,
  sendRoundScheduledEmail,
  sendFinalSelectionEmail,
  sendInterviewScheduledEmail,
  sendInterviewRescheduledEmail,
};
