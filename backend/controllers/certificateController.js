const PDFDocument = require("pdfkit");
const nodemailer = require("nodemailer");
const path = require("path");
const fs = require("fs").promises;
const config = require("../config/config");

// Create a transporter using SMTP
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false // Only for development
  }
});

// Verify transporter configuration
transporter.verify(function (error, success) {
  if (error) {
    console.error("❌SMTP Configuration Error:", error);
  } else {
    console.log("✅SMTP Server is ready to take our messages");
  }
});

// Generate and send certificate asynchronously
exports.generateAndEmailCertificate = async (req, res) => {
  const { studentName, quizName, percentage, email } = req.body;

  // Validate required fields
  if (!studentName || !quizName || !email) {
    return res.status(400).json({ 
      success: false,
      message: "Missing required fields" 
    });
  }

  // Validate student name
  if (studentName.trim() === '') {
    return res.status(400).json({ 
      success: false,
      message: "Invalid student name" 
    });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ 
      success: false,
      message: "Invalid email format" 
    });
  }

  // Validate percentage
  if (percentage < 0 || percentage > 100) {
    return res.status(400).json({ 
      success: false,
      message: "Invalid percentage value" 
    });
  }

  try {
    // Check if template exists
    const templatePath = path.join(__dirname, "../assets/certificate_template.png");
    try {
      await fs.access(templatePath);
    } catch (error) {
      console.error("Certificate template not found:", error);
      return res.status(500).json({ 
        success: false,
        message: "Certificate template not found" 
      });
    }

    // Generate PDF with properly formatted name
    const formattedName = studentName.trim();
    const pdfBuffer = await generateCertificatePDF(
      formattedName,
      quizName,
      percentage,
    );

    // Send email
    try {
      await emailCertificate(email, formattedName, quizName, pdfBuffer);
      res.status(200).json({ 
        success: true,
        message: "Certificate generated and sent successfully" 
      });
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      // Save the PDF locally if email fails
      const fileName = `${quizName}_${formattedName.replace(/\s+/g, '_')}_${Date.now()}.pdf`;
      const filePath = path.join(__dirname, "../uploads/certificates", fileName);
      await fs.writeFile(filePath, pdfBuffer);
      
      res.status(200).json({ 
        success: true,
        message: "Certificate generated but email sending failed. Certificate saved locally.",
        certificatePath: filePath
      });
    }
  } catch (error) {
    console.error("Error generating or emailing certificate:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to generate or send certificate",
      error: error.message 
    });
  }
};

// Generate and download certificate directly
exports.generateAndDownloadCertificate = async (req, res) => {
  const { studentName, quizName, percentage } = req.body;

  // Validate required fields
  if (!studentName || !quizName) {
    return res.status(400).json({ 
      success: false,
      message: "Missing required fields" 
    });
  }

  // Validate student name
  if (studentName.trim() === '') {
    return res.status(400).json({ 
      success: false,
      message: "Invalid student name" 
    });
  }

  // Validate percentage
  if (percentage < 0 || percentage > 100) {
    return res.status(400).json({ 
      success: false,
      message: "Invalid percentage value" 
    });
  }

  try {
    // Check if template exists
    const templatePath = path.join(__dirname, "../assets/certificate_template.png");
    try {
      await fs.access(templatePath);
    } catch (error) {
      console.error("Certificate template not found:", error);
      return res.status(500).json({ 
        success: false,
        message: "Certificate template not found" 
      });
    }

    // Generate PDF with properly formatted name
    const formattedName = studentName.trim();
    const pdfBuffer = await generateCertificatePDF(
      formattedName,
      quizName,
      percentage,
    );

    // Set response headers for file download
    const fileName = `${quizName}_${formattedName.replace(/\s+/g, '_')}_${Date.now()}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Length', pdfBuffer.length);

    // Send the PDF buffer
    res.send(pdfBuffer);

  } catch (error) {
    console.error("Error generating certificate for download:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to generate certificate for download",
      error: error.message 
    });
  }
};

// Function to generate certificate PDF as a buffer
async function generateCertificatePDF(studentName, quizName, percentage) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ 
        layout: "landscape", 
        size: "A4",
        margins: { top: 0, bottom: 0, left: 0, right: 0 }
      });
      const buffers = [];

      // Event listeners to handle PDF generation
      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", () => resolve(Buffer.concat(buffers)));
      doc.on("error", reject);

      // Certificate template path
      const templatePath = path.join(__dirname, "../assets/certificate_template.png");
      
      // Add template image
      doc.image(templatePath, 0, 0, { width: 842 });

      // Add student name
      doc
        .font("Helvetica-Bold")
        .fontSize(36)
        .text(studentName, 0, 280, { 
          align: "center",
          width: 842
        });

      // Add quiz name
      doc
        .font("Helvetica")
        .fontSize(20)
        .text(`has successfully completed the ${quizName}`, 0, 330, { 
          align: "center",
          width: 842
        });

      // Add score
      doc
        .font("Helvetica")
        .fontSize(24)
        .text(`with a score of ${percentage}%`, 0, 370, { 
          align: "center",
          width: 842
        });

      // Add date
      const currentDate = new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      
      doc
        .fontSize(14)
        .text(currentDate, 640, 480, { 
          align: "right",
          width: 200
        });

      // Add certificate ID
      const certificateId = `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      doc
        .fontSize(12)
        .text(`Certificate ID: ${certificateId}`, 50, 480, {
          align: "left",
          width: 200
        });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

// Function to send email with the generated certificate
async function emailCertificate(email, studentName, quizName, pdfBuffer) {
  const mailOptions = {
    from: {
      name: "IPR Quiz ",
      address: config.emailUser || config.admin_email
    },
    to: email,
    subject: `Your Certificate for ${quizName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4a5568;">Congratulations, ${studentName}!</h2>
        <p style="color: #2d3748; font-size: 16px; line-height: 1.5;">
          You have successfully completed the ${quizName} and earned your certificate.
          Please find your certificate attached to this email.
        </p>
        <p style="color: #2d3748; font-size: 16px; line-height: 1.5;">
          Keep this certificate as proof of your achievement.
        </p>
        <div style="margin-top: 20px; padding: 15px; background-color: #f7fafc; border-radius: 5px;">
          <p style="color: #4a5568; margin: 0;">
            Best regards,<br>
            Outreach, IPR.
          </p>
        </div>
      </div>
    `,
    attachments: [
      {
        filename: `${quizName}_${studentName.replace(/\s+/g, '_')}.pdf`,
        content: pdfBuffer,
      },
    ],
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
}
